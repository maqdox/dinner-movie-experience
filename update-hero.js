const fs = require('fs');

function updatePage(path) {
  let content = fs.readFileSync(path, 'utf8');

  // 1. Remove the secondary button
  const secondaryButtonRegex = /<a href="#restaurantes" className=\{`\$\{styles\.v2Btn\} \$\{styles\.v2BtnSecondary\}`\}>[\s\S]*?<\/a>/;
  content = content.replace(secondaryButtonRegex, '');

  // 2. Center the image container
  const imageDivRegex = /<div style=\{\{ marginTop: "80px", marginBottom: "24px" \}\}>/;
  content = content.replace(imageDivRegex, '<div style={{ marginTop: "80px", marginBottom: "24px", display: "flex", justifyContent: "center" }}>');

  fs.writeFileSync(path, content, 'utf8');
}

updatePage('app/page.js');
updatePage('app/v2/page.js');
console.log('Pages updated successfully');
