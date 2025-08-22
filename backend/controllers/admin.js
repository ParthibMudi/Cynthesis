const User = require('../models/User');
const Routine = require('../models/Routine');
const Announcement = require('../models/Announcement');
const axios = require('axios');

// @desc    Get all members (teachers/students)
// @route   GET /api/admin/members
// @access  Private/Admin
exports.getMembers = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { role } = req.query;

    let query = { institutionId };
    
    if (role) {
      query.role = role;
    } else {
      query.role = { $in: ['teacher', 'student'] };
    }

    const members = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Generate routine using Gemini AI
// @route   POST /api/admin/routine/generate
// @access  Private/Admin
exports.generateRoutine = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { department, section, subjects, timeSlots, classrooms, additionalRequirements } = req.body;

    if (!department || !section || !subjects || !timeSlots || !classrooms) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Start with status update to client
    res.status(202).json({
      success: true,
      message: 'Routine generation started',
      status: 'processing',
      estimatedTime: '15-30 seconds'
    });
    
    // Process in background
    generateRoutineAsync(req.user, req.body)
      .catch(error => console.error('Background routine generation error:', error));
      
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Asynchronous routine generation process
async function generateRoutineAsync(user, requestData) {
  const { institutionId } = user;
  const { department, section, subjects, timeSlots, classrooms, additionalRequirements } = requestData;
  
  // Extract subject details with credit weighting (default to 1 if not specified)
  const subjectDetails = subjects.map(subject => ({
    name: subject.name,
    teacher: subject.teacher,
    credits: subject.credits || 1
  }));
  
  // Sort subjects by credits (highest first) for weighted distribution
  subjectDetails.sort((a, b) => b.credits - a.credits);
  
  // Extract teacher names and room numbers for the prompt
  const teachers = subjects.map(subject => subject.teacher);
  const rooms = classrooms;
  const subjectNames = subjects.map(subject => subject.name);
  
  // Create subject-teacher mapping for clear constraints
  const subjectTeacherMap = {};
  subjects.forEach(subject => {
    subjectTeacherMap[subject.name] = subject.teacher;
  });

  // Track generation attempts and results
  let generatedSchedule = null;
  let attemptCount = 0;
  let validationErrors = [];
  let generationSource = 'gemini';
  
  // Multi-level fallback system
  try {
    // LEVEL 1: Try Gemini API with retries
    generatedSchedule = await callGeminiWithRetry(
      department, 
      section, 
      subjectDetails, 
      subjectTeacherMap,
      rooms, 
      timeSlots, 
      additionalRequirements
    );
    
    // Validate the AI-generated schedule
    validationErrors = validateSchedule(generatedSchedule, subjectTeacherMap, rooms, timeSlots);
    
    // LEVEL 2: If validation errors exist but schedule is usable, fix conflicts
    if (validationErrors.length > 0) {
      console.log(`Schedule has ${validationErrors.length} validation errors. Attempting to fix...`);
      generatedSchedule = fixScheduleConflicts(generatedSchedule, validationErrors, subjectTeacherMap, rooms, timeSlots);
      generationSource = 'gemini-fixed';
      
      // Re-validate after fixes
      validationErrors = validateSchedule(generatedSchedule, subjectTeacherMap, rooms, timeSlots);
    }
  } catch (error) {
    console.error('Gemini generation failed:', error);
    
    // LEVEL 3: Use weighted programmatic fallback
    try {
      console.log('Using weighted fallback schedule generation');
      generatedSchedule = generateWeightedFallbackSchedule(subjectDetails, teachers, rooms, timeSlots);
      generationSource = 'weighted-fallback';
      
      // Validate the fallback schedule
      validationErrors = validateSchedule(generatedSchedule, subjectTeacherMap, rooms, timeSlots);
    } catch (fallbackError) {
      console.error('Weighted fallback failed:', fallbackError);
      
      // LEVEL 4: Minimal valid schedule as last resort
      console.log('Using minimal fallback schedule generation');
      generatedSchedule = generateMinimalFallbackSchedule(subjects, teachers, rooms, timeSlots);
      generationSource = 'minimal-fallback';
    }
  }
  
  // Save the generated routine to database with metadata
  try {
    const routine = await Routine.findOneAndUpdate(
      { institutionId, department, section },
      { 
        institutionId,
        department,
        section,
        schedule: generatedSchedule,
        metadata: {
          generationSource,
          generatedAt: Date.now(),
          validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
          attemptCount
        },
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );
    
    console.log(`Routine saved for ${department} section ${section} using ${generationSource}`);
    return routine;
  } catch (dbError) {
    console.error('Failed to save routine:', dbError);
    throw dbError;
  }
}

// Enhanced prompt engineering with structured constraints
function createEnhancedPrompt(department, section, subjectDetails, subjectTeacherMap, rooms, timeSlots, additionalRequirements) {
  // Create explicit subject-teacher mapping for clearer constraints
  const subjectTeacherConstraints = Object.entries(subjectTeacherMap)
    .map(([subject, teacher]) => `- Subject "${subject}" must be taught by "${teacher}"`)
    .join('\n');
  
  // Create weighted subject distribution based on credits
  const subjectWeightConstraints = subjectDetails
    .map(subject => `- Subject "${subject.name}" has ${subject.credits} credit(s) and should appear approximately ${subject.credits} time(s) per week`)
    .join('\n');
  
  return `Generate a conflict-free weekly class schedule for department ${department}, section ${section}.

STRICT CONSTRAINTS (MUST BE FOLLOWED):
1. Subject-Teacher Mapping:
${subjectTeacherConstraints}

2. Available Resources:
- Classrooms: ${JSON.stringify(rooms)}
- Time Slots: ${JSON.stringify(timeSlots)}

3. Conflict Rules:
- No teacher can teach two different classes at the same time (CRITICAL)
- No room can be used for two different classes at the same time (CRITICAL)
- All time slots must be from the provided list (CRITICAL)

4. Subject Distribution:
${subjectWeightConstraints}

5. Schedule Balance:
- Distribute subjects evenly across Monday to Friday
- Avoid back-to-back classes for the same teacher when possible
- Maximize time slot utilization for efficient scheduling

${additionalRequirements ? `6. Additional Requirements:\n${additionalRequirements}` : ''}

OUTPUT FORMAT (CRITICAL):
You must return ONLY a valid JSON object with this exact structure:
{
  "Monday": [
    { "time": "9:00-10:00", "subject": "Subject Name", "teacher": "Teacher Name", "room": "Room Number" }
  ],
  "Tuesday": [ ... ],
  "Wednesday": [ ... ],
  "Thursday": [ ... ],
  "Friday": [ ... ]
}

IMPORTANT:
- Your response must contain ONLY the JSON object, nothing else
- No explanations, no markdown formatting, no code blocks
- Ensure all fields match exactly with the provided inputs
- Prioritize conflict-free scheduling above all other considerations`;
}

// Retry mechanism with exponential backoff
async function callGeminiWithRetry(department, section, subjectDetails, subjectTeacherMap, rooms, timeSlots, additionalRequirements) {
  const maxRetries = 3;
  let lastError = null;
  let attemptCount = 0;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    attemptCount++;
    try {
      // Exponential backoff delay
      if (attempt > 1) {
        const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }
      
      // Create enhanced prompt with structured constraints
      const enhancedPrompt = createEnhancedPrompt(
        department, 
        section, 
        subjectDetails, 
        subjectTeacherMap, 
        rooms, 
        timeSlots, 
        additionalRequirements
      );
      
      // Call Gemini API with progressive timeout
      const timeoutMs = 10000 + (attempt * 5000); // 15s, 20s, 25s
      const geminiResponse = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        {
          contents: [{ parts: [{ text: enhancedPrompt }] }],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more deterministic output
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          },
          timeout: timeoutMs
        }
      );
      
      // Extract and parse the JSON response
      const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
      
      // Clean the response text to ensure it's valid JSON
      let cleanedText = responseText.replace(/```json|```/g, '').trim();
      
      // Additional cleaning for common AI response issues
      if (!cleanedText.startsWith('{')) {
        // Find the first opening brace
        const jsonStart = cleanedText.indexOf('{');
        if (jsonStart >= 0) {
          cleanedText = cleanedText.substring(jsonStart);
        }
      }
      
      // Find matching closing brace for the first opening brace
      let braceCount = 0;
      let endIndex = -1;
      
      for (let i = 0; i < cleanedText.length; i++) {
        if (cleanedText[i] === '{') braceCount++;
        if (cleanedText[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      
      if (endIndex > 0) {
        cleanedText = cleanedText.substring(0, endIndex);
      }
      
      // Parse the cleaned JSON
      try {
        const generatedSchedule = JSON.parse(cleanedText);
        console.log(`Successfully generated schedule on attempt ${attempt}`);
        return generatedSchedule;
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Text:', cleanedText);
        throw new Error(`Invalid JSON response from Gemini API: ${parseError.message}`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      lastError = error;
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
      }
    }
  }
}

// Validation layer to detect conflicts and verify structure
function validateSchedule(schedule, subjectTeacherMap, rooms, timeSlots) {
  const errors = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Check for missing days
  days.forEach(day => {
    if (!schedule[day]) {
      errors.push(`Missing day: ${day}`);
      schedule[day] = []; // Initialize to prevent further errors
    }
  });
  
  // Track teacher and room usage by time slot for each day
  const teacherUsage = {};
  const roomUsage = {};
  
  // Initialize tracking objects
  days.forEach(day => {
    teacherUsage[day] = {};
    roomUsage[day] = {};
  });
  
  // Check each day's schedule
  days.forEach(day => {
    const daySchedule = schedule[day] || [];
    
    daySchedule.forEach((session, index) => {
      // Check for required fields
      if (!session.time || !session.subject || !session.teacher || !session.room) {
        errors.push(`Incomplete session data on ${day} at index ${index}`);
        return;
      }
      
      // Validate time slot
      if (!timeSlots.includes(session.time)) {
        errors.push(`Invalid time slot "${session.time}" on ${day} for ${session.subject}`);
      }
      
      // Validate room
      if (!rooms.includes(session.room)) {
        errors.push(`Invalid room "${session.room}" on ${day} for ${session.subject}`);
      }
      
      // Validate teacher-subject mapping
      if (subjectTeacherMap[session.subject] && subjectTeacherMap[session.subject] !== session.teacher) {
        errors.push(`Teacher mismatch: ${session.subject} should be taught by ${subjectTeacherMap[session.subject]}, not ${session.teacher}`);
      }
      
      // Check for teacher conflicts
      if (teacherUsage[day][session.time] && teacherUsage[day][session.time] !== session.teacher) {
        errors.push(`Teacher conflict: ${session.teacher} is scheduled twice at ${session.time} on ${day}`);
      } else {
        teacherUsage[day][session.time] = session.teacher;
      }
      
      // Check for room conflicts
      if (roomUsage[day][session.time] && roomUsage[day][session.time] !== session.room) {
        errors.push(`Room conflict: ${session.room} is scheduled twice at ${session.time} on ${day}`);
      } else {
        roomUsage[day][session.time] = session.room;
      }
    });
  });
  
  return errors;
}

// Fix conflicts in the schedule
function fixScheduleConflicts(schedule, validationErrors, subjectTeacherMap, rooms, timeSlots) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const fixedSchedule = JSON.parse(JSON.stringify(schedule)); // Deep copy
  
  // Track teacher and room usage by time slot for each day
  const teacherUsage = {};
  const roomUsage = {};
  
  // Initialize tracking objects
  days.forEach(day => {
    teacherUsage[day] = {};
    roomUsage[day] = {};
  });
  
  // First pass: Mark valid sessions and identify conflicts
  days.forEach(day => {
    const daySchedule = fixedSchedule[day] || [];
    
    daySchedule.forEach(session => {
      // Skip incomplete sessions
      if (!session.time || !session.subject || !session.teacher || !session.room) {
        return;
      }
      
      // Mark this session as processed
      session._processed = true;
      
      // Track teacher usage
      if (!teacherUsage[day][session.time]) {
        teacherUsage[day][session.time] = session.teacher;
      }
      
      // Track room usage
      if (!roomUsage[day][session.time]) {
        roomUsage[day][session.time] = session.room;
      }
    });
  });
  
  // Second pass: Fix conflicts by moving sessions to available slots
  days.forEach(day => {
    if (!fixedSchedule[day]) fixedSchedule[day] = [];
    
    const daySchedule = fixedSchedule[day];
    const conflictSessions = daySchedule.filter(session => 
      session._processed !== true || 
      teacherUsage[day][session.time] !== session.teacher ||
      roomUsage[day][session.time] !== session.room
    );
    
    // Remove conflict sessions from the day's schedule
    fixedSchedule[day] = daySchedule.filter(session => 
      session._processed === true && 
      teacherUsage[day][session.time] === session.teacher &&
      roomUsage[day][session.time] === session.room
    );
    
    // Clean up temporary properties
    fixedSchedule[day].forEach(session => {
      delete session._processed;
    });
    
    // Try to reschedule conflict sessions
    conflictSessions.forEach(session => {
      delete session._processed;
      
      // Find an available slot on any day
      let placed = false;
      
      for (const targetDay of days) {
        if (placed) break;
        
        for (const slot of timeSlots) {
          // Skip if teacher or room is already used in this slot
          if (teacherUsage[targetDay][slot] === session.teacher || 
              roomUsage[targetDay][slot] === session.room) {
            continue;
          }
          
          // Place the session in this available slot
          teacherUsage[targetDay][slot] = session.teacher;
          roomUsage[targetDay][slot] = session.room;
          
          fixedSchedule[targetDay].push({
            time: slot,
            subject: session.subject,
            teacher: session.teacher,
            room: session.room
          });
          
          placed = true;
          break;
        }
      }
      
      // If we couldn't place the session, try with a different room
      if (!placed && rooms.length > 1) {
        for (const targetDay of days) {
          if (placed) break;
          
          for (const slot of timeSlots) {
            // Skip if teacher is already used in this slot
            if (teacherUsage[targetDay][slot] === session.teacher) {
              continue;
            }
            
            // Find an available room
            for (const room of rooms) {
              if (roomUsage[targetDay][slot] === room) {
                continue;
              }
              
              // Place the session with a different room
              teacherUsage[targetDay][slot] = session.teacher;
              roomUsage[targetDay][slot] = room;
              
              fixedSchedule[targetDay].push({
                time: slot,
                subject: session.subject,
                teacher: session.teacher,
                room: room
              });
              
              placed = true;
              break;
            }
            
            if (placed) break;
          }
        }
      }
    });
  });
  
  return fixedSchedule;
}

// Weighted fallback schedule generator
function generateWeightedFallbackSchedule(subjectDetails, teachers, rooms, timeSlots) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const schedule = {};
  
  // Initialize empty schedule for each day
  days.forEach(day => {
    schedule[day] = [];
  });
  
  // Create a flattened list of subjects based on credits
  const weightedSubjects = [];
  subjectDetails.forEach(subject => {
    // Add each subject multiple times based on its credits (1-4)
    const occurrences = Math.min(Math.max(subject.credits, 1), 4);
    for (let i = 0; i < occurrences; i++) {
      weightedSubjects.push({
        name: subject.name,
        teacher: subject.teacher
      });
    }
  });
  
  // Track teacher and room usage
  const teacherUsage = {};
  const roomUsage = {};
  days.forEach(day => {
    teacherUsage[day] = {};
    roomUsage[day] = {};
  });
  
  // Distribute subjects across days and time slots
  let subjectIndex = 0;
  
  // First, try to place each subject
  while (subjectIndex < weightedSubjects.length) {
    let placed = false;
    const subject = weightedSubjects[subjectIndex];
    
    // Try each day and time slot combination
    for (const day of days) {
      if (placed) break;
      
      for (const timeSlot of timeSlots) {
        // Skip if teacher or any room is already used in this slot
        if (teacherUsage[day][timeSlot] === subject.teacher) {
          continue;
        }
        
        // Find an available room
        let availableRoom = null;
        for (const room of rooms) {
          if (!roomUsage[day][timeSlot] || roomUsage[day][timeSlot] !== room) {
            availableRoom = room;
            break;
          }
        }
        
        if (!availableRoom) continue;
        
        // Place the subject in this slot
        teacherUsage[day][timeSlot] = subject.teacher;
        roomUsage[day][timeSlot] = availableRoom;
        
        schedule[day].push({
          time: timeSlot,
          subject: subject.name,
          teacher: subject.teacher,
          room: availableRoom
        });
        
        placed = true;
        break;
      }
    }
    
    // Move to next subject regardless of placement
    subjectIndex++;
  }
  
  return schedule;
}

