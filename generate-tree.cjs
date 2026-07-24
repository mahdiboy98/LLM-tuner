const fs = require('fs');
const path = require('path');

// پوشه‌هایی که نباید نمایش داده بشن
const excludeDirs = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.vscode',
  '__pycache__',
  'venv',
  'env',
  'migrations',
  'media',
  'staticfiles',
  '.cache',
  '.pytest_cache',
  '.idea'
];

// فایل‌هایی که نباید نمایش داده بشن
const excludeFiles = [
  '.DS_Store',
  '*.log',
  '*.pyc',
  '*.pyo',
  '*.sqlite3',
  '.env',
  'package-lock.json',
  'bun.lockb',
  'yarn.lock',
  'pnpm-lock.yaml'
];

function shouldExcludeDir(dirName) {
  return excludeDirs.includes(dirName) || dirName.startsWith('.');
}

function shouldExcludeFile(fileName) {
  return excludeFiles.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(fileName);
    }
    return fileName === pattern;
  });
}

function generateTree(dirPath, prefix = '', isLast = true, output = []) {
  const files = fs.readdirSync(dirPath);
  const dirs = [];
  const nonDirs = [];

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!shouldExcludeDir(file)) {
        dirs.push(file);
      }
    } else {
      if (!shouldExcludeFile(file)) {
        nonDirs.push(file);
      }
    }
  });

  dirs.sort();
  nonDirs.sort();

  const allEntries = [...dirs, ...nonDirs];

  allEntries.forEach((entry, index) => {
    const isLastEntry = index === allEntries.length - 1;
    const connector = isLastEntry ? '└── ' : '├── ';
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    output.push(`${prefix}${connector}${entry}${stat.isDirectory() ? '/' : ''}`);

    if (stat.isDirectory()) {
      const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');
      generateTree(fullPath, newPrefix, isLastEntry, output);
    }
  });

  return output;
}

function run() {
  const rootPath = process.cwd();
  console.log(`📁 Project tree for: ${path.basename(rootPath)}\n`);
  console.log(`${path.basename(rootPath)}/`);
  const treeLines = generateTree(rootPath, '', true, []);
  treeLines.forEach(line => console.log(line));
}

run();