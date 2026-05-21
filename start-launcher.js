const os = require('os');
const { exec } = require('child_process');

const platform = os.platform();

const commands = {
  frontend: 'npm run frontend',
  backend: 'npm run backend'
};

if (platform === 'win32') {
  exec(`start cmd.exe /K "npm run frontend"`);
  exec(`start cmd.exe /K "npm run backend"`);
} else if (platform === 'linux') {
  exec(`gnome-terminal -- bash -c "npm run frontend; exec bash"`);
  exec(`gnome-terminal -- bash -c "npm run backend; exec bash"`);
} else {
  console.log("System nieobsługiwany automatycznie. Uruchom terminale ręcznie.");
}