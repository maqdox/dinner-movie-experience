const fs = require('fs');

function centerHero(filePath) {
  let css = fs.readFileSync(filePath, 'utf8');

  css = css.replace(
    /\.heroContentWrapper\s*\{[\s\S]*?\}/,
    `.heroContentWrapper {\n  position: relative;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 40px;\n  max-width: var(--v2-max-width);\n  margin: 0 auto;\n  padding: 0 24px;\n  width: 100%;\n}`
  );

  css = css.replace(
    /\.heroContentText\s*\{[\s\S]*?\}/,
    `.heroContentText {\n  flex: 1;\n  max-width: 650px;\n  animation: v2FadeInUp 0.8s ease;\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}`
  );

  css = css.replace(
    /\.heroCtas\s*\{[\s\S]*?\}/,
    `.heroCtas {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 16px;\n  margin-bottom: 48px;\n}`
  );

  css = css.replace(
    /\.heroStats\s*\{[\s\S]*?\}/,
    `.heroStats {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 40px;\n  padding-top: 32px;\n  border-top: 1px solid rgba(255, 255, 255, 0.1);\n}`
  );

  fs.writeFileSync(filePath, css, 'utf8');
}

centerHero('./app/page.module.css');
centerHero('./app/v2/v2.module.css');
console.log("Centered hero content successfully.");
