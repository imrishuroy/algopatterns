package services

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/rs/zerolog/log"
)

type SubmissionService struct {
	submissionRepo *repository.SubmissionRepository
	problemRepo    *repository.ProblemRepository
	judgeService   *JudgeService
}

func NewSubmissionService(
	submissionRepo *repository.SubmissionRepository,
	problemRepo *repository.ProblemRepository,
	judgeService *JudgeService,
) *SubmissionService {
	return &SubmissionService{
		submissionRepo: submissionRepo,
		problemRepo:    problemRepo,
		judgeService:   judgeService,
	}
}

func (s *SubmissionService) Submit(ctx context.Context, userID uuid.UUID, req *models.SubmitCodeRequest) (*models.SubmissionResponse, error) {
	problem, err := s.problemRepo.GetByID(ctx, req.ProblemID)
	if err != nil {
		return nil, fmt.Errorf("problem not found: %w", err)
	}

	template, err := s.problemRepo.GetTemplate(ctx, problem.ID, req.LanguageID)
	if err != nil {
		return nil, fmt.Errorf("language not supported for this problem: %w", err)
	}

	testCases, err := s.problemRepo.GetTestCases(ctx, problem.ID, false)
	if err != nil {
		return nil, fmt.Errorf("failed to get test cases: %w", err)
	}
	if len(testCases) == 0 {
		return nil, fmt.Errorf("no test cases found for this problem")
	}

	submission := &models.Submission{
		UserID:         userID,
		ProblemID:      problem.ID,
		LanguageID:     req.LanguageID,
		Code:           req.Code,
		Status:         models.StatusProcessing,
		TestCasesTotal: len(testCases),
	}

	fullCode := s.wrapCode(req.Code, template.WrapperCode)

	var judge0Submissions []models.Judge0Submission
	for _, tc := range testCases {
		judge0Submissions = append(judge0Submissions, models.Judge0Submission{
			SourceCode:     fullCode,
			LanguageID:     req.LanguageID,
			Stdin:          tc.Input,
			ExpectedOutput: tc.ExpectedOutput,
		})
	}

	tokens, err := s.judgeService.SubmitBatch(ctx, judge0Submissions)
	if err != nil {
		log.Error().Err(err).Msg("Failed to submit to Judge0")
		submission.Status = models.StatusInternalError
		errMsg := "Failed to submit code for execution"
		submission.ErrorMessage = &errMsg
		if err := s.submissionRepo.Create(ctx, submission); err != nil {
			return nil, fmt.Errorf("failed to save submission: %w", err)
		}
		return &models.SubmissionResponse{Submission: *submission}, nil
	}

	submission.Judge0Tokens = tokens
	if err := s.submissionRepo.Create(ctx, submission); err != nil {
		return nil, fmt.Errorf("failed to save submission: %w", err)
	}

	results, err := s.judgeService.WaitForBatchResults(ctx, tokens)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get results from Judge0")
		submission.Status = models.StatusInternalError
		errMsg := "Timeout waiting for execution results"
		submission.ErrorMessage = &errMsg
		s.submissionRepo.Update(ctx, submission)
		return &models.SubmissionResponse{Submission: *submission}, nil
	}

	response := s.processResults(ctx, submission, testCases, results)
	return response, nil
}

// processedResult holds the extracted data from a single Judge0 result
type processedResult struct {
	status       models.SubmissionStatus
	actualOutput *string
	errorOutput  *string
	runtimeMs    *int
	memoryKb     *int
	runtime      float64
	memory       float64
}

// extractResultData extracts and normalizes data from a Judge0 result
func extractResultData(result models.Judge0Result) processedResult {
	pr := processedResult{}

	if result.Status != nil {
		pr.status = models.MapJudge0StatusToSubmissionStatus(result.Status.ID)
	} else {
		pr.status = models.StatusInternalError
	}

	if result.Stdout != nil {
		trimmed := strings.TrimSpace(*result.Stdout)
		pr.actualOutput = &trimmed
	}

	pr.errorOutput = extractErrorOutput(result)

	if result.Time != nil {
		if t, err := strconv.ParseFloat(*result.Time, 64); err == nil {
			ms := int(t * 1000)
			pr.runtimeMs = &ms
			pr.runtime = t * 1000
		}
	}

	if result.Memory != nil {
		kb := int(*result.Memory)
		pr.memoryKb = &kb
		pr.memory = *result.Memory
	}

	return pr
}

// extractErrorOutput gets the error message from various Judge0 result fields
func extractErrorOutput(result models.Judge0Result) *string {
	if result.Stderr != nil && *result.Stderr != "" {
		return result.Stderr
	}
	if result.CompileOutput != nil && *result.CompileOutput != "" {
		return result.CompileOutput
	}
	if result.Message != nil && *result.Message != "" {
		return result.Message
	}
	return nil
}

