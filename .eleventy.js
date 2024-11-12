const { format } = require("date-fns");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { fr } = require("date-fns/locale");
const Image = require("@11ty/eleventy-img");
const htmlMinifier = require("html-minifier-terser"); // Ajoutez ici le plugin de minification


// Fonction pour gérer le shortcode d'image
async function imageShortcode(src, alt = "", sizes = "100vw") {
  if (!src) {
    console.warn(`Missing image source for: ${alt}`);
    return '';
  }

  let metadata = await Image(src, {
    widths: [300, 600, 1200],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/images/",
    urlPath: "/images/",
    cacheOptions: { // Ajout du cache
      duration: "1d", // Garde les images en cache pendant 1 jour
      directory: ".cache", // Répertoire de cache
    }
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}


module.exports = function(eleventyConfig) {
  // Ajouter le plugin eleventy-navigation
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(pluginRss);
// Ajouter le plugin de minification HTML
eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
  if (outputPath && outputPath.endsWith(".html")) {
    return htmlMinifier.minify(content, {
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
    });
  }
  return content;
});


  // Ajouter le shortcode d'image
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Configuration des collections
  const categories = [
    { name: "Recettes / atelier cuisine", slug: "recettes-atelier-cuisine", tag: "recettes" },
    { name: "Activités pour enfant", slug: "activites-enfant", tag: "activites" },
    { name: "Sélection produits", slug: "selection-produits", tag: "produits" },
    { name: "Actu petite enfance", slug: "actu-petite-enfance", tag: "actualites" },
    { name: "Actualités locales", slug: "actualites-locales", tag: "local" },
    { name: "La collectivité grâce au RPE", slug: "collectivite-rpe", tag: "rpe" }
  ];

// Variables de cache pour stocker les résultats
let cachedPosts = null;
let cachedCategories = {};


  // Fonction pour récupérer les articles avec mise en cache
  function getCachedPosts(collectionApi) {
    if (!cachedPosts) {
      cachedPosts = collectionApi.getFilteredByGlob("posts/**/*.md").reverse();
      console.log("Posts cache initialized");
    }
    return cachedPosts;
  }

  // Ajout de la collection globale "posts" avec cache
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return getCachedPosts(collectionApi);
  });

  // Ajouter des collections spécifiques pour chaque catégorie avec cache
  categories.forEach(category => {
    eleventyConfig.addCollection(category.slug, function(collectionApi) {
      if (!cachedCategories[category.slug]) {
        cachedCategories[category.slug] = collectionApi.getFilteredByGlob(`posts/${category.slug}/*.md`)
          .filter(post => post.data.category === category.name || (post.data.tags && post.data.tags.includes(category.tag)))
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri par date décroissante

        console.log(`Cache initialized for category: ${category.name}`);
      }
      return cachedCategories[category.slug];
    });
  });
  

  // Ajouter un filtre personnalisé pour les dates
  eleventyConfig.addFilter("date", (dateObj, formatStr = "dd MMMM yyyy") => {
    return format(dateObj, formatStr, { locale: fr });
  });
  eleventyConfig.addFilter("dateToRfc3339", (date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssxxx"); // Format RFC 3339
  });
  


// Ajouter un filtre pour récupérer les balises SEO
eleventyConfig.addFilter("seo", function(data) {
  return {
    title: data.title || "Titre par défaut",
    description: data.description || "Description par défaut",
    image: data.image || "/images/default-image.jpg",
    url: data.url || "https://chubert91assmat.netlify.app",
    date: data.date ? format(new Date(data.date), 'yyyy-MM-dd', { locale: fr }) : "",
  };
});

  // Copier les fichiers nécessaires vers le dossier de sortie `_site`
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("feed");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // Ajouter des alias pour les layouts
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
  eleventyConfig.addLayoutAlias("postslist", "layouts/postslist.njk");

  // Retourner la configuration de l'entrée et de la sortie
  return {
    pathPrefix: process.env.NODE_ENV === 'production' ? '/blog/' : '/',
    dir: {
      input: ".",           // Dossier d'entrée
      includes: "_includes", // Dossier contenant les layouts et widgets
      output: "_site"        // Dossier de sortie
    }
  };
};
