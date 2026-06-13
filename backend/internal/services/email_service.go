package services

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"net/smtp"
	"time"

	"github.com/imrishuroy/algopatterns/internal/models"
)

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	FromEmail    string
	FromName     string
	Enabled      bool
}

type EmailService struct {
	config    EmailConfig
	templates map[string]*template.Template
}

func NewEmailService(config EmailConfig) *EmailService {
	svc := &EmailService{
		config:    config,
		templates: make(map[string]*template.Template),
	}
	svc.loadTemplates()
	return svc
}

func (s *EmailService) loadTemplates() {
	s.templates["welcome"] = template.Must(template.New("welcome").Parse(welcomeEmailTemplate))
	s.templates["receipt"] = template.Must(template.New("receipt").Parse(receiptEmailTemplate))
	s.templates["expiring"] = template.Must(template.New("expiring").Parse(expiringEmailTemplate))
}

func (s *EmailService) SendWelcomeEmail(ctx context.Context, email, name, planName string) error {
	if !s.config.Enabled {
		return nil
	}

	data := map[string]string{
		"Name":     name,
		"PlanName": planName,
		"Year":     fmt.Sprintf("%d", time.Now().Year()),
	}

	return s.sendEmail(email, "Welcome to AlgoPatterns Pro! 🎉", "welcome", data)
}

func (s *EmailService) SendReceiptEmail(ctx context.Context, email, name string, payment *models.Payment, plan *models.SubscriptionPlan) error {
	if !s.config.Enabled {
		return nil
	}

	data := map[string]interface{}{
		"Name":        name,
		"PlanName":    plan.Name,
		"Amount":      fmt.Sprintf("₹%.2f", float64(payment.Amount)/100),
		"PaymentID":   payment.RazorpayPaymentID,
		"PaymentDate": payment.CreatedAt.Format("January 2, 2006"),
		"Year":        fmt.Sprintf("%d", time.Now().Year()),
	}

	return s.sendEmail(email, "Payment Receipt - AlgoPatterns", "receipt", data)
}

func (s *EmailService) SendExpiringEmail(ctx context.Context, email, name string, expiresAt time.Time, planName string) error {
	if !s.config.Enabled {
		return nil
	}

	daysLeft := int(time.Until(expiresAt).Hours() / 24)
	data := map[string]interface{}{
		"Name":       name,
		"PlanName":   planName,
		"ExpiresAt":  expiresAt.Format("January 2, 2006"),
		"DaysLeft":   daysLeft,
		"RenewalURL": "https://algopatterns.in/pricing",
		"Year":       fmt.Sprintf("%d", time.Now().Year()),
	}

	return s.sendEmail(email, "Your AlgoPatterns subscription is expiring soon", "expiring", data)
}

func (s *EmailService) sendEmail(to, subject, templateName string, data interface{}) error {
	tmpl, ok := s.templates[templateName]
	if !ok {
		return fmt.Errorf("template %s not found", templateName)
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute template: %w", err)
	}

	msg := fmt.Sprintf("From: %s <%s>\r\n"+
		"To: %s\r\n"+
		"Subject: %s\r\n"+
		"MIME-Version: 1.0\r\n"+
		"Content-Type: text/html; charset=utf-8\r\n"+
		"\r\n"+
		"%s",
		s.config.FromName, s.config.FromEmail,
		to,
		subject,
		body.String(),
	)

	auth := smtp.PlainAuth("", s.config.SMTPUser, s.config.SMTPPassword, s.config.SMTPHost)
	addr := fmt.Sprintf("%s:%s", s.config.SMTPHost, s.config.SMTPPort)

	return smtp.SendMail(addr, auth, s.config.FromEmail, []string{to}, []byte(msg))
}

const welcomeEmailTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 640px; background-color: #1f2937; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; border-bottom: 1px solid #374151;">
                            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">AlgoPatterns</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px; font-size: 15px; color: #9ca3af;">Hi {{.Name}},</p>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #e5e7eb;">
                                Thank you for upgrading to <span style="color: #10b981; font-weight: 500;">{{.PlanName}}</span>! You now have full access to everything AlgoPatterns has to offer:
                            </p>
                            <!-- Feature List -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                                <tr><td style="padding: 6px 0; font-size: 14px; color: #e5e7eb;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>All 15+ algorithm patterns with detailed tutorials</td></tr>
                                <tr><td style="padding: 6px 0; font-size: 14px; color: #e5e7eb;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>60+ interactive visualizers</td></tr>
                                <tr><td style="padding: 6px 0; font-size: 14px; color: #e5e7eb;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>Complete quiz system with history tracking</td></tr>
                                <tr><td style="padding: 6px 0; font-size: 14px; color: #e5e7eb;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>Code playground with execution</td></tr>
                                <tr><td style="padding: 6px 0; font-size: 14px; color: #e5e7eb;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>Problem solutions and explanations</td></tr>
                                <tr><td style="padding: 6px 0; font-size: 14px; color: #e5e7eb;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>Highlighting and note-taking</td></tr>
                                <tr><td style="padding: 6px 0; font-size: 14px; color: #e5e7eb;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>All future patterns and features</td></tr>
                            </table>
                            <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #e5e7eb;">
                                Start mastering DSA patterns today:
                            </p>
                            <a href="https://algopatterns.in" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">Go to Dashboard</a>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid #374151;">
                            <p style="margin: 0; font-size: 13px; color: #6b7280;">
                                Questions? Reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 24px 0 0; font-size: 12px; color: #4b5563;">© {{.Year}} AlgoPatterns</p>
            </td>
        </tr>
    </table>
</body>
</html>`

const receiptEmailTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 640px; background-color: #1f2937; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; border-bottom: 1px solid #374151;">
                            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">AlgoPatterns</p>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #9ca3af;">Payment Receipt</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px; font-size: 15px; color: #9ca3af;">Hi {{.Name}},</p>
                            <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #e5e7eb;">
                                Thank you for your payment. Here's your receipt.
                            </p>
                            <!-- Receipt Details -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #374151;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">Plan</p>
                                        <p style="margin: 4px 0 0; font-size: 15px; color: #ffffff;">{{.PlanName}}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #374151;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">Amount</p>
                                        <p style="margin: 4px 0 0; font-size: 15px; color: #10b981; font-weight: 500;">{{.Amount}}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #374151;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">Date</p>
                                        <p style="margin: 4px 0 0; font-size: 15px; color: #ffffff;">{{.PaymentDate}}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">Payment ID</p>
                                        <p style="margin: 4px 0 0; font-size: 13px; color: #ffffff; font-family: monospace;">{{.PaymentID}}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid #374151;">
                            <p style="margin: 0; font-size: 13px; color: #6b7280;">
                                Questions? Reply to this email or contact hello@algopatterns.in
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 24px 0 0; font-size: 12px; color: #4b5563;">© {{.Year}} AlgoPatterns</p>
            </td>
        </tr>
    </table>
</body>
</html>`

const expiringEmailTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 640px; background-color: #1f2937; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; border-bottom: 1px solid #374151;">
                            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">AlgoPatterns</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px; font-size: 15px; color: #9ca3af;">Hi {{.Name}},</p>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #e5e7eb;">
                                Your <span style="color: #ffffff; font-weight: 500;">{{.PlanName}}</span> subscription expires on <span style="color: #f59e0b;">{{.ExpiresAt}}</span>.
                            </p>
                            <!-- Alert Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 8px; margin-bottom: 28px;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="margin: 0; font-size: 32px; font-weight: 600; color: #f59e0b;">{{.DaysLeft}}</p>
                                        <p style="margin: 4px 0 0; font-size: 14px; color: #9ca3af;">days remaining</p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #e5e7eb;">
                                Renew to keep access to all patterns, visualizers, and features.
                            </p>
                            <a href="{{.RenewalURL}}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">Renew Subscription</a>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid #374151;">
                            <p style="margin: 0; font-size: 13px; color: #6b7280;">
                                Questions? Reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 24px 0 0; font-size: 12px; color: #4b5563;">© {{.Year}} AlgoPatterns</p>
            </td>
        </tr>
    </table>
</body>
</html>`
