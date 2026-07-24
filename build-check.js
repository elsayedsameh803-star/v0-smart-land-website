const { execSync } = require('child_process');
const fs = require('fs');
try {
  console.log('Starting build...');
  const out = execSync('npx next build', { 
    encoding: 'utf8', 
    shell: true, 
    timeout: 180000,
    stdio: ['pipe', 'pipe', 'pipe'] 
  });
  fs.writeFileSync('build-result.txt', out);
  console.log('BUILD OK - saved to build-result.txt');
} catch(e) {
  const err = (e.stdout || '') + '\n' + (e.stderr || '') + '\n' + e.message;
  fs.writeFileSync('build-result.txt', err);
  console.log('BUILD FAIL - saved to build-result.txt');
}