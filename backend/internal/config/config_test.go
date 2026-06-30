package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSentryConfig_Defaults(t *testing.T) {
	os.Clearenv()
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "", cfg.Sentry.DSN)
	assert.Equal(t, "development", cfg.Sentry.Environment)
	assert.Equal(t, "", cfg.Sentry.Release)
	assert.False(t, cfg.Sentry.Debug)
	assert.Equal(t, 1.0, cfg.Sentry.SampleRate)
	assert.Equal(t, 0.1, cfg.Sentry.TracesSampleRate)
	assert.True(t, cfg.Sentry.EnableTracing)
	assert.True(t, cfg.Sentry.AttachStacktrace)
	assert.False(t, cfg.Sentry.SendDefaultPII)
	assert.Equal(t, 100, cfg.Sentry.MaxBreadcrumbs)
	assert.False(t, cfg.Sentry.DisableLogs)
	assert.False(t, cfg.Sentry.DisableMetrics)
	assert.True(t, cfg.Sentry.TracePropagation)
	assert.Equal(t, 1000, cfg.Sentry.MaxSpans)
}

func TestSentryConfig_FromEnv(t *testing.T) {
	os.Clearenv()
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	os.Setenv("SENTRY_DSN", "https://example@o1234.ingest.sentry.io/5678")
	os.Setenv("SENTRY_ENVIRONMENT", "production")
	os.Setenv("SENTRY_RELEASE", "v1.2.3")
	os.Setenv("SENTRY_DEBUG", "true")
	os.Setenv("SENTRY_SAMPLE_RATE", "0.5")
	os.Setenv("SENTRY_TRACES_SAMPLE_RATE", "0.2")
	os.Setenv("SENTRY_ENABLE_TRACING", "true")
	os.Setenv("SENTRY_ATTACH_STACKTRACE", "false")
	os.Setenv("SENTRY_SEND_DEFAULT_PII", "true")
	os.Setenv("SENTRY_MAX_BREADCRUMBS", "50")
	os.Setenv("SENTRY_DISABLE_LOGS", "true")
	os.Setenv("SENTRY_DISABLE_METRICS", "true")
	os.Setenv("SENTRY_MAX_SPANS", "500")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "https://example@o1234.ingest.sentry.io/5678", cfg.Sentry.DSN)
	assert.Equal(t, "production", cfg.Sentry.Environment)
	assert.Equal(t, "v1.2.3", cfg.Sentry.Release)
	assert.True(t, cfg.Sentry.Debug)
	assert.Equal(t, 0.5, cfg.Sentry.SampleRate)
	assert.Equal(t, 0.2, cfg.Sentry.TracesSampleRate)
	assert.True(t, cfg.Sentry.EnableTracing)
	assert.False(t, cfg.Sentry.AttachStacktrace)
	assert.True(t, cfg.Sentry.SendDefaultPII)
	assert.Equal(t, 50, cfg.Sentry.MaxBreadcrumbs)
	assert.True(t, cfg.Sentry.DisableLogs)
	assert.True(t, cfg.Sentry.DisableMetrics)
	assert.Equal(t, 500, cfg.Sentry.MaxSpans)
}

func TestSentryConfig_EmptyDSN(t *testing.T) {
	os.Clearenv()
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	os.Setenv("SENTRY_DSN", "")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "", cfg.Sentry.DSN)
	assert.Equal(t, "development", cfg.Sentry.Environment)
}

func TestSentryConfig_ProductionEnvironment(t *testing.T) {
	os.Clearenv()
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	os.Setenv("SENTRY_ENVIRONMENT", "staging")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "staging", cfg.Sentry.Environment)
}

func TestConfig_HasSentryField(t *testing.T) {
	os.Clearenv()
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "", cfg.Sentry.DSN)
	assert.Equal(t, "development", cfg.Sentry.Environment)
}
