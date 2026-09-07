// Trigger a Vercel production redeploy by making a no-op git change
const { execSync } = require("child_process");
const fs = require("fs");

// Append a space-only comment to the verification file to force a new commit
const vfile = "public/tiktok-site-verification.txt";
let content = fs.readFileSync(vfile, "utf8");
// Strip any trailing whitespace and re-add the canonical content
content = "tiktok-developers-site-verification=IZPLj9v7G05ZTxZThd7WW1DKAkC6BzCn\n";
fs.writeFileSync(vfile, content, "utf8");

console.log("File re-written, now committing + pushing...");
execSync("git add -A", { stdio: "inherit" });
execSync('git commit -m "chore: trigger Vercel redeploy for TikTok verification file"', { stdio: "inherit" });
execSync("git push origin master", { stdio: "inherit" });
console.log("Push complete. Vercel will auto-deploy.");
