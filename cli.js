#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const normalizeSvgIcon = require('./index');

const argv = require('yargs').argv;

const dir = argv._[0];

if (!dir || argv.help) {
  console.log('Usage:');
  console.log('\t', argv.$0, '--json=[filename.json|-] --out-dir=[dirname] [icon_dir]')
  process.exit(1);
}

const icons = {};

fs.readdirSync(dir).forEach((file) => {
  if (!file.match(/\.svg$/)) {
    return;
  }

  console.error('Processing', file);

  const svg = fs.readFileSync(path.join(dir, file));
  const newSvg = normalizeSvgIcon(svg);

  if (argv.outDir) {
    fs.writeFileSync(path.join(argv.outDir, file), svgFile(newSvg));
  }

  if (argv.json) {
    icons[file.replace(/\..*/, '')] = newSvg;
  }
});

if (argv.json) {
  const json = JSON.stringify(icons, null, 2);

  if (argv.json === '-') {
    console.log(json);
  } else {
    console.error('Writing json to', argv.json);
    fs.writeFileSync(argv.json, json + '\n');
  }
}

function svgFile(pathStr) {
  return `<svg width="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><path fill="#000000" stroke-width="0" d="${pathStr}"></path></svg>`
}
