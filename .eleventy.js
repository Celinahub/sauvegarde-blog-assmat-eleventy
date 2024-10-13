const { format } = require("date-fns");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { fr } = require("date-fns/locale");

module.exports = function(eleventyConfig) {
  // Ajouter le plugin eleventy-navigation
  eleventyConfig.addPlugin(eleventyNavigationPlugin);


// Collection pour les articles de recettes
eleventyConfig.addCollection("recettes", function(collectionApi) {
  return collectionApi.getAll().filter(function(item) {
    return item.data.tags && item.data.tags.includes("recettes");
  });
});

// Collection pour les articles d'activités pour enfants
eleventyConfig.addCollection("activites-enfant", function(collectionApi) {
  return collectionApi.getAll().filter(function(item) {
    return item.data.tags && item.data.tags.includes("activites-enfant");
  });
});

// Collection pour selection-produits
eleventyConfig.addCollection("produits", function(collectionApi) {
  return collectionApi.getAll().filter(function(item) {
    return item.data.tags && item.data.tags.includes("produits");
  });
});

// Collection pour actualité
eleventyConfig.addCollection("actualite", function(collectionApi) {
  return collectionApi.getAll().filter(function(item) {
    return item.data.tags && item.data.tags.includes("actualite");
  });
});

// Collection pour local
eleventyConfig.addCollection("local", function(collectionApi) {
  return collectionApi.getAll().filter(function(item) {
    return item.data.tags && item.data.tags.includes("local");
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

  // Ajouter un alias pour les layouts
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
  eleventyConfig.addLayoutAlias("postslist", "layouts/postslist.njk");

  // Ajouter la collection de posts
eleventyConfig.addCollection("posts", function(collectionApi) {
  return collectionApi.getFilteredByGlob("posts/*.md").reverse(); 
});

// Ajouter la pagination aux posts
eleventyConfig.addCollection("paginatedPosts", function(collectionApi) {
  return collectionApi.getFilteredByGlob("posts/*.md").reverse(); // Utiliser reverse() pour maintenir l'ordre
});

// Ajouter la pagination aux catégories
eleventyConfig.addCollection("paginatedcategories", function(collectionApi) {
  return collectionApi.getFilteredByGlob("categories/*.md").reverse(); // Utiliser reverse() pour maintenir l'ordre
});



// Ajouter la pagination à la catégorie recettes
eleventyConfig.addCollection("recettesAtelierCuisine", function(collectionApi) {
  return collectionApi.getFilteredByGlob("posts/*.md")
    .filter(post => post.data.category === "RECETTES / ATELIER CUISINE")
    .sort((a, b) => b.date - a.date); // Tri par date décroissante (du plus récent au plus ancien)
});

// Ajouter la pagination à la catégorie activités
eleventyConfig.addCollection("activites", function(collectionApi) {
  return collectionApi.getFilteredByGlob("posts/*.md")
    .filter(post => post.data.category === "ACTIVITES")
    .sort((a, b) => b.date - a.date);
});

// Ajouter la pagination à la catégorie selection-produits
eleventyConfig.addCollection("selection-produits", function(collectionApi) {
  return collectionApi.getFilteredByGlob("posts/*.md")
    .filter(post => post.data.category === "SELECTION PRODUITS")
    .sort((a, b) => b.date - a.date);
});

// Ajouter la pagination à la catégorie actu-petite-enfance
eleventyConfig.addCollection("actu-petite-enfance", function(collectionApi) {
  return collectionApi.getFilteredByGlob("posts/*.md")
    .filter(post => post.data.category === "ACTU PETITE-ENFANCE")
    .sort((a, b) => b.date - a.date);
});

// Ajouter la pagination à la catégorie actualites-locales
eleventyConfig.addCollection("actualites-locales", function(collectionApi) {
  return collectionApi.getFilteredByGlob("posts/*.md")
    .filter(post => post.data.category === "ACTUALITES LOCALES")
    .sort((a, b) => b.date - a.date);
});



  return {
    dir: {
      input: ".",           // Dossier d'entrée
      includes: "_includes", // Dossier contenant les layouts et widgets
      output: "_site"        // Dossier de sortie
    }
  };
};
