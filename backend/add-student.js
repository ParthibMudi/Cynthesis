const axios = require('axios');

async function addStudent() {
  try {
    console.log('Adding student user...');
    
    // First, login as admin to get authentication token
    console.log('Logging in as admin...');
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
    console.log('✅ Admin login successful! Token received.');
    
    // Add student
    const response = await axios.post(
      'http://localhost:5000/api/auth/add-member',
      {
        institutionId: "INST-48713591",
        name: "Test Student",
        role: "student",
        department: "CSE A & B"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Student added successfully!');
    console.log('Student ID:', response.data.data.userId);
    console.log('Default Password:', response.data.data.defaultPassword);
    
  } catch (error) {
    console.error('❌ Failed to add student:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the function
addStudent();