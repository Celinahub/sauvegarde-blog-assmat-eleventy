const { format } = require("date-fns");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { fr } = require("date-fns/locale");
const Image = require("@11ty/eleventy-img");

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
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

 // Générer les images avec des formats adaptés et du HTML optimisé
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
    { name: "Activités pour enfant", slug: "activites-enfant", tag: "activites" },
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
      const posts = collectionApi.getFilteredByGlob(`posts/${category.slug}/*.md`)
        .filter(post => post.data.category === category.name || (post.data.tags && post.data.tags.includes(category.tag)));
  
      posts.forEach(post => {
        console.log(`Article: ${post.data.title}, Date: ${post.date}`);
      });
  
      return posts.sort((a, b) => {
        let dateA = new Date(a.date);
        let dateB = new Date(b.date);
        return dateB - dateA; // Tri par date décroissante
      });
    });
  });
  

  // Ajouter un filtre personnalisé pour les dates
  eleventyConfig.addFilter("date", (dateObj, formatStr = "dd MMMM yyyy") => {
    return format(dateObj, formatStr, { locale: fr });
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
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("css");

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
