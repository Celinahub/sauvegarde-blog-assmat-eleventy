const fs = require('fs');
const path = require('path');
const marked = require('marked');

exports.handler = async (event, context) => {
  const postsDir = path.join(process.cwd(), '_posts');

  try {
    const categories = fs.readdirSync(postsDir); // Lis le répertoire _posts
    const posts = [];

    // Pour chaque catégorie, lis les articles
    categories.forEach(category => {
      const files = fs.readdirSync(path.join(postsDir, category))
        .filter(file => file.endsWith('.md')) // Ne prends que les fichiers .md
        .map(file => {
          const content = fs.readFileSync(path.join(postsDir, category, file), 'utf8'); // Lis chaque fichier
          return {
            filename: file,
            content: marked(content), // Convertis le markdown en HTML
            category: category // Ajoute la catégorie à chaque article
          };
        });
      posts.push(...files);
    });

    return {
      statusCode: 200,
      body: JSON.stringify(posts), // Retourne les articles sous forme d'un tableau d'objets
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur lors du chargement des articles' }),
    };
  }
};

