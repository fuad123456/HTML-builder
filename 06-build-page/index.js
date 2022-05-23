const path = require('path');
const fs = require('fs');
const { mkdir, readdir, access, copyFile, rm, appendFile } = require('fs/promises');

let tmp = path.join(__dirname, 'template.html');
let componentsPath = path.join(__dirname, 'components');
let assetsPath = path.join(__dirname, 'assets');
let destPath = path.join(__dirname, 'project-dist');
let cssPath = path.join(__dirname, 'styles');
let destcssPath = path.join(path.join(destPath, 'style.css'));
let assets = path.join(destPath, 'assets');
let mp = {};

let readComponents = async function() {
    let files = await readdir(componentsPath, {withFileTypes: true});
    for (let file of files) {
      if (file.isFile() && path.extname(file.name) === '.html') {
        let input = await fs.createReadStream(path.join(componentsPath, file.name), 'utf-8');
        input.on('data', (ch) => {
          let key = `{{${ path.parse(file.name).name }}}`;
          mp[key] = mp[key] ? mp[key] += ch : ch;
        });
      }
    }
};

let buildHTML = async function() {
  await readComponents();
  let res = '';
  let input = await fs.createReadStream(tmp, 'utf-8');
  input.on('data', (ch) => res += ch);
  input.on('error', (err) => console.error(err));
  input.on('end', () => {
    for (let key in mp) {
      res = res.split(key).join(mp[key]);
    }
    let output = fs.createWriteStream(path.join(destPath, 'index.html'));
    output.write(res);
  });
};

let mergeOfStyles = async function() {
  fs.createWriteStream(destcssPath);
    let files = await readdir(cssPath, {withFileTypes: true});
    for (let file of files) {
      if (file.isFile() && path.extname(file.name) === '.css') {
        let input = await fs.createReadStream(path.join(cssPath, file.name), 'utf-8');
        input.on('data', (ch) => appendFile(destcssPath, ch));
      }
    }
};

let copy = async function (srcPath, destPath) {
    let dir = await readdir(srcPath, {withFileTypes: true});
    for (let item of dir) {
      if (item.isFile()) {
        await copyFile(path.join(srcPath, item.name), path.join(destPath, item.name));
      } else {
        await mkdir(path.join(destPath, item.name), { recursive: true });
        copy(path.join(srcPath, item.name), path.join(destPath, item.name));
      }
    }
};

let copyAssets = async function() {
  try {
    await access(assets);
    await rm(assets, { recursive: true, force: true });
    await mkdir(assets, { recursive: true });
    copy(assetsPath, assets);
  } catch {
    await mkdir(assets, { recursive: true });
    copy(assetsPath, assets);
  }
};

(async function() {
    await mkdir(destPath, { recursive: true });
    buildHTML();
    mergeOfStyles();
    copyAssets();
})();