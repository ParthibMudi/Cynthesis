const axios = require('axios');

async function registerAdmin() {
  try {
    console.log('Registering admin user...');
    
    // Register admin
    const response = await axios.post(
      'http://localhost:5000/api/auth/register-admin',
      {
        name: "Test Admin",
        email: "admin@test.com",
        password: "admin123",
        institutionName: "Test Institution",
        institutionAddress: "Test Address"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Admin registered successfully!');
    console.log('Admin ID:', response.data.user.userId);
    console.log('Token:', response.data.token);
    
  } catch (error) {
    console.error('❌ Admin registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the registration
registerAdmin();