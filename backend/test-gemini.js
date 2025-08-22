const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    console.log('Current working directory:', process.cwd());
    console.log('Environment variables:', Object.keys(process.env));
    
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY not found in environment variables');
      console.log('All environment variables:', process.env);
      throw new Error('GEMINI_API_KEY not configured in environment variables');
    }
    
    console.log('API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
    
    // Simple test prompt
    const prompt = "Say hello world in a creative way";
    
    // Call Gemini API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        timeout: 10000
      }
    );
    
    // Extract and display the response
    const responseText = response.data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini API test successful!');
    console.log('Response:', responseText);
    
  } catch (error) {
    console.error('❌ Gemini API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testGeminiAPI();