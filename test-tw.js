const { execSync } = require('child_process');
try {
  execSync('npx tailwindcss -i ./src/app/globals.css -o ./out.css', { stdio: 'pipe' });
  const out = execSync('grep -A 2 clamp ./out.css').toString();
  console.log("TAILWIND OUT:\n" + out);
} catch (e) {
  console.log("ERR:", e.message);
}
