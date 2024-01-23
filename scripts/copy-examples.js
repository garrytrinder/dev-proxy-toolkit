const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  fs.mkdirSync(to, {recursive: true});
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

const srcDir = 'src/test/examples';
const destDir = 'out/test/examples';

copyFolderSync(srcDir, destDir);
console.log('Directory and contents have been copied successfully.');
