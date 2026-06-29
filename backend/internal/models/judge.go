package models

// Judge0 API request/response structures
// https://ce.judge0.com/

type Judge0Submission struct {
	SourceCode     string  `json:"source_code"`
	LanguageID     int     `json:"language_id"`
	Stdin          string  `json:"stdin,omitempty"`
	ExpectedOutput string  `json:"expected_output,omitempty"`
	CPUTimeLimit   float64 `json:"cpu_time_limit,omitempty"`
	CPUExtraTime   float64 `json:"cpu_extra_time,omitempty"`
	WallTimeLimit  float64 `json:"wall_time_limit,omitempty"`
	MemoryLimit    int     `json:"memory_limit,omitempty"`
	StackLimit     int     `json:"stack_limit,omitempty"`
	MaxFileSize    int     `json:"max_file_size,omitempty"`
	EnableNetwork  bool    `json:"enable_network,omitempty"`
	CallbackURL    string  `json:"callback_url,omitempty"`
}

type Judge0BatchRequest struct {
	Submissions []Judge0Submission `json:"submissions"`
}

type Judge0TokenResponse struct {
	Token string `json:"token"`
}

type Judge0BatchResponse struct {
	Tokens []Judge0TokenResponse `json:"tokens,omitempty"`
}

type Judge0Status struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
}

type Judge0Result struct {
	Token         string        `json:"token,omitempty"`
	Stdout        *string       `json:"stdout"`
	Stderr        *string       `json:"stderr"`
	CompileOutput *string       `json:"compile_output"`
	Message       *string       `json:"message"`
	ExitCode      *int          `json:"exit_code"`
	ExitSignal    *int          `json:"exit_signal"`
	Status        *Judge0Status `json:"status"`
	Time          *string       `json:"time"`
	WallTime      *string       `json:"wall_time"`
	Memory        *float64      `json:"memory"`
}

type Judge0BatchResult struct {
	Submissions []Judge0Result `json:"submissions"`
}

// Judge0 status IDs
const (
	Judge0StatusInQueue             = 1
	Judge0StatusProcessing          = 2
	Judge0StatusAccepted            = 3
	Judge0StatusWrongAnswer         = 4
	Judge0StatusTimeLimitExceeded   = 5
	Judge0StatusCompilationError    = 6
	Judge0StatusRuntimeErrorSIGSEGV = 7
	Judge0StatusRuntimeErrorSIGXFSZ = 8
	Judge0StatusRuntimeErrorSIGFPE  = 9
	Judge0StatusRuntimeErrorSIGABRT = 10
	Judge0StatusRuntimeErrorNZEC    = 11
	Judge0StatusRuntimeErrorOther   = 12
	Judge0StatusInternalError       = 13
	Judge0StatusExecFormatError     = 14
)

func MapJudge0StatusToSubmissionStatus(statusID int) SubmissionStatus {
	switch statusID {
	case Judge0StatusInQueue, Judge0StatusProcessing:
		return StatusProcessing
	case Judge0StatusAccepted:
		return StatusAccepted
	case Judge0StatusWrongAnswer:
		return StatusWrongAnswer
	case Judge0StatusTimeLimitExceeded:
		return StatusTimeLimitExceeded
	case Judge0StatusCompilationError:
		return StatusCompilationError
	case Judge0StatusRuntimeErrorSIGSEGV, Judge0StatusRuntimeErrorSIGXFSZ,
		Judge0StatusRuntimeErrorSIGFPE, Judge0StatusRuntimeErrorSIGABRT,
		Judge0StatusRuntimeErrorNZEC, Judge0StatusRuntimeErrorOther,
		Judge0StatusExecFormatError:
		return StatusRuntimeError
	case Judge0StatusInternalError:
		return StatusInternalError
	default:
		return StatusInternalError
	}
}

func IsJudge0StatusFinal(statusID int) bool {
	return statusID != Judge0StatusInQueue && statusID != Judge0StatusProcessing
}
