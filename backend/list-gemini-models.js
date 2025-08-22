const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function listGeminiModels() {
  try {
    console.log('Listing available Gemini models...');
    
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in environment variables');
    }
    
    console.log('API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
    
    // Call Gemini API to list models
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    
    console.log('✅ Successfully retrieved models list:');
    console.log('Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name}: ${model.description}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to list models:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the function
listGeminiModels();