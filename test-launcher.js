const os = require('os');
const { exec } = require('child_process');

const platform = os.platform();

const feTest = "npm run test:frontend";
const beTest = "npm run test:backend";

if (platform === 'win32') {
  exec(`start cmd.exe /K "${feTest}"`);
  exec(`start cmd.exe /K "${beTest}"`);
} else if (platform === 'linux') {
  exec(`gnome-terminal -- bash -c "${feTest}; exec bash"`);
  exec(`gnome-terminal -- bash -c "${beTest}; exec bash"`);
} else if (platform === 'darwin') {
  exec(`osascript -e 'tell application "Terminal" to do script "${feTest}"'`);
  exec(`osascript -e 'tell application "Terminal" to do script "${beTest}"'`);
} else {
  console.log("System nieobsługiwany automatycznie. Uruchom testy ręcznie w osobnych oknach.");
}