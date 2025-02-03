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

    const { data, error } = await supabase
        .from('likes')
        .select('count')
        .eq('post_id', post_id)
        .single();

    if (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Database error', error: error.message }),
        };
    }

    if (!data) {
        const { error: insertError } = await supabase
            .from('likes')
            .insert([{ post_id: post_id, count: 1 }]);

        if (insertError) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error inserting like', error: insertError.message }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Like added successfully' }),
        };
    }

    const { error: updateError } = await supabase
        .from('likes')
        .update({ count: data.count + 1 })
        .eq('post_id', post_id);

    if (updateError) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error updating like', error: updateError.message }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Like added successfully' }),
    };
};
