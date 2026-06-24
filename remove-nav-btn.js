const fs = require('fs');

function updatePage(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Remove the nav button
  const navBtnRegex = /<Link href="\/registro" className=\{`\$\{styles\.v2Btn\} \$\{styles\.v2BtnPrimary\}`\} style=\{\{ padding: "10px 24px", fontSize: "0\.85rem", whiteSpace: "nowrap" \}\}>\s*Obtener Movie Pass\s*<\/Link>/;
  content = content.replace(navBtnRegex, '');

  fs.writeFileSync(path, content, 'utf8');
}

updatePage('app/page.js');
updatePage('app/v2/page.js');
console.log('Nav button removed');
