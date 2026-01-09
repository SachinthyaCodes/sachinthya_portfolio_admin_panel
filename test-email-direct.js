// Direct test of email functionality
const { Resend } = require('resend');
const fs = require('fs');

// Manually load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');
envLines.forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('\n🔧 Email Configuration:');
  console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set (re_' + process.env.RESEND_API_KEY.substring(3, 10) + '...)' : '❌ Not set');
  console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Not set');
  console.log('  ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Not set');
  console.log('\n📧 Sending test email...\n');

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@sachinthya.me',
      to: process.env.ADMIN_EMAIL || 'admin@sachinthya.me',
      subject: 'Test Email from Portfolio Admin - Direct Test',
      html: `
        <h1 style="color: #667eea;">Test Email</h1>
        <p>This is a direct test of the email notification system.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If you're seeing this, email notifications are working! ✅</p>
      `,
      text: `Test Email\n\nThis is a direct test of the email notification system.\nTime: ${new Date().toLocaleString()}\n\nIf you're seeing this, email notifications are working!`
    });

    if (error) {
      console.error('❌ Error sending email:');
      console.error(JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', data?.id);
    console.log('\n📬 Check your inbox at:', process.env.ADMIN_EMAIL);
    console.log('   Check Resend dashboard: https://resend.com/emails/' + data?.id);
    console.log('\n💡 If not received:');
    console.log('   1. Check spam/junk folder');
    console.log('   2. Verify domain is verified in Resend');
    console.log('   3. Check Resend dashboard for delivery status\n');

  } catch (error) {
    console.error('❌ Exception:');
    console.error(error);
    process.exit(1);
  }
}

testEmail();
