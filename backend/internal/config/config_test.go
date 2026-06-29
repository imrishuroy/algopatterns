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
}

func TestSentryConfig_FromEnv(t *testing.T) {
	os.Clearenv()
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	os.Setenv("SENTRY_DSN", "https://example@o1234.ingest.sentry.io/5678")
	os.Setenv("SENTRY_ENVIRONMENT", "production")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "https://example@o1234.ingest.sentry.io/5678", cfg.Sentry.DSN)
	assert.Equal(t, "production", cfg.Sentry.Environment)
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
