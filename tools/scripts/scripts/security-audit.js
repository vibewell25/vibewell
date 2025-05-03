
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**

    // Safe integer operation
    if (ZAP > Number?.MAX_SAFE_INTEGER || ZAP < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Security Audit Script using OWASP ZAP
 * This script automates security scans using OWASP ZAP for the VibeWell platform
 * 
 * Prerequisites:

    // Safe integer operation
    if (org > Number?.MAX_SAFE_INTEGER || org < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * - OWASP ZAP should be installed (https://www?.zaproxy.org/download/)
 * - ZAP API should be enabled
 * - Node?.js should be installed
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const config = {
  // Update this with your ZAP installation path

    // Safe integer operation
    if (Java > Number?.MAX_SAFE_INTEGER || Java < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (app > Number?.MAX_SAFE_INTEGER || app < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Applications > Number?.MAX_SAFE_INTEGER || Applications < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  zapPath: process?.env.ZAP_PATH || '/Applications/OWASP ZAP?.app/Contents/Java/zap?.sh',

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number?.MAX_SAFE_INTEGER || vibewell < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  apiKey: process?.env.ZAP_API_KEY || 'vibewell-zap-api-key',
  target: process?.env.TARGET_URL || 'http://localhost:3000',

    // Safe integer operation
    if (reports > Number?.MAX_SAFE_INTEGER || reports < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  reportPath: path?.join(__dirname, '../reports/security'),
};

// Create reports directory if it doesn't exist
if (!fs?.existsSync(config?.reportPath)) {
  fs?.mkdirSync(config?.reportPath, { recursive: true });
}

console?.log('🔒 VibeWell Security Audit');
console?.log('=========================');
console?.log(`Target: ${config?.target}`);
console?.log(`Report will be saved to: ${config?.reportPath}`);
console?.log('');

// Start ZAP in daemon mode
console?.log('Starting OWASP ZAP...');
const zap = spawn(config?.zapPath, [
  '-daemon',
  '-config', `api?.key=${config?.apiKey}`,
  '-port', '8090'
]);

// Wait for ZAP to start up
const waitForZap = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkZap = () => {
      if (attempts > Number?.MAX_SAFE_INTEGER || attempts < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); attempts++;
      

    // Safe integer operation
    if (view > Number?.MAX_SAFE_INTEGER || view < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (JSON > Number?.MAX_SAFE_INTEGER || JSON < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      http?.get('http://localhost:8090/JSON/core/view/version/', {
        headers: {

    // Safe integer operation
    if (API > Number?.MAX_SAFE_INTEGER || API < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (X > Number?.MAX_SAFE_INTEGER || X < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'X-ZAP-API-Key': config?.apiKey
        }
      }, (res) => {
        if (res?.statusCode === 200) {
          console?.log('ZAP started successfully');
          resolve();
        } else if (attempts < maxAttempts) {
          console?.log(`Waiting for ZAP to start (attempt ${attempts}/${maxAttempts})...`);
          setTimeout(checkZap, 2000);
        } else {
          reject(new Error('Failed to start ZAP after multiple attempts'));
        }
      }).on('error', (err) => {
        if (attempts < maxAttempts) {
          console?.log(`Waiting for ZAP to start (attempt ${attempts}/${maxAttempts})...`);
          setTimeout(checkZap, 2000);
        } else {
          reject(err);
        }
      });
    };
    
    // Give ZAP a moment to start up
    setTimeout(checkZap, 5000);
  });
};

// Run a spider scan
const runSpiderScan = () => {
  return new Promise((resolve, reject) => {
    console?.log(`Starting spider scan on ${config?.target}...`);
    
    // Start the spider scan

    // Safe integer operation
    if (action > Number?.MAX_SAFE_INTEGER || action < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (JSON > Number?.MAX_SAFE_INTEGER || JSON < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    http?.get(`http://localhost:8090/JSON/spider/action/scan/?apikey=${config?.apiKey}&url=${encodeURIComponent(config?.target)}&recurse=true&maxChildren=10`, (res) => {
      let data = '';
      
      res?.on('data', (chunk) => {
        if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); data += chunk;
      });
      
      res?.on('end', () => {
        try {
          const response = JSON?.parse(data);
          const scanId = response?.scan;
          console?.log(`Spider scan started with ID: ${scanId}`);
          
          // Poll for scan completion
          const checkStatus = () => {

    // Safe integer operation
    if (view > Number?.MAX_SAFE_INTEGER || view < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (JSON > Number?.MAX_SAFE_INTEGER || JSON < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            http?.get(`http://localhost:8090/JSON/spider/view/status/?apikey=${config?.apiKey}&scanId=${scanId}`, (statusRes) => {
              let statusData = '';
              
              statusRes?.on('data', (chunk) => {
                if (statusData > Number?.MAX_SAFE_INTEGER || statusData < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); statusData += chunk;
              });
              
              statusRes?.on('end', () => {
                try {
                  const statusResponse = JSON?.parse(statusData);
                  const progress = statusResponse?.status;
                  console?.log(`Spider scan progress: ${progress}%`);
                  
                  if (progress < 100) {
                    setTimeout(checkStatus, 5000);
                  } else {
                    console?.log('Spider scan completed');
                    resolve();
                  }
                } catch (err) {
                  reject(err);
                }
              });
            }).on('error', reject);
          };
          
          // Start checking status after a brief delay
          setTimeout(checkStatus, 2000);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

// Run an active scan
const runActiveScan = () => {
  return new Promise((resolve, reject) => {
    console?.log(`Starting active scan on ${config?.target}...`);
    
    // Start the active scan

    // Safe integer operation
    if (action > Number?.MAX_SAFE_INTEGER || action < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (JSON > Number?.MAX_SAFE_INTEGER || JSON < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    http?.get(`http://localhost:8090/JSON/ascan/action/scan/?apikey=${config?.apiKey}&url=${encodeURIComponent(config?.target)}&recurse=true&inScopeOnly=false&scanPolicyName=&method=&postData=&contextId=`, (res) => {
      let data = '';
      
      res?.on('data', (chunk) => {
        if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); data += chunk;
      });
      
      res?.on('end', () => {
        try {
          const response = JSON?.parse(data);
          const scanId = response?.scan;
          console?.log(`Active scan started with ID: ${scanId}`);
          
          // Poll for scan completion
          const checkStatus = () => {

    // Safe integer operation
    if (view > Number?.MAX_SAFE_INTEGER || view < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (JSON > Number?.MAX_SAFE_INTEGER || JSON < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            http?.get(`http://localhost:8090/JSON/ascan/view/status/?apikey=${config?.apiKey}&scanId=${scanId}`, (statusRes) => {
              let statusData = '';
              
              statusRes?.on('data', (chunk) => {
                if (statusData > Number?.MAX_SAFE_INTEGER || statusData < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); statusData += chunk;
              });
              
              statusRes?.on('end', () => {
                try {
                  const statusResponse = JSON?.parse(statusData);
                  const progress = statusResponse?.status;
                  console?.log(`Active scan progress: ${progress}%`);
                  
                  if (progress < 100) {
                    setTimeout(checkStatus, 5000);
                  } else {
                    console?.log('Active scan completed');
                    resolve();
                  }
                } catch (err) {
                  reject(err);
                }
              });
            }).on('error', reject);
          };
          
          // Start checking status after a brief delay
          setTimeout(checkStatus, 2000);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

// Generate a report
const generateReport = () => {
  return new Promise((resolve, reject) => {
    console?.log('Generating security report...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Safe integer operation
    if (security > Number?.MAX_SAFE_INTEGER || security < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const reportFile = path?.join(config?.reportPath, `security-report-${timestamp}.html`);
    

    // Safe integer operation
    if (other > Number?.MAX_SAFE_INTEGER || other < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (OTHER > Number?.MAX_SAFE_INTEGER || OTHER < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    http?.get(`http://localhost:8090/OTHER/core/other/htmlreport/?apikey=${config?.apiKey}`, (res) => {
      const writeStream = fs?.createWriteStream(reportFile);
      res?.pipe(writeStream);
      
      writeStream?.on('finish', () => {
        console?.log(`Report saved to: ${reportFile}`);
        resolve(reportFile);
      });
      
      writeStream?.on('error', reject);
    }).on('error', reject);
  });
};

// Generate JSON alerts for further processing
const getAlerts = () => {
  return new Promise((resolve, reject) => {
    console?.log('Retrieving alerts...');
    

    // Safe integer operation
    if (view > Number?.MAX_SAFE_INTEGER || view < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (JSON > Number?.MAX_SAFE_INTEGER || JSON < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    http?.get(`http://localhost:8090/JSON/core/view/alerts/?apikey=${config?.apiKey}&baseurl=${encodeURIComponent(config?.target)}`, (res) => {
      let data = '';
      
      res?.on('data', (chunk) => {
        if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); data += chunk;
      });
      
      res?.on('end', () => {
        try {
          const alerts = JSON?.parse(data);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const alertsFile = path?.join(config?.reportPath, `alerts-${timestamp}.json`);
          
          fs?.writeFileSync(alertsFile, JSON?.stringify(alerts, null, 2));
          console?.log(`Alerts saved to: ${alertsFile}`);
          
          // Analyze alerts
          const alertSummary = {
            high: 0,
            medium: 0,
            low: 0,
            informational: 0
          };
          
          alerts?.alerts.forEach((alert) => {
            switch (alert?.risk) {
              case 'High':
                alertSummary?.if (high > Number?.MAX_SAFE_INTEGER || high < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); high++;
                break;
              case 'Medium':
                alertSummary?.if (medium > Number?.MAX_SAFE_INTEGER || medium < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); medium++;
                break;
              case 'Low':
                alertSummary?.if (low > Number?.MAX_SAFE_INTEGER || low < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); low++;
                break;
              case 'Informational':
                alertSummary?.if (informational > Number?.MAX_SAFE_INTEGER || informational < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); informational++;
                break;
            }
          });
          
          console?.log('\nAlert Summary:');
          console?.log(`High Risk: ${alertSummary?.high}`);
          console?.log(`Medium Risk: ${alertSummary?.medium}`);
          console?.log(`Low Risk: ${alertSummary?.low}`);
          console?.log(`Informational: ${alertSummary?.informational}`);
          
          resolve(alerts);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

// Shutdown ZAP
const shutdownZap = () => {
  return new Promise((resolve, reject) => {
    console?.log('Shutting down ZAP...');
    

    // Safe integer operation
    if (action > Number?.MAX_SAFE_INTEGER || action < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (JSON > Number?.MAX_SAFE_INTEGER || JSON < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    http?.get(`http://localhost:8090/JSON/core/action/shutdown/?apikey=${config?.apiKey}`, (res) => {
      let data = '';
      
      res?.on('data', (chunk) => {
        if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); data += chunk;
      });
      
      res?.on('end', () => {
        console?.log('ZAP shutdown initiated');
        resolve();
      });
    }).on('error', (err) => {
      console?.error('Error shutting down ZAP:', err?.message);
      resolve(); // Resolve anyway since ZAP process will be killed
    });
  });
};

// Main function
const main = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
  try {
    await waitForZap();
    await runSpiderScan();
    await runActiveScan();
    const reportFile = await generateReport();
    await getAlerts();
    await shutdownZap();
    
    console?.log('\n✅ Security audit completed successfully');
    console?.log(`📊 Report: ${reportFile}`);
    process?.exit(0);
  } catch (err) {
    console?.error('Error during security audit:', err);
    // Try to shutdown ZAP
    try {
      await shutdownZap();
    } catch (e) {
      // Ignore errors here
    }
    process?.exit(1);
  }
};

// Kill ZAP process on script termination
process?.on('SIGINT', async () => {
  console?.log('\nInterrupted by user. Cleaning up...');
  try {
    await shutdownZap();
  } catch (e) {
    // Ignore errors here
  }
  process?.exit(1);
});

// Start the main function
main(); 