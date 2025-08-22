const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function testRoutineGeneration() {
  try {
    console.log('Testing routine generation...');
    
    // First, login to get authentication token
    console.log('Logging in to get authentication token...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        userId: "ADM8823", // Use the admin ID we just registered
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
    
    // Prepare test data
    const testData = {
      department: "CSE A & B",
      section: "A",
      subjects: [
        { name: "Data Structures & Algorithms", teacher: "Prof. Ananya Sharma", credits: 5 },
        { name: "Object-Oriented Programming", teacher: "Dr. Ben Carter", credits: 4 },
        { name: "Database Management Systems", teacher: "Prof. Chloe Davis", credits: 4 },
        { name: "Computer Organization", teacher: "Dr. David Chen", credits: 3 }
      ],
      timeSlots: ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00", "3:00-4:00", "4:00-5:00"],
      classrooms: ["LH-101", "LH-102", "CR-101", "CR-102", "CS-Lab-A"],
      additionalRequirements: "No classes after 4 PM on Fridays"
    };
    
    console.log('Sending request to backend API...');
    
    // Call the backend API to generate routine with authentication
    const response = await axios.post(
      'http://localhost:5000/api/admin/routine/generate',
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Routine generation request sent successfully!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Routine generation test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testRoutineGeneration();