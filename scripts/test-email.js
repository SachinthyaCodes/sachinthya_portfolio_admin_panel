#!/usr/bin/env node

/**
 * Test Email Notification System
 * 
 * This script tests the email notification system by submitting a test inquiry.
 * 
 * Usage:
 *   node scripts/test-email.js [API_URL]
 * 
 * Examples:
 *   node scripts/test-email.js                           # Uses http://localhost:3000
 *   node scripts/test-email.js https://your-app.vercel.app
 */

const API_URL = process.argv[2] || 'http://localhost:3000'

async function testEmailNotification() {
  console.log('\n📧 Testing Email Notification System\n')
  console.log(`Target API: ${API_URL}/api/inquiries\n`)

  const testInquiry = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Email Notification',
    message: `This is a test inquiry submitted at ${new Date().toLocaleString()} to verify the email notification system is working correctly.`
  }

  console.log('📝 Test Inquiry Data:')
  console.log(JSON.stringify(testInquiry, null, 2))
  console.log('\n🚀 Submitting inquiry...\n')

  try {
    const response = await fetch(`${API_URL}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInquiry)
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Success! Inquiry submitted successfully.\n')
      console.log('Response:', JSON.stringify(data, null, 2))
      console.log('\n📬 Check your email inbox for the notification!')
      console.log(`   Email should be sent to: ${process.env.ADMIN_EMAIL || 'admin@sachinthya.dev'}`)
      console.log('\n💡 Tips:')
      console.log('   - Check spam folder if not in inbox')
      console.log('   - Verify Resend dashboard for send status')
      console.log('   - Check application logs for any errors')
    } else {
      console.error('❌ Error! Failed to submit inquiry.\n')
      console.error('Status:', response.status)
      console.error('Response:', JSON.stringify(data, null, 2))
      console.error('\n🔍 Troubleshooting:')
      console.error('   - Ensure the API server is running')
      console.error('   - Check if all required fields are provided')
      console.error('   - Verify environment variables are set')
    }

  } catch (error) {
    console.error('❌ Request Failed!\n')
    console.error('Error:', error.message)
    console.error('\n🔍 Troubleshooting:')
    console.error('   - Is the server running?')
    console.error('   - Is the URL correct?')
    console.error('   - Check your internet connection')
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

// Check if running in browser environment
if (typeof window === 'undefined') {
  testEmailNotification().catch(console.error)
} else {
  console.error('This script must be run in Node.js, not in a browser')
}
