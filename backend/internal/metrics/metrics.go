package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// Payment operations
	OrdersCreatedTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "algopatterns_orders_created_total",
			Help: "Total number of orders created",
		},
		[]string{"plan", "status"},
	)

	PaymentsProcessedTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "algopatterns_payments_processed_total",
			Help: "Total number of payments processed",
		},
		[]string{"plan", "method", "status"},
	)

	SubscriptionsActivatedTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "algopatterns_subscriptions_activated_total",
			Help: "Total number of subscriptions activated",
		},
		[]string{"plan"},
	)

	SubscriptionsCancelledTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "algopatterns_subscriptions_cancelled_total",
			Help: "Total number of subscriptions cancelled",
		},
		[]string{"reason"},
	)

	// Webhook processing
	WebhooksReceivedTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "algopatterns_webhooks_received_total",
			Help: "Total number of webhooks received",
		},
		[]string{"event_type"},
	)

	WebhooksProcessedTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "algopatterns_webhooks_processed_total",
			Help: "Total number of webhooks processed",
		},
		[]string{"event_type", "status"},
	)

	WebhookProcessingDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "algopatterns_webhook_processing_duration_seconds",
			Help:    "Duration of webhook processing in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"event_type"},
	)

	// Razorpay API
	RazorpayRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "algopatterns_razorpay_requests_total",
			Help: "Total number of Razorpay API requests",
		},
		[]string{"endpoint", "status"},
	)

	RazorpayRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "algopatterns_razorpay_request_duration_seconds",
			Help:    "Duration of Razorpay API requests in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"endpoint"},
	)

	// Idempotency
	IdempotencyHitsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "algopatterns_idempotency_hits_total",
			Help: "Total number of idempotency cache hits",
		},
	)

	IdempotencyConflictsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "algopatterns_idempotency_conflicts_total",
			Help: "Total number of idempotency conflicts",
		},
	)
)

// Init registers all metrics with the default Prometheus registry.
// This function is called automatically via promauto, but can be called
// explicitly to ensure all metrics are initialized at startup.
func Init() {
	// Metrics are auto-registered via promauto.
	// This function exists to provide an explicit initialization point
	// and to ensure the metrics package is imported in main.go
}
