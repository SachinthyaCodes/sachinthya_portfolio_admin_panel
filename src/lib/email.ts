import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface InquiryEmailData {
  name: string
  email: string
  subject: string
  message: string
  createdAt?: string
}

/**
 * Send email notification when a new inquiry is received
 * @param inquiryData - The inquiry details
 * @param adminEmail - The admin email to send notification to
 * @returns Promise<boolean> - Success status
 */
export async function sendNewInquiryNotification(
  inquiryData: InquiryEmailData,
  adminEmail: string = process.env.ADMIN_EMAIL || 'admin@sachinthya.dev'
): Promise<boolean> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@sachinthya.dev'
    
    console.log('📧 Sending inquiry notification email...')

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New Portfolio Inquiry: ${inquiryData.subject}`,
      html: generateInquiryEmailHTML(inquiryData),
      text: generateInquiryEmailText(inquiryData)
    })

    if (error) {
      console.error('❌ Email send error:', error)
      return false
    }

    console.log('✅ Inquiry notification email sent successfully:', data?.id)
    return true

  } catch (error) {
    console.error('❌ Email notification failed:', error)
    return false
  }
}

/**
 * Generate HTML email template for new inquiry notification
 */
function generateInquiryEmailHTML(inquiry: InquiryEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .field {
      margin-bottom: 20px;
    }
    .field-label {
      font-weight: 600;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .field-value {
      color: #333;
      font-size: 16px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #667eea;
    }
    .message-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 4px;
      border-left: 3px solid #667eea;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Portfolio Inquiry</h1>
    </div>
    
    <div class="field">
      <div class="field-label">From</div>
      <div class="field-value">
        <strong>${escapeHtml(inquiry.name)}</strong>
        <br>
        <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a>
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">Subject</div>
      <div class="field-value">${escapeHtml(inquiry.subject)}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Message</div>
      <div class="message-box">${escapeHtml(inquiry.message)}</div>
    </div>
    
    ${inquiry.createdAt ? `
    <div class="field">
      <div class="field-label">Received</div>
      <div class="field-value">${new Date(inquiry.createdAt).toLocaleString()}</div>
    </div>
    ` : ''}
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://admin.sachinthya.dev'}/dashboard/inquiries" class="button">
        View in Dashboard
      </a>
    </div>
    
    <div class="footer">
      <p>This is an automated notification from your Portfolio Admin Panel.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text email template for new inquiry notification
 */
function generateInquiryEmailText(inquiry: InquiryEmailData): string {
  return `
NEW PORTFOLIO INQUIRY
=====================

From: ${inquiry.name} <${inquiry.email}>
Subject: ${inquiry.subject}
${inquiry.createdAt ? `Received: ${new Date(inquiry.createdAt).toLocaleString()}` : ''}

MESSAGE:
--------
${inquiry.message}

---
View in Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://admin.sachinthya.dev'}/dashboard/inquiries

This is an automated notification from your Portfolio Admin Panel.
  `.trim()
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
