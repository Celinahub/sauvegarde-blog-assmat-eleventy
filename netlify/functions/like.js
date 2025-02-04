const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://your-supabase-url.supabase.co', 'your-anon-key');

exports.handler = async (event, context) => {
  const { post_id } = event.queryStringParameters; // Récupère l'ID de l'article depuis l'URL

  // Incrémenter le nombre de likes pour cet article
  const { data, error } = await supabase
    .from('likes')
    .upsert([{ post_id, count: 1 }], { onConflict: ['post_id'] }); // Si le post_id existe déjà, met à jour le count

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
};
