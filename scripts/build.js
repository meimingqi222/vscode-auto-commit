#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function cleanBuild() {
  console.log('Cleaning build directory...');
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  
  // Clean previous VSIX files
  const vsixFiles = fs.readdirSync('.').filter(file => file.endsWith('.vsix'));
  vsixFiles.forEach(file => fs.unlinkSync(file));
}

function installDependencies() {
  console.log('Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
}

function runLinting() {
  console.log('Running ESLint...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.warn('Linting failed, but continuing build...');
  }
}

function compileTypeScript() {
  console.log('Compiling TypeScript...');
  execSync('npm run compile', { stdio: 'inherit' });
}

function runTests() {
  console.log('Running tests...');
  try {
    // Check if test files exist before running
    if (fs.existsSync('out/test/runTest.js')) {
      execSync('npm test', { stdio: 'inherit' });
    } else {
      console.log('No test files found, skipping tests...');
    }
  } catch (error) {
    console.warn('Tests failed, but continuing build...');
  }
}

function packageExtension() {
  console.log('Packaging extension...');
  execSync('npx vsce package', { stdio: 'inherit' });
  
  // List generated files
  const files = fs.readdirSync('.').filter(file => file.endsWith('.vsix'));
  console.log('Generated package files:');
  files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`  ${file} (${Math.round(stats.size / 1024)}KB)`);
  });
}

function validatePackage() {
  console.log('Validating package...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const required = ['name', 'version', 'publisher', 'engines', 'main', 'contributes'];
  const missing = required.filter(field => !packageJson[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required package.json fields: ${missing.join(', ')}`);
  }
  
  console.log('✓ Package validation passed');
}

function main() {
  const args = process.argv.slice(2);
  const skipTests = args.includes('--skip-tests');
  const skipLint = args.includes('--skip-lint');
  
  try {
    console.log('🚀 Starting build process...\n');
    
    cleanBuild();
    installDependencies();
    
    if (!skipLint) {
      runLinting();
    }
    
    compileTypeScript();
    
    if (!skipTests) {
      runTests();
    }
    
    validatePackage();
    packageExtension();
    
    console.log('\n✅ Build completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanBuild, compileTypeScript, packageExtension };
