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
    // Vérifie si le post existe déjà
    const { data: existingLike, error: fetchError } = await supabase
      .from('likes')
      .select('count')
      .eq('post_id', post_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("🚨 Erreur lors de la vérification du like:", fetchError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Erreur lors de la vérification du like", error: fetchError }),
      };
    }

    let updatedData;

    if (existingLike) {
      // Met à jour le compteur de likes (+1)
      const { data, error } = await supabase
        .from('likes')
        .update({ count: existingLike.count + 1 })
        .eq('post_id', post_id);

      updatedData = data;
      if (error) throw error;
    } else {
      // Insère un nouveau like si aucun like n'existe encore
      const { data, error } = await supabase
        .from('likes')
        .insert([{ post_id, count: 1 }]);

      updatedData = data;
      if (error) throw error;
    }

    console.log("✅ Like ajouté/mis à jour avec succès :", updatedData);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Like ajouté avec succès", data: updatedData }),
    };
  } catch (err) {
    console.error("🚨 Erreur inconnue:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erreur serveur", error: err.message }),
    };
  }
};
