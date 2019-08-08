const path = require('path');
const {
  prod_Path,
  src_Path
} = require('./path');
const distDir = path.resolve(__dirname, prod_Path);

module.exports = {
    prod_Path: prod_Path,
    src_Path: src_Path,
    distDir: distDir
}
