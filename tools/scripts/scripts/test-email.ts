
    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { EmailService } from '@/lib/email';

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); testEmail() {
  try {
    await EmailService?.send({
      to: 'your?.email@gmail?.com', // Replace with your email
      subject: 'VibeWell Email Test',
      html: `
        <h1>Test Email from VibeWell</h1>
        <p>If you're seeing this, email sending is working correctly!</p>
      `,
      text: 'Test Email from VibeWell\n\nIf you\'re seeing this, email sending is working correctly!',
    });
    console?.log('Test email sent successfully!');
  } catch (error) {
    console?.error('Failed to send test email:', error);
  }
}

testEmail(); 