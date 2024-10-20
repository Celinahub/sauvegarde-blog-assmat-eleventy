const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const postsDirectory = path.join(process.cwd(), '_posts');

    // Lire les fichiers dans le dossier _posts
    const categories = fs.readdirSync(postsDirectory);
    const markdownFiles = [];

    categories.forEach(category => {
      const files = fs.readdirSync(path.join(postsDirectory, category))
        .filter(file => file.endsWith('.md')); // Filtrer pour ne garder que les fichiers avec l'extension .md
      markdownFiles.push(...files);
    });

    return {
      statusCode: 200,
      body: JSON.stringify(markdownFiles), // Retourner la liste des fichiers Markdown
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Impossible de lister les articles' }),
    };
  }
};
