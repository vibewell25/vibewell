#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Backup package.json and package-lock.json
function backupFiles() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, timestamp);
  fs.mkdirSync(backupPath);
  
  ['package.json', 'package-lock.json'].forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    const targetPath = path.join(backupPath, file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
  
  return backupPath;
}

// Update packages in stages
const updates = {
  stage1: {
    name: 'React and Core Dependencies',
    packages: [
      'react@19.1.0',
      'react-dom@19.1.0',
      '@types/react@19.1.1',
      '@types/react-dom@19.1.2'
    ]
  },
  stage2: {
    name: 'Next.js and Related',
    packages: [
      'next@15.3.0',
      'eslint-config-next@15.3.0'
    ]
  },
  stage3: {
    name: 'Testing Libraries',
    packages: [
      '@testing-library/react@16.3.0',
      '@testing-library/dom@10.4.0',
      'cypress@14.3.0'
    ]
  },
  stage4: {
    name: 'Third Party Integrations',
    packages: [
      '@stripe/react-stripe-js@3.6.0',
      '@stripe/stripe-js@7.0.0',
      'stripe@18.0.0'
    ]
  },
  stage5: {
    name: '3D and UI Libraries',
    packages: [
      '@react-three/drei@10.0.6',
      '@react-three/fiber@9.1.2',
      'three@0.175.0'
    ]
  }
};

async function main() {
  console.log('Starting dependency update process...');
  const backupPath = backupFiles();
  console.log(`Backup created at: ${backupPath}`);

  for (const [stage, info] of Object.entries(updates)) {
    console.log(`\nStarting ${info.name} updates...`);
    try {
      execSync(`npm install ${info.packages.join(' ')} --save`, { stdio: 'inherit' });
      console.log(`✅ ${info.name} updates completed successfully`);
    } catch (error) {
      console.error(`❌ Error updating ${info.name}:`, error.message);
      console.log('Rolling back to backup...');
      
      ['package.json', 'package-lock.json'].forEach(file => {
        const backupFile = path.join(backupPath, file);
        const targetFile = path.join(__dirname, '..', file);
        if (fs.existsSync(backupFile)) {
          fs.copyFileSync(backupFile, targetFile);
        }
      });
      
      execSync('npm install', { stdio: 'inherit' });
      process.exit(1);
    }
  }

  console.log('\nAll updates completed successfully!');
  console.log('\nRecommended next steps:');
  console.log('1. Run tests: npm test');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Check for any visual regressions');
  console.log('4. Review console for warnings/errors');
}

main().catch(console.error); 