// Minimal fallback schedule as last resort
function generateMinimalFallbackSchedule(subjects, teachers, rooms, timeSlots) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const schedule = {};
  
  // Initialize empty schedule for each day
  days.forEach(day => {
    schedule[day] = [];
  });
  
  // Ensure we have at least one subject, teacher, room, and time slot
  if (!subjects.length || !teachers.length || !rooms.length || !timeSlots.length) {
    return schedule;
  }
  
  // Distribute subjects across days and time slots
  let dayIndex = 0;
  let slotIndex = 0;
  
  // Assign each subject to a time slot
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const teacher = teachers[i % teachers.length];
    const room = rooms[i % rooms.length];
    const timeSlot = timeSlots[slotIndex % timeSlots.length];
    const day = days[dayIndex % days.length];
    
    schedule[day].push({
      time: timeSlot,
      subject: subject.name || subject,
      teacher: subject.teacher || teacher,
      room: room
    });
    
    // Move to next day for balanced distribution
    dayIndex++;
    
    // If we've gone through all days, move to the next time slot
    if (dayIndex % days.length === 0) {
      slotIndex++;
    }
  }
  
  return schedule;
}

// @desc    Create announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { title, content, target } = req.body;

    if (!title || !content || !target) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content and target audience'
      });
    }

    const announcement = await Announcement.create({
      institutionId,
      title,
      content,
      target,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Add department to institution
// @route   POST /api/admin/department
// @access  Private/Admin
exports.addDepartment = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { department } = req.body;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department name'
      });
    }

    const institution = await Institution.findOne({ institutionId });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Check if department already exists
    if (institution.departments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Department already exists'
      });
    }

    institution.departments.push(department);
    await institution.save();

    res.status(200).json({
      success: true,
      data: institution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all routines
// @route   GET /api/admin/routines
// @access  Private/Admin
exports.getRoutines = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { department } = req.query;

    let query = { institutionId };
    
    if (department) {
      query.department = department;
    }

    const routines = await Routine.find(query);

    res.status(200).json({
      success: true,
      count: routines.length,
      data: routines
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get routine by department and section
// @route   GET /api/admin/routines/:department/:section
// @access  Private/Admin
exports.getRoutineByDepartment = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { department, section } = req.params;

    const routine = await Routine.findOne({ 
      institutionId, 
      department,
      section: section || 'A' // Default to section A if not provided
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Save routine
// @route   POST /api/admin/routines/save
// @access  Private/Admin
exports.saveRoutine = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { department, section, schedule } = req.body;

    if (!department || !section || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department, section and schedule'
      });
    }

    const routine = await Routine.findOneAndUpdate(
      { institutionId, department, section },
      { 
        institutionId,
        department,
        section,
        schedule,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Save multiple routines
// @route   POST /api/admin/routines/save-multiple
// @access  Private/Admin
exports.saveMultipleRoutines = async (req, res) => {
  try {
    const { institutionId } = req.user;
    const { routines } = req.body;
    
    // Validate input
    if (!routines || !Array.isArray(routines) || routines.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid routines array is required' 
      });
    }

    const results = {
      success: [],
      failed: []
    };

    // Process each routine
    for (const routineData of routines) {
      const { department, section, schedule } = routineData;
      
      // Validate each routine
      if (!department || !section || !schedule) {
        results.failed.push({ department, section, reason: 'Missing required fields' });
        continue;
      }

      try {
        // Find and update or create new routine
        const routine = await Routine.findOneAndUpdate(
          { institutionId, department, section },
          { 
            institutionId,
            department, 
            section, 
            schedule,
            updatedAt: Date.now()
          },
          { new: true, upsert: true }
        );
        
        results.success.push({ department, section, id: routine._id });
      } catch (error) {
        console.error(`Error saving routine for ${department}:`, error);
        results.failed.push({ department, section, reason: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Saved ${results.success.length} routines, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    console.error('Error saving multiple routines:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};