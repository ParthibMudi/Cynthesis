const axios = require('axios');

async function testFullFlow() {
  try {
    console.log('🧪 Testing full routine generation and fetching flow...\n');
    
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(
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
    
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful!\n');
    
    // 2. Generate routine
    console.log('2. Generating routine...');
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
    
    const generateResponse = await axios.post(
      'http://localhost:5000/api/admin/routine/generate',
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    
    console.log('✅ Routine generation request sent successfully!');
    console.log('Message:', generateResponse.data.message);
    console.log('Status:', generateResponse.data.status);
    console.log();
    
    // 3. Wait a moment for generation to complete
    console.log('3. Waiting for routine generation to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Wait completed!\n');
    
    // 4. Login as student
    console.log('4. Logging in as student...');
    const studentLoginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        userId: "STD3133",
        password: "STD3133@123"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const studentToken = studentLoginResponse.data.token;
    console.log('✅ Student login successful!\n');
    
    // 5. Fetch routine from student API
    console.log('5. Fetching routine from student API...');
    const fetchResponse = await axios.get(
      'http://localhost:5000/api/student/routine',
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      }
    );
    
    console.log('✅ Routine fetched successfully from student API!');
    console.log('Success:', fetchResponse.data.success);
    console.log('Days with schedule:', Object.keys(fetchResponse.data.data).filter(day => fetchResponse.data.data[day].length > 0).length);
    console.log();
    
    // 6. Display a sample of the routine
    console.log('6. Sample routine data:');
    const routine = fetchResponse.data.data;
    if (routine.Monday && routine.Monday.length > 0) {
      console.log('Monday schedule:');
      routine.Monday.slice(0, 3).forEach((slot, index) => {
        console.log(`  ${index + 1}. ${slot.time} - ${slot.subject} by ${slot.teacher} in ${slot.room}`);
      });
      if (routine.Monday.length > 3) {
        console.log(`  ... and ${routine.Monday.length - 3} more classes`);
      }
    }
    
    console.log('\n🎉 Full flow test completed successfully!');
    console.log('✅ Routine generation and fetching is working correctly!');
    
  } catch (error) {
    console.error('❌ Full flow test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the full flow test
testFullFlow();