const { createClient } = require('@supabase/supabase-js');

// Vérifie que les variables d’environnement sont bien récupérées
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "OK" : "MISSING");
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "OK" : "MISSING");

// Initialise Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event, context) => {
  console.log("🔵 Requête reçue :", event.httpMethod, event.queryStringParameters);

  if (event.httpMethod !== 'POST') {
    console.error("🚨 Méthode non autorisée");
    return { statusCode: 405, body: JSON.stringify({ message: 'Méthode non autorisée' }) };
  }

  const { post_id } = event.queryStringParameters;

  if (!post_id) {
    console.error("🚨 Erreur: post_id manquant");
    return { statusCode: 400, body: JSON.stringify({ message: "post_id est requis" }) };
  }

  console.log("🟢 post_id reçu:", post_id);

  try {
    // Exécute la requête Supabase
    const { data, error } = await supabase
      .from('likes')
      .upsert([{ post_id, count: 1 }], { onConflict: ['post_id'] });

    if (error) {
      console.error("🚨 Erreur Supabase:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Erreur lors de l'ajout du like", error }),
      };
    }

    console.log("✅ Like ajouté avec succès :", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Like ajouté avec succès", data }),
    };
  } catch (err) {
    console.error("🚨 Erreur inconnue:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erreur serveur", error: err.message }),
    };
  }
};
