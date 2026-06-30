package sentry

import (
	"context"

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

func CaptureError(ctx context.Context, err error, tags map[string]string) {
	if err == nil {
		return
	}

	hub := sentry.GetHubFromContext(ctx)
	if hub == nil {
		hub = sentry.CurrentHub().Clone()
	}

	hub.WithScope(func(scope *sentry.Scope) {
		for k, v := range tags {
			scope.SetTag(k, v)
		}
		hub.CaptureException(err)
	})
}

func CaptureErrorWithContext(ctx context.Context, err error, tags map[string]string, contextData map[string]sentry.Context) {
	if err == nil {
		return
	}

	hub := sentry.GetHubFromContext(ctx)
	if hub == nil {
		hub = sentry.CurrentHub().Clone()
	}

	hub.WithScope(func(scope *sentry.Scope) {
		for k, v := range tags {
			scope.SetTag(k, v)
		}
		for name, data := range contextData {
			scope.SetContext(name, data)
		}
		hub.CaptureException(err)
	})
}

func CaptureErrorFromGin(c *gin.Context, err error, tags map[string]string) {
	if err == nil {
		return
	}

	hub := sentrygin.GetHubFromContext(c)
	if hub == nil {
		hub = sentry.CurrentHub().Clone()
	}

	hub.WithScope(func(scope *sentry.Scope) {
		for k, v := range tags {
			scope.SetTag(k, v)
		}
		if requestID, exists := c.Get("request_id"); exists {
			if rid, ok := requestID.(string); ok {
				scope.SetTag("request_id", rid)
			}
		}
		hub.CaptureException(err)
	})
}

func CaptureMessage(ctx context.Context, message string, level sentry.Level) {
	hub := sentry.GetHubFromContext(ctx)
	if hub == nil {
		hub = sentry.CurrentHub().Clone()
	}

	hub.WithScope(func(scope *sentry.Scope) {
		scope.SetLevel(level)
		hub.CaptureMessage(message)
	})
}

func AddBreadcrumb(ctx context.Context, category, message string, data map[string]interface{}) {
	hub := sentry.GetHubFromContext(ctx)
	if hub == nil {
		hub = sentry.CurrentHub()
	}

	hub.AddBreadcrumb(&sentry.Breadcrumb{
		Category: category,
		Message:  message,
		Data:     data,
		Level:    sentry.LevelInfo,
	}, nil)
}

func SetUser(ctx context.Context, id, email, username string) {
	hub := sentry.GetHubFromContext(ctx)
	if hub == nil {
		hub = sentry.CurrentHub()
	}

	hub.Scope().SetUser(sentry.User{
		ID:       id,
		Email:    email,
		Username: username,
	})
}

func SetUserFromGin(c *gin.Context, id, email, username string) {
	hub := sentrygin.GetHubFromContext(c)
	if hub == nil {
		hub = sentry.CurrentHub()
	}

	hub.Scope().SetUser(sentry.User{
		ID:       id,
		Email:    email,
		Username: username,
	})
}

func StartSpan(ctx context.Context, operation, description string) (*sentry.Span, context.Context) {
	span := sentry.StartSpan(ctx, operation)
	span.Description = description
	return span, span.Context()
}

func FinishSpan(span *sentry.Span) {
	if span != nil {
		span.Finish()
	}
}

func NewMeter(ctx context.Context) sentry.Meter {
	return sentry.NewMeter(ctx)
}

func NewLogger(ctx context.Context) sentry.Logger {
	return sentry.NewLogger(ctx)
}
