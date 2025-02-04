const { createClient } = require('@supabase/supabase-js');

// Récupérer les variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event, context) => {
  const { post_id } = event.queryStringParameters;

  if (!post_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'post_id is required' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('likes')
      .upsert([{ post_id, count: 1 }], { onConflict: ['post_id'] });

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error adding like', error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Like added successfully', data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
