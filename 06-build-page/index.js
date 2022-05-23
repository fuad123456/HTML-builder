const path = require('path');
const fs = require('fs');
const { mkdir, readdir, access, copyFile, rm, appendFile } = require('fs/promises');

let destPath = path.join(__dirname, 'project-dist');
let componentsPath = path.join(__dirname, 'components');
let templatePath = path.join(__dirname, 'template.html');
let assetsPath = path.join(__dirname, 'assets');
let destAssetsPath = path.join(destPath, 'assets');
let stylesPath = path.join(__dirname, 'styles');
let destStylesPath = path.join(path.join(destPath, 'style.css'));
let mp = {};

let readComponents = async function() {
    let files = await readdir(componentsPath, {withFileTypes: true});
    for (let file of files) {
      if (file.isFile() && path.extname(file.name) === '.html') {
        let input = await fs.createReadStream(path.join(componentsPath, file.name), 'utf-8');
        input.on('data', (chunk) => {
          let key = `{{${ path.parse(file.name).name }}}`;
          mp[key] = mp[key] ? mp[key] += chunk : chunk;
        });
      }
    }
};

let buildHTML = async function() {
  await readComponents();
  let result = '';
  let input = await fs.createReadStream(templatePath, 'utf-8');
  input.on('data', (chunk) => result += chunk);
  input.on('error', (err) => console.error(err));
  input.on('end', () => {
    for (let key in mp) {
      result = result.split(key).join(mp[key]);
    }
    let output = fs.createWriteStream(path.join(destPath, 'index.html'));
    output.write(result);
  });
};

let mergeOfStyles = async function() {
  fs.createWriteStream(destStylesPath);
    let files = await readdir(stylesPath, {withFileTypes: true});
    for (let file of files) {
      if (file.isFile() && path.extname(file.name) === '.css') {
        let input = await fs.createReadStream(path.join(stylesPath, file.name), 'utf-8');
        input.on('data', (chunk) => appendFile(destStylesPath, chunk));
      }
    }
};

let copyFiles = async function (srcPath, destPath) {
    let dir = await readdir(srcPath, {withFileTypes: true});
    for (let item of dir) {
      if (item.isFile()) {
        await copyFile(path.join(srcPath, item.name), path.join(destPath, item.name));
      } else {
        await mkdir(path.join(destPath, item.name), { recursive: true });
        copyFiles(path.join(srcPath, item.name), path.join(destPath, item.name));
      }
    }
};

let copyAssets = async function() {
  try {
    await access(destAssetsPath);
    await rm(destAssetsPath, { recursive: true, force: true });
    await mkdir(destAssetsPath, { recursive: true });
    copyFiles(assetsPath, destAssetsPath);
  } catch {
    await mkdir(destAssetsPath, { recursive: true });
    copyFiles(assetsPath, destAssetsPath);
  }
};

(async function() {
    await mkdir(destPath, { recursive: true });
    buildHTML();
    mergeOfStyles();
    copyAssets();
})();