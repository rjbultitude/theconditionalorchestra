const path = require('path');
const {prod_Path, src_Path} = require('./path');
const distDir = path.resolve(__dirname, prod_Path);
const copyPluginConfig = [
  { from: './img', to: `${distDir}/img` },
  { from: './audio', to: `${distDir}/audio` },
  { from: './proxy.php', to: distDir },
  { from: './gm-key.php', to: distDir },
  { from: './favicon.ico', to: distDir },
  { from: './src/sw/sw.js', to: distDir },
  { from: './manifest.json', to: distDir },
  { from: './403.js', to: distDir },
  { from: './404.js', to: distDir }
];

module.exports = {
    prod_Path: prod_Path,
    src_Path: src_Path,
    distDir: distDir,
    copyPluginConfig: copyPluginConfig
}
