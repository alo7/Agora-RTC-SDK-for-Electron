const fs = require('fs');

const isExist = fs.existsSync('~/.nvm/nvm.sh');
if (isExist) {
  const cp = require('child_process');
  cp.execSync('nvm use v8.5.0');
}
