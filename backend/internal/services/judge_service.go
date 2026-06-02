package services

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/rs/zerolog/log"
)

type JudgeService struct {
	cfg        *config.Judge0Config
	httpClient *http.Client
}

func NewJudgeService(cfg *config.Judge0Config) *JudgeService {
	return &JudgeService{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

func (s *JudgeService) setAuthHeaders(req *http.Request) {
	if s.cfg.APIKey != "" {
		req.Header.Set("X-RapidAPI-Key", s.cfg.APIKey)
		req.Header.Set("X-RapidAPI-Host", "judge0-ce.p.rapidapi.com")
	}
}

func (s *JudgeService) Submit(ctx context.Context, submission *models.Judge0Submission) (string, error) {
	submission.CPUTimeLimit = s.cfg.CPUTimeLimit
	submission.WallTimeLimit = s.cfg.WallTimeLimit
	submission.MemoryLimit = s.cfg.MemoryLimit
	submission.StackLimit = s.cfg.StackLimit

	submission.SourceCode = base64.StdEncoding.EncodeToString([]byte(submission.SourceCode))
	if submission.Stdin != "" {
		submission.Stdin = base64.StdEncoding.EncodeToString([]byte(submission.Stdin))
	}
	if submission.ExpectedOutput != "" {
		submission.ExpectedOutput = base64.StdEncoding.EncodeToString([]byte(submission.ExpectedOutput))
	}

	body, err := json.Marshal(submission)
	if err != nil {
		return "", fmt.Errorf("failed to marshal submission: %w", err)
	}

	url := fmt.Sprintf("%s/submissions?base64_encoded=true&wait=false", s.cfg.BaseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	s.setAuthHeaders(req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to submit to judge0: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("judge0 returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var tokenResp models.Judge0TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", fmt.Errorf("failed to decode token response: %w", err)
	}

	return tokenResp.Token, nil
}

func (s *JudgeService) SubmitBatch(ctx context.Context, submissions []models.Judge0Submission) ([]string, error) {
	for i := range submissions {
		submissions[i].CPUTimeLimit = s.cfg.CPUTimeLimit
		submissions[i].WallTimeLimit = s.cfg.WallTimeLimit
		submissions[i].MemoryLimit = s.cfg.MemoryLimit
		submissions[i].StackLimit = s.cfg.StackLimit

		submissions[i].SourceCode = base64.StdEncoding.EncodeToString([]byte(submissions[i].SourceCode))
		if submissions[i].Stdin != "" {
			submissions[i].Stdin = base64.StdEncoding.EncodeToString([]byte(submissions[i].Stdin))
		}
		if submissions[i].ExpectedOutput != "" {
			submissions[i].ExpectedOutput = base64.StdEncoding.EncodeToString([]byte(submissions[i].ExpectedOutput))
		}
	}

	batchReq := models.Judge0BatchRequest{Submissions: submissions}
	body, err := json.Marshal(batchReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal batch submission: %w", err)
	}

	url := fmt.Sprintf("%s/submissions/batch?base64_encoded=true", s.cfg.BaseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	s.setAuthHeaders(req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to submit batch to judge0: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("judge0 returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var tokens []models.Judge0TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, fmt.Errorf("failed to decode batch response: %w", err)
	}

	result := make([]string, len(tokens))
	for i, t := range tokens {
		result[i] = t.Token
	}
	return result, nil
}

func (s *JudgeService) GetResult(ctx context.Context, token string) (*models.Judge0Result, error) {
	url := fmt.Sprintf("%s/submissions/%s?base64_encoded=true&fields=*", s.cfg.BaseURL, token)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	s.setAuthHeaders(req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get result from judge0: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("judge0 returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var result models.Judge0Result
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode result: %w", err)
	}

	s.decodeBase64Fields(&result)
	return &result, nil
}

func (s *JudgeService) GetBatchResults(ctx context.Context, tokens []string) ([]models.Judge0Result, error) {
	tokenStr := strings.Join(tokens, ",")
	url := fmt.Sprintf("%s/submissions/batch?tokens=%s&base64_encoded=true&fields=*", s.cfg.BaseURL, tokenStr)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	s.setAuthHeaders(req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get batch results from judge0: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("judge0 returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var batchResult models.Judge0BatchResult
	if err := json.NewDecoder(resp.Body).Decode(&batchResult); err != nil {
		return nil, fmt.Errorf("failed to decode batch results: %w", err)
	}

	for i := range batchResult.Submissions {
		s.decodeBase64Fields(&batchResult.Submissions[i])
	}

	return batchResult.Submissions, nil
}

func (s *JudgeService) WaitForResult(ctx context.Context, token string) (*models.Judge0Result, error) {
	deadline := time.Now().Add(s.cfg.MaxPollTime)

	for {
		if time.Now().After(deadline) {
			return nil, fmt.Errorf("timeout waiting for result")
		}

		result, err := s.GetResult(ctx, token)
		if err != nil {
			return nil, err
		}

		if result.Status != nil && models.IsJudge0StatusFinal(result.Status.ID) {
			return result, nil
		}

		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(s.cfg.PollInterval):
		}
	}
}

func (s *JudgeService) WaitForBatchResults(ctx context.Context, tokens []string) ([]models.Judge0Result, error) {
	deadline := time.Now().Add(s.cfg.MaxPollTime)

	for {
		if time.Now().After(deadline) {
			return nil, fmt.Errorf("timeout waiting for batch results")
		}

		results, err := s.GetBatchResults(ctx, tokens)
		if err != nil {
			return nil, err
		}

		allComplete := true
		for _, r := range results {
			if r.Status == nil || !models.IsJudge0StatusFinal(r.Status.ID) {
				allComplete = false
				break
			}
		}

		if allComplete {
			return results, nil
		}

		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(s.cfg.PollInterval):
		}
	}
}

func (*JudgeService) decodeBase64Fields(result *models.Judge0Result) {
	if result.Stdout != nil {
		if decoded, err := base64.StdEncoding.DecodeString(*result.Stdout); err == nil {
			str := string(decoded)
			result.Stdout = &str
		}
	}
	if result.Stderr != nil {
		if decoded, err := base64.StdEncoding.DecodeString(*result.Stderr); err == nil {
			str := string(decoded)
			result.Stderr = &str
		}
	}
	if result.CompileOutput != nil {
		if decoded, err := base64.StdEncoding.DecodeString(*result.CompileOutput); err == nil {
			str := string(decoded)
			result.CompileOutput = &str
		}
	}
	if result.Message != nil {
		if decoded, err := base64.StdEncoding.DecodeString(*result.Message); err == nil {
			str := string(decoded)
			result.Message = &str
		}
	}
}

func (s *JudgeService) HealthCheck(ctx context.Context) error {
	url := fmt.Sprintf("%s/system_info", s.cfg.BaseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	s.setAuthHeaders(req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("judge0 health check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("judge0 returned status %d", resp.StatusCode)
	}

	log.Info().Msg("Judge0 health check passed")
	return nil
}
