const fs = require('fs');

function fixHeroCTA(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Regex to remove the CTA container inside the hero wrapper
  const regex = /\s*<div style=\{\{ display: "flex", justifyContent: "center", marginTop: "40px" \}\}>\s*<Link href="\/registro" className=\{`\$\{styles\.v2Btn\} \$\{styles\.v2BtnPrimary\}`\}>\s*<TicketIcon size=\{18\} className=\{styles\.btnIcon\} \/> Obtener Movie Pass\s*<\/Link>\s*<\/div>\s*(?=<\/div>\s*<\/section>\s*\{\/\* Cómo Funciona \*\/)/;

  content = content.replace(regex, '');

  fs.writeFileSync(path, content, 'utf8');
}

fixHeroCTA('app/page.js');
fixHeroCTA('app/v2/page.js');
console.log('Fixed hero CTA');