// checkCorrectness verifies if the actual output matches expected
func checkCorrectness(status models.SubmissionStatus, expected string, actual *string) models.SubmissionStatus {
	if status != models.StatusAccepted {
		return status
	}
	expectedTrimmed := strings.TrimSpace(expected)
	actualTrimmed := ""
	if actual != nil {
		actualTrimmed = *actual
	}
	if expectedTrimmed != actualTrimmed {
		return models.StatusWrongAnswer
	}
	return status
}

func (s *SubmissionService) processResults(
	ctx context.Context,
	submission *models.Submission,
	testCases []models.TestCase,
	results []models.Judge0Result,
) *models.SubmissionResponse {
	var passed int
	var totalRuntime, totalMemory float64
	var firstError *string
	var resultDetails []models.SubmissionResultDetail
	overallStatus := models.StatusAccepted

	for i, result := range results {
		if i >= len(testCases) {
			break
		}
		tc := testCases[i]
		pr := extractResultData(result)

		status := checkCorrectness(pr.status, tc.ExpectedOutput, pr.actualOutput)
		totalRuntime += pr.runtime
		totalMemory += pr.memory

		if status == models.StatusAccepted {
			passed++
		} else if overallStatus == models.StatusAccepted {
			overallStatus = status
			if pr.errorOutput != nil && firstError == nil {
				firstError = pr.errorOutput
			}
		}

		subResult := models.SubmissionResult{
			SubmissionID: submission.ID,
			TestCaseID:   tc.ID,
			Status:       status,
			ActualOutput: pr.actualOutput,
			RuntimeMs:    pr.runtimeMs,
			MemoryKb:     pr.memoryKb,
			ErrorOutput:  pr.errorOutput,
		}
		if err := s.submissionRepo.CreateResult(ctx, &subResult); err != nil {
			log.Error().Err(err).Msg("Failed to save submission result")
		}

		resultDetails = append(resultDetails, models.SubmissionResultDetail{
			SubmissionResult: subResult,
			Input:            tc.Input,
			ExpectedOutput:   tc.ExpectedOutput,
			IsSample:         tc.IsSample,
		})
	}

	submission.Status = overallStatus
	submission.TestCasesPassed = passed
	submission.ErrorMessage = firstError

	if len(results) > 0 {
		avgRuntime := int(totalRuntime / float64(len(results)))
		avgMemory := int(totalMemory / float64(len(results)))
		submission.RuntimeMs = &avgRuntime
		submission.MemoryKb = &avgMemory
	}

	if err := s.submissionRepo.Update(ctx, submission); err != nil {
		log.Error().Err(err).Msg("Failed to update submission")
	}

	return &models.SubmissionResponse{
		Submission: *submission,
		Results:    resultDetails,
	}
}

func (s *SubmissionService) RunCode(ctx context.Context, _ uuid.UUID, req *models.RunCodeRequest) (*models.RunCodeResponse, error) {
	template, err := s.problemRepo.GetTemplate(ctx, req.ProblemID, req.LanguageID)
	if err != nil {
		return nil, fmt.Errorf("language not supported for this problem: %w", err)
	}

	fullCode := s.wrapCode(req.Code, template.WrapperCode)

	testCases, err := s.getTestCasesForRun(ctx, req)
	if err != nil {
		return nil, err
	}

	judge0Submissions := s.buildJudge0Submissions(fullCode, req.LanguageID, testCases)

	tokens, err := s.judgeService.SubmitBatch(ctx, judge0Submissions)
	if err != nil {
		return nil, fmt.Errorf("failed to submit code: %w", err)
	}

	results, err := s.judgeService.WaitForBatchResults(ctx, tokens)
	if err != nil {
		return nil, fmt.Errorf("failed to get results: %w", err)
	}

	return s.buildRunCodeResponse(testCases, results, req.CustomInput), nil
}

// getTestCasesForRun gets test cases or creates one from custom input
func (s *SubmissionService) getTestCasesForRun(ctx context.Context, req *models.RunCodeRequest) ([]models.TestCase, error) {
	if req.CustomInput != nil && *req.CustomInput != "" {
		return []models.TestCase{{
			Input:          *req.CustomInput,
			ExpectedOutput: "",
			IsSample:       false,
		}}, nil
	}

	testCases, err := s.problemRepo.GetTestCases(ctx, req.ProblemID, true)
	if err != nil {
		return nil, fmt.Errorf("failed to get test cases: %w", err)
	}
	if len(testCases) == 0 {
		return nil, fmt.Errorf("no test cases found")
	}
	return testCases, nil
}

