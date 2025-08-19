/**
 * Email Service - Postmark Integration
 * Transactional emails for authentication and alerts
 */

import * as postmark from "postmark"

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!)

export async function sendVerificationEmail(email: string, url: string) {
  try {
    const result = await client.sendEmailWithTemplate({
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: email,
      TemplateAlias: "email-verification", // Create this template in Postmark
      TemplateModel: {
        product_name: "Insider Pilot",
        login_url: url,
        support_email: "support@insiderpilot.com",
      },
    })
    
    console.log("Verification email sent:", result.MessageID)
    return result
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw error
  }
}

export async function sendAlertEmail(
  email: string,
  subject: string,
  transactions: any[]
) {
  try {
    const result = await client.sendEmailWithTemplate({
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: email,
      TemplateAlias: "alert-notification", // Create this template in Postmark
      TemplateModel: {
        subject,
        transactions,
        unsubscribe_url: `${process.env.NEXTAUTH_URL}/api/unsubscribe`,
        app_url: process.env.NEXTAUTH_URL,
      },
    })
    
    console.log("Alert email sent:", result.MessageID)
    return result
  } catch (error) {
    console.error("Error sending alert email:", error)
    throw error
  }
}