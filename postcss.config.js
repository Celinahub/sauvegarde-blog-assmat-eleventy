const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './_site/**/*.html', // tous les fichiers générés par Eleventy
    './_includes/**/*.njk', // layouts Nunjucks
    './posts/**/*.md' // contenu markdown
  ],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
});

module.exports = {
  plugins: [
    purgecss
  ]
};