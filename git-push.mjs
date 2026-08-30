import { execSync } from 'child_process';

const cwd = 'c:\\Users\\Fast\\OneDrive\\Desktop\\new smart land';

try {
  console.log('Adding files...');
  execSync('git add -A', { cwd, stdio: 'inherit' });
  
  console.log('Committing...');
  execSync('git commit -m "fix: TikTok syntax and Facebook public profiles without OAuth"', { cwd, stdio: 'inherit' });
  
  console.log('Pushing...');
  execSync('git push origin master', { cwd, stdio: 'inherit' });
  
  console.log('Done!');
} catch (error) {
  console.error('Error:', error.message);
}