// buildJudge0Submissions creates Judge0 submission requests
func (s *SubmissionService) buildJudge0Submissions(fullCode string, languageID int, testCases []models.TestCase) []models.Judge0Submission {
	submissions := make([]models.Judge0Submission, 0, len(testCases))
	for _, tc := range testCases {
		submissions = append(submissions, models.Judge0Submission{
			SourceCode:     fullCode,
			LanguageID:     languageID,
			Stdin:          tc.Input,
			ExpectedOutput: tc.ExpectedOutput,
		})
	}
	return submissions
}

// buildRunCodeResponse constructs the response from Judge0 results
func (s *SubmissionService) buildRunCodeResponse(testCases []models.TestCase, results []models.Judge0Result, customInput *string) *models.RunCodeResponse {
	response := &models.RunCodeResponse{
		Results:    make([]models.RunCodeResult, 0, len(results)),
		TotalTests: len(testCases),
	}

	isCustom := customInput != nil && *customInput != ""

	for i, result := range results {
		if i >= len(testCases) {
			break
		}
		runResult := s.buildRunCodeResult(i, testCases[i], result, isCustom)
		if runResult.Status == models.StatusAccepted {
			response.TotalPassed++
		}
		response.Results = append(response.Results, runResult)
	}

	return response
}

// buildRunCodeResult creates a single run result from Judge0 result
func (s *SubmissionService) buildRunCodeResult(index int, tc models.TestCase, result models.Judge0Result, isCustom bool) models.RunCodeResult {
	runResult := models.RunCodeResult{
		TestCaseIndex:  index,
		Input:          tc.Input,
		ExpectedOutput: tc.ExpectedOutput,
		Status:         models.StatusAccepted,
		IsCustom:       isCustom,
	}

	if result.Status != nil {
		runResult.Status = models.MapJudge0StatusToSubmissionStatus(result.Status.ID)
	}

	s.populateRunResultOutput(&runResult, result)
	s.populateRunResultMetrics(&runResult, result)

	if runResult.Status == models.StatusAccepted && tc.ExpectedOutput != "" {
		if strings.TrimSpace(tc.ExpectedOutput) != runResult.ActualOutput {
			runResult.Status = models.StatusWrongAnswer
		}
	}

	return runResult
}

// populateRunResultOutput fills output fields from Judge0 result
func (s *SubmissionService) populateRunResultOutput(runResult *models.RunCodeResult, result models.Judge0Result) {
	if result.Stdout != nil {
		runResult.ActualOutput = strings.TrimSpace(*result.Stdout)
		runResult.Stdout = *result.Stdout
	}
	if result.Stderr != nil {
		runResult.Stderr = *result.Stderr
		if runResult.ErrorMessage == "" {
			runResult.ErrorMessage = *result.Stderr
		}
	}
	if result.CompileOutput != nil && *result.CompileOutput != "" {
		runResult.ErrorMessage = *result.CompileOutput
	}
	if result.Message != nil && *result.Message != "" && runResult.ErrorMessage == "" {
		runResult.ErrorMessage = *result.Message
	}
}

// populateRunResultMetrics fills runtime and memory from Judge0 result
func (s *SubmissionService) populateRunResultMetrics(runResult *models.RunCodeResult, result models.Judge0Result) {
	if result.Time != nil {
		if t, err := strconv.ParseFloat(*result.Time, 64); err == nil {
			runResult.RuntimeMs = int(t * 1000)
		}
	}
	if result.Memory != nil {
		runResult.MemoryKb = int(*result.Memory)
	}
}

func (s *SubmissionService) GetByID(ctx context.Context, userID, submissionID uuid.UUID) (*models.SubmissionResponse, error) {
	submission, err := s.submissionRepo.GetByID(ctx, submissionID)
	if err != nil {
		return nil, err
	}

	if submission.UserID != userID {
		return nil, repository.ErrNotFound
	}

	results, err := s.submissionRepo.GetResults(ctx, submissionID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get submission results")
	}

	return &models.SubmissionResponse{
		Submission: *submission,
		Results:    results,
	}, nil
}

func (s *SubmissionService) ListByUser(ctx context.Context, userID uuid.UUID, req *models.SubmissionListRequest) (*models.SubmissionListResponse, error) {
	submissions, total, err := s.submissionRepo.ListByUser(ctx, userID, req)
	if err != nil {
		return nil, err
	}

	totalPages := (total + req.Limit - 1) / req.Limit

	return &models.SubmissionListResponse{
		Submissions: submissions,
		Total:       total,
		Page:        req.Page,
		Limit:       req.Limit,
		TotalPages:  totalPages,
	}, nil
}

func (s *SubmissionService) ListByProblem(ctx context.Context, userID, problemID uuid.UUID) ([]models.Submission, error) {
	return s.submissionRepo.ListByProblem(ctx, userID, problemID, 10)
}

func (*SubmissionService) wrapCode(userCode, wrapperCode string) string {
	return strings.Replace(wrapperCode, "{{USER_CODE}}", userCode, 1)
}
