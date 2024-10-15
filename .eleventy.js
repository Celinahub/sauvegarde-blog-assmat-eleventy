const { format } = require("date-fns");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { fr } = require("date-fns/locale");
const Image = require("@11ty/eleventy-img");

// Fonction pour gérer le shortcode d'image
async function imageShortcode(src, alt = "") {
  if (!src) {
    console.warn(`Missing image source for: ${alt}`);
    return '';
  }

  let metadata = await Image(src, {
    widths: [300, 600, 1200],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/images/",
    urlPath: "/images/"
  });

  let imageAttributes = {
    alt,
    sizes: "(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px",
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
  // Ajouter le plugin eleventy-navigation
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  
  // Ajouter le shortcode d'image
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Configuration des collections
  const categories = [
    { name: "Recettes / atelier cuisine", slug: "recettes-atelier-cuisine", tag: "recettes" },
    { name: "Activités", slug: "activites-enfant", tag: "activites" },
    { name: "Sélection produits", slug: "selection-produits", tag: "produits" },
    { name: "Actu petite enfance", slug: "actu-petite-enfance", tag: "actualites" },
    { name: "Actualités locales", slug: "actualites-locales", tag: "local" },
    { name: "La collectivité grâce au RPE", slug: "collectivite-rpe", tag: "rpe" }
  ];

  // Collection globale pour tous les articles
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/**/*.md").reverse();
  });

  // Créer des collections spécifiques pour chaque catégorie
  categories.forEach(category => {
    eleventyConfig.addCollection(category.slug, function(collectionApi) {
      return collectionApi.getFilteredByGlob(`posts/${category.slug}/*.md`)
        .filter(post => post.data.category === category.name || (post.data.tags && post.data.tags.includes(category.tag)))
        .sort((a, b) => b.date - a.date); // Tri par date décroissante
    });
  });

  // Ajouter un filtre personnalisé pour les dates
  eleventyConfig.addFilter("date", (dateObj, formatStr = "dd MMMM yyyy") => {
    return format(dateObj, formatStr, { locale: fr });
  });

  // Copier les fichiers nécessaires vers le dossier de sortie `_site`
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("css");

  // Ajouter des alias pour les layouts
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
  eleventyConfig.addLayoutAlias("postslist", "layouts/postslist.njk");

  // Retourner la configuration de l'entrée et de la sortie
  return {
    dir: {
      input: ".",           // Dossier d'entrée
      includes: "_includes", // Dossier contenant les layouts et widgets
      output: "_site"        // Dossier de sortie
    }
  };
};
