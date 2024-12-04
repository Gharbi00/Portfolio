const fs = require('fs');
const UglifyJS = require('uglify-js');

const assetsDir = './src/assets';

// Function to recursively minify JavaScript files in a directory
function minifyFiles(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively minify files in subdirectories
      minifyFiles(filePath);
    } else if (file.endsWith('.js')) {
      // Minify JavaScript files
      const code = fs.readFileSync(filePath, 'utf8');
      const minified = UglifyJS.minify(code);

      fs.writeFileSync(filePath, minified.code, 'utf8');
    }
  });
}

// Start minification process
minifyFiles(assetsDir);
