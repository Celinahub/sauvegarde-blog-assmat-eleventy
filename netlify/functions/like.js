// Fonction Serverless pour gérer les likes
const { createClient } = require('@supabase/supabase-js');

// Récupérer les informations d'authentification de Supabase depuis l'environnement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    const { post_id } = JSON.parse(event.body);

    if (!post_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Post ID is required' }),
        };
    }

    // Récupérer le nombre actuel de likes pour cet article
    const { data, error } = await supabase
        .from('likes')
        .select('count')
        .eq('post_id', post_id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = "No rows found"
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Database error', error: error.message }),
        };
    }

    const newCount = data ? data.count + 1 : 1; // Si data existe, +1 sinon 1 like

    // Utilisation de upsert() pour éviter les doublons
    const { error: upsertError } = await supabase
        .from('likes')
        .upsert([{ post_id, count: newCount }], { onConflict: ['post_id'] });

    if (upsertError) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error updating like', error: upsertError.message }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Like added successfully', likes: newCount }),
    };
};
