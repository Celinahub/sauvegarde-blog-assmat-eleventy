const { createClient } = require('@supabase/supabase-js');

// Initialisation de Supabase avec les variables d'environnement
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Méthode non autorisée' }) };
  }

  const { post_id } = event.queryStringParameters;

  if (!post_id) {
    return { statusCode: 400, body: JSON.stringify({ message: "post_id est requis" }) };
  }

  // Exécute la requête SQL pour incrémenter les likes
  const { data, error } = await supabase
    .from('likes')
    .upsert([{ post_id, count: 1 }], { onConflict: ['post_id'] });

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erreur lors de l'ajout du like", error }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Like ajouté avec succès", data }),
  };
};
