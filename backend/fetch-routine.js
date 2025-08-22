const axios = require('axios');

async function fetchRoutine() {
  try {
    console.log('Fetching routine...');
    
    // First, login to get authentication token
    console.log('Logging in to get authentication token...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        userId: "ADM8823",
        password: "admin123"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful! Token received.');
    
    // Fetch the routine
    const response = await axios.get(
      'http://localhost:5000/api/admin/routines/CSE%20A%20%26%20B/A',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Routine fetched successfully!');
    console.log('Routine data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Failed to fetch routine:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the fetch
fetchRoutine();