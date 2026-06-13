package main

import (
	"bytes"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"time"
)

func main() {
	outputDir := "/tmp/email-previews"
	os.MkdirAll(outputDir, 0755)

	// Welcome email
	welcomeData := map[string]string{
		"Name":     "Prince",
		"PlanName": "Pro Lifetime",
		"Year":     fmt.Sprintf("%d", time.Now().Year()),
	}
	renderTemplate("welcome", welcomeEmailTemplate, welcomeData, outputDir)

	// Receipt email
	receiptData := map[string]interface{}{
		"Name":        "Prince",
		"PlanName":    "Pro Lifetime",
		"Amount":      "₹2,950.00",
		"PaymentID":   "pay_Ssv0Ykby9jbF3N",
		"PaymentDate": "May 24, 2026",
		"Year":        fmt.Sprintf("%d", time.Now().Year()),
	}
	renderTemplate("receipt", receiptEmailTemplate, receiptData, outputDir)

	// Expiring email
	expiringData := map[string]interface{}{
		"Name":       "Prince",
		"PlanName":   "Pro Yearly",
		"ExpiresAt":  "June 24, 2026",
		"DaysLeft":   7,
		"RenewalURL": "https://algopatterns.in/pricing",
		"Year":       fmt.Sprintf("%d", time.Now().Year()),
	}
	renderTemplate("expiring", expiringEmailTemplate, expiringData, outputDir)

	fmt.Printf("\nEmail previews saved to %s\n", outputDir)
	fmt.Println("Open in browser:")
	fmt.Printf("  open %s/welcome.html\n", outputDir)
	fmt.Printf("  open %s/receipt.html\n", outputDir)
	fmt.Printf("  open %s/expiring.html\n", outputDir)
}

func renderTemplate(name, tmplStr string, data interface{}, outputDir string) {
	tmpl := template.Must(template.New(name).Parse(tmplStr))
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		fmt.Printf("Error rendering %s: %v\n", name, err)
		return
	}

	outputPath := filepath.Join(outputDir, name+".html")
	if err := os.WriteFile(outputPath, buf.Bytes(), 0644); err != nil {
		fmt.Printf("Error writing %s: %v\n", name, err)
		return
	}
	fmt.Printf("Created %s\n", outputPath)
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
