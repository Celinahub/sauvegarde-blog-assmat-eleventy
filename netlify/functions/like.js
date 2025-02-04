const { createClient } = require('@supabase/supabase-js');

// Récupérer les variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event, context) => {
  try {
    console.log('Requête reçue:', event.queryStringParameters);
    
    const { post_id } = event.queryStringParameters;
    if (!post_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Le paramètre post_id est manquant' }),
      };
    }

    // Log pour vérifier la connexion à Supabase
    console.log('Connexion à Supabase établie:', SUPABASE_URL);

    const { data, error } = await supabase
      .from('likes')
      .upsert([{ post_id, count: 1 }], { onConflict: ['post_id'] });

    // Log pour voir la réponse de Supabase
    console.log('Réponse de Supabase:', data, error);

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Erreur lors de l\'ajout du like', error }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Like ajouté avec succès', data }),
    };

  } catch (error) {
    console.error('Erreur dans la fonction:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur serveur', error: error.message }),
    };
  }
};
