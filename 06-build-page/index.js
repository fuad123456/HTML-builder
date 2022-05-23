const path = require('path');
const fs = require('fs');
const { mkdir, readdir, access, copyFile, rm, appendFile } = require('fs/promises');

const destPath = path.join(__dirname, 'project-dist');
const componentsPath = path.join(__dirname, 'components');
const templatePath = path.join(__dirname, 'template.html');
const assetsPath = path.join(__dirname, 'assets');
const destAssetsPath = path.join(destPath, 'assets');
const stylesPath = path.join(__dirname, 'styles');
const destStylesPath = path.join(path.join(destPath, 'style.css'));
const mp = {};

const readComponents = async function() {
    const files = await readdir(componentsPath, {withFileTypes: true});
    for (const file of files) {
      if (file.isFile() && path.extname(file.name) === '.html') {
        const input = await fs.createReadStream(path.join(componentsPath, file.name), 'utf-8');
        input.on('data', (chunk) => {
          const key = `{{${ path.parse(file.name).name }}}`;
          mp[key] = mp[key] ? mp[key] += chunk : chunk;
        });
      }
    }
};

const buildHTML = async function() {
  await readComponents();
  let result = '';
  const input = await fs.createReadStream(templatePath, 'utf-8');
  input.on('data', (chunk) => result += chunk);
  input.on('error', (err) => console.error(err));
  input.on('end', () => {
    for (const key in mp) {
      result = result.split(key).join(mp[key]);
    }
    const output = fs.createWriteStream(path.join(destPath, 'index.html'));
    output.write(result);
  });
};

const mergeOfStyles = async function() {
  fs.createWriteStream(destStylesPath);
    const files = await readdir(stylesPath, {withFileTypes: true});
    for (const file of files) {
      if (file.isFile() && path.extname(file.name) === '.css') {
        const input = await fs.createReadStream(path.join(stylesPath, file.name), 'utf-8');
        input.on('data', (chunk) => appendFile(destStylesPath, chunk));
      }
    }
};

const copyFiles = async function (srcPath, destPath) {
    const dir = await readdir(srcPath, {withFileTypes: true});
    for (const item of dir) {
      if (item.isFile()) {
        await copyFile(path.join(srcPath, item.name), path.join(destPath, item.name));
      } else {
        await mkdir(path.join(destPath, item.name), { recursive: true });
        copyFiles(path.join(srcPath, item.name), path.join(destPath, item.name));
      }
    }
};

const copyAssets = async function() {
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