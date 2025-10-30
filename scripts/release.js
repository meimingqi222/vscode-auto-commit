#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const semver = require('semver');

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function bumpVersion(type) {
  const currentVersion = getCurrentVersion();
  const newVersion = semver.inc(currentVersion, type);
  
  console.log(`Bumping version from ${currentVersion} to ${newVersion}`);
  
  // Update package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  return newVersion;
}

function createGitTag(version) {
  const tag = `v${version}`;
  console.log(`Creating git tag: ${tag}`);
  execSync(`git add package.json`, { stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit' });
  execSync(`git tag ${tag}`, { stdio: 'inherit' });
  return tag;
}

function pushToRemote(tag) {
  console.log('Pushing to remote repository...');
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin ${tag}`, { stdio: 'inherit' });
}

function buildAndPackage() {
  console.log('Building and packaging extension...');
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npm run package', { stdio: 'inherit' });
}

function main() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch'; // patch, minor, major
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('Invalid version type. Use: patch, minor, or major');
    process.exit(1);
  }
  
  try {
    console.log(`Starting release process with ${versionType} version bump...`);
    
    const newVersion = bumpVersion(versionType);
    const tag = createGitTag(newVersion);
    
    buildAndPackage();
    
    console.log('\nRelease prepared successfully!');
    console.log(`Version: ${newVersion}`);
    console.log(`Tag: ${tag}`);
    console.log('\nTo complete the release, run:');
    console.log('npm run release:push');
    
  } catch (error) {
    console.error('Release failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { bumpVersion, createGitTag, pushToRemote };
