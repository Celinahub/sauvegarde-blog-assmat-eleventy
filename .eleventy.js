const { format } = require("date-fns");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { fr } = require("date-fns/locale");
const Image = require("@11ty/eleventy-img");
const htmlMinifier = require("html-minifier-terser"); // Plugin de minification HTML

// URL de base centralisée
const BASE_URL = "https://chubert91assmat.netlify.app";

// Fonction pour gérer le shortcode d'image
async function imageShortcode(src, alt = "", sizes = "100vw", width = 300, height = null, loading = "lazy", fetchpriority = "auto", className = "") {
  if (!src) {
    console.warn(`Missing image source for: ${alt}`);
    return '';
  }

  const imageSrc = src.startsWith("/") ? `.${src}` : `./images/${src}`;

  try {
    let metadata = await Image(imageSrc, {
      widths: [width, 600, 1200].filter(Boolean),
      formats: ["webp", "jpeg", "png"],
      outputDir: "./_site/images/",
      urlPath: "/images/",
      cacheOptions: {
        duration: "1d",
        directory: ".cache",
      }
    });

    let imageAttributes = {
      alt,
      sizes,
      loading,
      decoding: "async",
      fetchpriority,
      class: className,  // 👈 Ajout de la classe CSS ici !
      ...(height ? { style: `aspect-ratio: ${width}/${height};` } : {}),
    };

    return Image.generateHTML(metadata, imageAttributes, {
      whitespaceMode: "inline"
    });
  } catch (e) {
    console.warn(`⚠️ Erreur lors du traitement de l'image : ${imageSrc}`, e);
    return `<img src="${src}" alt="${alt}" class="${className}" loading="lazy">`;
  }
}


module.exports = function(eleventyConfig) {
  // Définir les données globales pour le site
  eleventyConfig.addGlobalData("site", {
    title: "Le Journal des petits chez Céline",
    url: BASE_URL,
    author: { name: "Céline Hubert" }
  });

  // Ajouter le filtre absoluteUrl
  eleventyConfig.addFilter("absoluteUrl", function(url) {
    return new URL(url, BASE_URL).toString();
  });

  // Ajouter le plugin eleventy-navigation
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Ajouter le plugin RSS
  eleventyConfig.addPlugin(pluginRss, {
    feedOptions: {
      title: "Le Journal des petits chez Céline",
      url: `${BASE_URL}/feed.xml`,
      language: "fr"
    }
  });

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
    return content; // Veillez à retourner le contenu si la condition n'est pas remplie
  });

  // Ajouter le shortcode d'image
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  // Configuration des collections
  const categories = [
    { name: "Recettes / atelier cuisine", slug: "recettes-atelier-cuisine", tag: "recettes" },
    { name: "Activités pour enfant", slug: "activites-enfant", tag: "activites" },
    { name: "Sélection produits", slug: "selection-produits", tag: "produits" },
    { name: "Hygiène / soins", slug: "hygiene-soins", tag: "soins" },
    { name: "Petite enfance bretigny-91", slug: "petite-enfance-bretigny-91", tag: "petite-enfance-bretigny-91" },
    { name: "La collectivité grâce au RPE", slug: "collectivite-rpe", tag: "rpe" },
    { name: "Entreprises", slug: "entreprises", tag: "entreprises" }
  ];

  // Variables de cache pour stocker les résultats
  let cachedPosts = null;
  let cachedCategories = {};

  // Fonction pour récupérer les articles avec mise en cache
  function getCachedPosts(collectionApi) {
    if (!cachedPosts) {
      cachedPosts = collectionApi.getFilteredByGlob("posts/**/*.md").sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri explicite par date décroissante
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
    if (!dateObj) return "Date non définie"; // Gestion des cas où la date est null
    return format(new Date(dateObj), formatStr, { locale: fr });
  });

  eleventyConfig.addFilter("dateToRfc3339", (date) => {
    if (!date) return ""; // Retourner une chaîne vide si la date est non définie
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ssxxx"); // Format RFC 3339
  });

  // Ajouter un filtre pour le format RFC-822
  eleventyConfig.addFilter("dateToRfc822", (date) => {
    if (!date) return ""; // Retourner une chaîne vide si la date est non définie
    return format(new Date(date), "EEE, dd MMM yyyy HH:mm:ss 'GMT'xxx", { locale: fr });
  });





// Ajouter un filtre pour limiter par mots
eleventyConfig.addFilter("truncateWords", function (content, numWords) {
  if (!content || typeof content !== "string") return ""; // Vérifie si le contenu est valide

  // Supprimer les balises HTML
  const plainText = content.replace(/<\/?[^>]+(>|$)/g, ""); 

  // Découpe par mots et limite à numWords
  const words = plainText.split(/\s+/);
  if (words.length <= numWords) {
    return plainText; // Retourne tout le texte s'il a moins de mots
  }

  return words.slice(0, numWords).join(" ") + "…"; // Tronque et ajoute une ellipse
});





  // Ajouter un filtre pour récupérer les balises SEO
  eleventyConfig.addFilter("seo", function(data) {
    return {
      title: data.title || "Titre par défaut",
      description: data.description || "Description par défaut",
      image: data.image || "/images/default-image.jpg",
      url: data.url || BASE_URL,
      date: data.date ? format(new Date(data.date), 'yyyy-MM-dd', { locale: fr }) : "",
    };
  });

  // Copier les fichiers nécessaires vers le dossier de sortie `_site`
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("google0b7250a45fd279a1.html");

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
