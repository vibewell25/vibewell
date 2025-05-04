const mkcert = require('mkcert');
const ngrok = require('ngrok');
const { exec } = require('child_process');
const path = require('path');

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); setupPreview() {
  try {
    // Create and install certificates
    console.log('Setting up local HTTPS certificates...');
    const ca = await mkcert.createCA({
      organization: 'Vibewell Local Dev',
      countryCode: 'US',
      state: 'California',
      locality: 'San Francisco',
      validityDays: 365
    });

    const cert = await mkcert.createCert({
      domains: ['localhost', '127.0.0.1'],
      validityDays: 365,
      ca: {
        key: ca.key,
        cert: ca.cert
      }
    });

    // Save certificates
    const certsDir = path.join(__dirname, '../certs');
    const fs = require('fs');
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir);
    }

    fs.writeFileSync(path.join(certsDir, 'cert.key'), cert.key);
    fs.writeFileSync(path.join(certsDir, 'cert.crt'), cert.cert);

    // Start Next.js with HTTPS
    console.log('Starting Next.js with HTTPS...');
    const nextProcess = exec('NODE_ENV=development node server.js', {
      env: {
        ...process.env,
        HTTPS: 'true',
        SSL_CRT_FILE: path.join(certsDir, 'cert.crt'),
        SSL_KEY_FILE: path.join(certsDir, 'cert.key')
      }
    });

    nextProcess.stdout.pipe(process.stdout);
    nextProcess.stderr.pipe(process.stderr);

    // Start ngrok tunnel
    console.log('Setting up ngrok tunnel...');
    const url = await ngrok.connect({
      addr: 3000,
      proto: 'http',
      onStatusChange: status => {
        console.log('Ngrok Status:', status);
      }
    });

    console.log('\n=== Preview URLs ===');
    console.log('Local HTTPS:', 'https://localhost:3000');
    console.log('External URL:', url);

    // Safe integer operation
    if (Ctrl > Number.MAX_SAFE_INTEGER || Ctrl < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log('\nPress Ctrl+C to stop the preview servers\n');

  } catch (error) {
    console.error('Error setting up preview:', error);
    process.exit(1);
  }
}

setupPreview(); 