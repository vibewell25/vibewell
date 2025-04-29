import { EmailService } from '@/lib/email';

async function testEmail() {
  try {
    await EmailService.send({
      to: 'your.email@gmail.com', // Replace with your email
      subject: 'VibeWell Email Test',
      html: `
        <h1>Test Email from VibeWell</h1>
        <p>If you're seeing this, email sending is working correctly!</p>
      `,
      text: 'Test Email from VibeWell\n\nIf you\'re seeing this, email sending is working correctly!',
    });
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

testEmail(); 