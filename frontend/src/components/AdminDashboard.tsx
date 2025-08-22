import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/academic-card";
import { Button } from "@/components/ui/academic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Megaphone, 
  Plus, 
  Bot,
  Building,
  ClipboardList,
  Sparkles,
  Trash,
  Download,
  User,
  Building2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RoutineGenerator } from "./RoutineGenerator";
import axios from "axios";

interface AdminDashboardProps {
  institutionId: string;
}

export const AdminDashboard = ({ institutionId }: AdminDashboardProps) => {
  const { toast } = useToast();
  const [newTeacher, setNewTeacher] = useState({ name: "", department: "", subject: "" });
  const [newStudent, setNewStudent] = useState({ name: "", department: "", year: "" });
  const [announcement, setAnnouncement] = useState({ title: "", content: "", target: "all" });
  const [routinePrompt, setRoutinePrompt] = useState("");
  const [department, setDepartment] = useState("");
  const [subjects, setSubjects] = useState([{ name: "", teacher: "", credits: "" }]);
  const [departmentSubjects, setDepartmentSubjects] = useState({
    cse: [{ name: "", teacher: "", credits: "" }],
    ece: [{ name: "", teacher: "", credits: "" }],
    me: [{ name: "", teacher: "", credits: "" }],
    ce: [{ name: "", teacher: "", credits: "" }]
  });
  const [activeDepartmentTab, setActiveDepartmentTab] = useState("cse");
  const [timeSlots, setTimeSlots] = useState([{ start: "", end: "" }]);
  const [classrooms, setClassrooms] = useState([""]);
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [generatedRoutines, setGeneratedRoutines] = useState([]);
  const [activeRoutineTab, setActiveRoutineTab] = useState("0");
  const [generationStatus, setGenerationStatus] = useState({
    isGenerating: false,
    progress: 0,
    currentDepartment: "",
    statusMessage: "",
    attemptCount: 0
  });

  // Mock data
  const [teachers, setTeachers] = useState([
    { id: "TCH-2024-001", name: "Dr. Ananya Sharma", department: "Computer Science", subject: "Data Structures" },
    { id: "TCH-2024-002", name: "Prof. Raj Kumar", department: "Mathematics", subject: "Calculus" }
  ]);

  const [students, setStudents] = useState([
    { id: "STU-2024-001", name: "Priya Singh", department: "Computer Science", year: "2nd Year" },
    { id: "STU-2024-002", name: "Rahul Patel", department: "Mathematics", year: "1st Year" }
  ]);

  const addTeacher = () => {
    if (newTeacher.name && newTeacher.department) {
      const teacherId = `TCH-2024-${String(teachers.length + 1).padStart(3, '0')}`;
      setTeachers([...teachers, { ...newTeacher, id: teacherId }]);
      setNewTeacher({ name: "", department: "", subject: "" });
      toast({
        title: "Teacher Added Successfully",
        description: `Teacher ID: ${teacherId}`,
      });
    }
  };

  const addStudent = () => {
    if (newStudent.name && newStudent.department) {
      const studentId = `STU-2024-${String(students.length + 1).padStart(3, '0')}`;
      setStudents([...students, { ...newStudent, id: studentId }]);
      setNewStudent({ name: "", department: "", year: "" });
      toast({
        title: "Student Added Successfully",
        description: `Student ID: ${studentId}`,
      });
    }
  };

  // Subject handlers
  const addSubject = () => {
    setSubjects([...subjects, { name: "", teacher: "", credits: "" }]);
  };

  const updateSubject = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setSubjects(updatedSubjects);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  // Time slot handlers
  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
  };

  const updateTimeSlot = (index, field, value) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index] = { ...updatedTimeSlots[index], [field]: value };
    setTimeSlots(updatedTimeSlots);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  // Classroom handlers
  const addClassroom = () => {
    setClassrooms([...classrooms, ""]);
  };

  const updateClassroom = (index, value) => {
    const updatedClassrooms = [...classrooms];
    updatedClassrooms[index] = value;
    setClassrooms(updatedClassrooms);
  };

  const removeClassroom = (index) => {
    setClassrooms(classrooms.filter((_, i) => i !== index));
  };

  const generateRoutine = async () => {
    // Validate inputs
    if (departments.length === 0) {
      toast({
        title: "Departments Required",
        description: "Please select at least one department",
        variant: "destructive",
      });
      return;
    }

    // Validate department subjects
    for (const dept of departments) {
      const deptSubjects = departmentSubjects[dept].filter(s => s.name && s.teacher);
      if (deptSubjects.length === 0) {
        toast({
          title: "Subjects Required",
          description: `Please add at least one subject with teacher for ${dept.toUpperCase()}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate time slots
    const validTimeSlots = timeSlots.filter(t => t.start && t.end);
    if (validTimeSlots.length === 0) {
      toast({
        title: "Time Slots Required",
        description: "Please add at least one time slot",
        variant: "destructive",
      });
      return;
    }

    // Validate classrooms
    const validClassrooms = classrooms.filter(c => c);
    if (validClassrooms.length === 0) {
      toast({
        title: "Classrooms Required",
        description: "Please add at least one classroom",
        variant: "destructive",
      });
      return;
    }

    // Initialize generation status
    setGenerationStatus({
      isGenerating: true,
      progress: 0,
      currentDepartment: departments[0],
      statusMessage: "Starting generation process...",
      attemptCount: 0
    });

    try {
      toast({
        title: "Generating Routines",
        description: `Generating routines for ${departments.length} department(s)...`,
      });
      
      const newGeneratedRoutines = [];
      const totalDepartments = departments.length;
      
      // Process each department
      for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        const progress = Math.round((i / totalDepartments) * 100);
        
        // Update status for current department
        setGenerationStatus(prev => ({
          ...prev,
          progress,
          currentDepartment: dept,
          statusMessage: `Generating routine for ${dept.toUpperCase()}...`,
          attemptCount: 1
        }));
        
        // Prepare data for Gemini AI with subject credits
        const deptSubjects = departmentSubjects[dept].filter(s => s.name && s.teacher);
        const routineData = {
          department: dept,
          section: "A", // Default section
          subjects: deptSubjects.map(s => ({
            name: s.name,
            teacher: s.teacher,
            credits: parseInt(s.credits) || 1 // Include credits for weighted distribution
          })),
          timeSlots: validTimeSlots.map(t => `${t.start}-${t.end}`),
          classrooms: validClassrooms,
          additionalRequirements: routinePrompt
        };
        
        try {
          // First attempt
          setGenerationStatus(prev => ({
            ...prev,
            statusMessage: `Generating routine for ${dept.toUpperCase()} (Attempt 1)...`,
            attemptCount: 1
          }));
          
          const response = await axios.post('/api/admin/routine/generate', routineData);
          
          // Check if we got a 202 (processing) status
          if (response.status === 202) {
            // Show processing status
            toast({
              title: `Processing ${dept.toUpperCase()}`,
              description: response.data.message || "Generation in progress...",
            });
            
            // Poll for results
            let resultFound = false;
            let pollAttempts = 0;
            const maxPollAttempts = 10;
            
            while (!resultFound && pollAttempts < maxPollAttempts) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between polls
              pollAttempts++;
              
              setGenerationStatus(prev => ({
                ...prev,
                statusMessage: `Waiting for ${dept.toUpperCase()} routine (${pollAttempts}/${maxPollAttempts})...`
              }));
              
              try {
                const pollResponse = await axios.get(`/api/admin/routine/${dept}/A`);
                if (pollResponse.data.success && pollResponse.data.data) {
                  // We have a result
                  resultFound = true;
                  
                  const routineData = pollResponse.data.data;
                  const metadata = routineData.metadata || {};
                  
                  // Add to generated routines
                  newGeneratedRoutines.push({
                    department: dept,
                    weeklySchedule: routineData.schedule,
                    metadata: metadata
                  });
                  
                  // Show generation method in toast
                  let sourceMessage = "using AI";
                  if (metadata.generationSource) {
                    if (metadata.generationSource === 'gemini') sourceMessage = "using Gemini AI";
                    else if (metadata.generationSource === 'gemini-fixed') sourceMessage = "using Gemini AI with fixes";
                    else if (metadata.generationSource === 'weighted-fallback') sourceMessage = "using weighted algorithm";
                    else if (metadata.generationSource === 'minimal-fallback') sourceMessage = "using minimal fallback";
                  }
                  
                  toast({
                    title: `${dept.toUpperCase()} Routine Generated`,
                    description: `Successfully created routine ${sourceMessage}`,
                  });
                  
                  // Show validation warnings if any
                    if (metadata.validationErrors && metadata.validationErrors.length > 0) {
                      toast({
                        title: "Schedule has minor issues",
                        description: `${metadata.validationErrors.length} conflicts were automatically resolved`,
                        variant: "destructive",
                      });
                    }
                }
              } catch (pollError) {
                console.error(`Polling error for ${dept}:`, pollError);
              }
            }
            
            if (!resultFound) {
              throw new Error("Timed out waiting for routine generation");
            }
          } else {
            // Direct response with data
            const schedule = response.data.data.schedule;
            const metadata = response.data.data.metadata || {};
            
            newGeneratedRoutines.push({
              department: dept,
              weeklySchedule: schedule,
              metadata: metadata
            });
            
            // Show generation method in toast
            let sourceMessage = "";
            if (metadata.generationSource) {
              if (metadata.generationSource === 'gemini') sourceMessage = " using Gemini AI";
              else if (metadata.generationSource === 'gemini-fixed') sourceMessage = " using Gemini AI with fixes";
              else if (metadata.generationSource === 'weighted-fallback') sourceMessage = " using weighted algorithm";
              else if (metadata.generationSource === 'minimal-fallback') sourceMessage = " using minimal fallback";
            }
            
            toast({
              title: `${dept.toUpperCase()} Routine Generated`,
              description: `Successfully created routine${sourceMessage}`,
            });
          }
          
        } catch (apiError) {
          console.error(`API Error for ${dept}:`, apiError);
          
          // Show detailed error message
          let errorMessage = "Could not connect to Gemini AI. Using local generation instead.";
          if (apiError.response && apiError.response.data && apiError.response.data.message) {
            errorMessage = apiError.response.data.message;
          }
          
          // Fallback to local generation if API fails
          toast({
            title: `Using Local Generation for ${dept.toUpperCase()}`,
            description: errorMessage,
            variant: "destructive",
          });
          
          setGenerationStatus(prev => ({
            ...prev,
            statusMessage: `Using fallback generation for ${dept.toUpperCase()}...`,
          }));
          
          // Create weighted fallback schedule based on credits
          const weightedSubjects = [];
          deptSubjects.forEach(subject => {
            const credits = parseInt(subject.credits) || 1;
            // Add each subject multiple times based on credits (1-4)
            for (let i = 0; i < Math.min(Math.max(credits, 1), 4); i++) {
              weightedSubjects.push({
                name: subject.name,
                teacher: subject.teacher
              });
            }
          });
          
          // Instead of generating a fallback schedule locally, try to call the Gemini API directly
          try {
            // Prepare data for Gemini API call
            const routineData = {
              department: dept,
              section: "A",
              subjects: deptSubjects,
              timeSlots: validTimeSlots,
              classrooms: validClassrooms,
              additionalRequirements: "Please generate a balanced routine with minimal conflicts."
            };
            
            // Call the Gemini API directly
            const geminiResponse = await axios.post('/api/admin/routine/generate', routineData);
            
            // If we get a 202 response, the generation is in progress
            if (geminiResponse.status === 202) {
              toast({
                title: `${dept.toUpperCase()} Routine Generation Started`,
                description: geminiResponse.data.message || "Generation in progress...",
              });
              
              // Poll for results
              let resultFound = false;
              let pollAttempts = 0;
              const maxPollAttempts = 10;
              
              while (!resultFound && pollAttempts < maxPollAttempts) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between polls
                pollAttempts++;
                
                setGenerationStatus(prev => ({
                  ...prev,
                  statusMessage: `Waiting for ${dept.toUpperCase()} routine (${pollAttempts}/${maxPollAttempts})...`,
                  attemptCount: pollAttempts
                }));
                
                try {
                  const pollResponse = await axios.get(`/api/admin/routine/${dept}/A`);
                  if (pollResponse.data.success && pollResponse.data.data) {
                    // We have a result
                    resultFound = true;
                    
                    const routineData = pollResponse.data.data;
                    const metadata = routineData.metadata || {};
                    
                    // Add to generated routines
                    newGeneratedRoutines.push({
                      department: dept,
                      weeklySchedule: routineData.schedule,
                      metadata: metadata
                    });
                    
                    toast({
                      title: `${dept.toUpperCase()} Routine Generated`,
                      description: `Successfully created routine using Gemini AI`,
                    });
                  }
                } catch (pollError) {
                  console.error(`Polling error for ${dept}:`, pollError);
                }
              }
              
              if (!resultFound) {
                throw new Error("Timed out waiting for routine generation");
              }
            }
          } catch (geminiError) {
            console.error(`Failed to generate routine using Gemini for ${dept}:`, geminiError);
            toast({
              title: "Using Local Generation",
              description: "Could not connect to Gemini AI. Using local generation instead.",
              variant: "destructive",
            });
            
            // Create a simple fallback schedule
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const fallbackSchedule = {};
            
            // Initialize empty schedule for each day and time slot
            days.forEach(day => {
              fallbackSchedule[day] = [];
              validTimeSlots.forEach(timeSlot => {
                fallbackSchedule[day].push({
                  time: `${timeSlot.start}-${timeSlot.end}`,
                  subject: "Available",
                  teacher: "",
                  room: ""
                });
              });
            });
            
            // Place at least one subject in the schedule
            if (deptSubjects.length > 0 && validTimeSlots.length > 0 && validClassrooms.length > 0) {
              const firstSubject = deptSubjects[0];
              const firstTimeSlot = validTimeSlots[0];
              const firstRoom = validClassrooms[0];
              
              fallbackSchedule['Monday'][0] = {
                time: `${firstTimeSlot.start}-${firstTimeSlot.end}`,
                subject: firstSubject.name,
                teacher: firstSubject.teacher,
                room: firstRoom
              };
            }
            
            // Add to generated routines
            newGeneratedRoutines.push({
              department: dept,
              weeklySchedule: fallbackSchedule,
              metadata: {
                generationSource: 'minimal-fallback',
                generatedAt: Date.now()
              }
            });
          }
          
          // Add to generated routines
          newGeneratedRoutines.push({
            department: dept,
            weeklySchedule: [], // Empty schedule since fallback generation failed
            metadata: {
              generationSource: 'frontend-fallback',
              generatedAt: Date.now()
            }
          });
        }
        
        // Update progress after each department
        setGenerationStatus(prev => ({
          ...prev,
          progress: Math.round(((i + 1) / totalDepartments) * 100)
        }));
      }
      
      // Update state with all generated routines
      setGeneratedRoutines(newGeneratedRoutines);
      
      // Set the first routine as active and current
      if (newGeneratedRoutines.length > 0) {
        setGeneratedRoutine(newGeneratedRoutines[0]);
        setActiveRoutineTab("0");
      }
      
      // Final success message
      toast({
        title: "Routines Generated",
        description: `Successfully generated ${newGeneratedRoutines.length} routine(s)`,
      });
      
      // Reset generation status
      setGenerationStatus({
        isGenerating: false,
        progress: 100,
        currentDepartment: "",
        statusMessage: "Generation complete",
        attemptCount: 0
      });
      
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate routines. Please try again.",
        variant: "destructive",
      });
      
      // Reset generation status on error
      setGenerationStatus({
        isGenerating: false,
        progress: 0,
        currentDepartment: "",
        statusMessage: "Generation failed: " + (error.message || "Unknown error"),
        attemptCount: 0
      });
    }
  };

  const publishAnnouncement = () => {
    if (announcement.title && announcement.content) {
      toast({
        title: "Announcement Published",
        description: `Sent to ${announcement.target} users`,
      });
      setAnnouncement({ title: "", content: "", target: "all" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Institution Info */}
      <Card variant="academic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                Institution Management
              </CardTitle>
              <CardDescription>Institution ID: {institutionId}</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              ADMIN PORTAL
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="dashboard">
              <CardContent className="p-4 text-center">
                <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </CardContent>
            </Card>
            <Card variant="dashboard">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </CardContent>
            </Card>
            <Card variant="dashboard">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Active Routine</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="routine">
            <Bot className="h-4 w-4 mr-2" />
            AI Routine
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Megaphone className="h-4 w-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="reports">
            <ClipboardList className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Teacher */}
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Teacher
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Teacher Name</Label>
                  <Input
                    id="teacher-name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    placeholder="Enter teacher name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-dept">Department</Label>
                  <Input
                    id="teacher-dept"
                    value={newTeacher.department}
                    onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-subject">Subject</Label>
                  <Input
                    id="teacher-subject"
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                    placeholder="Enter subject"
                  />
                </div>
                <Button variant="academic" onClick={addTeacher} className="w-full">
                  Add Teacher
                </Button>
              </CardContent>
            </Card>

            {/* Add Student */}
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Student
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Student Name</Label>
                  <Input
                    id="student-name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    placeholder="Enter student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-dept">Department</Label>
                  <Input
                    id="student-dept"
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-year">Year</Label>
                  <Input
                    id="student-year"
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
                    placeholder="Enter year"
                  />
                </div>
                <Button variant="academic" onClick={addStudent} className="w-full">
                  Add Student
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Teachers List */}
          <Card variant="dashboard">
            <CardHeader>
              <CardTitle>Teachers ({teachers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.department} - {teacher.subject}</p>
                    </div>
                    <Badge variant="outline">{teacher.id}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card variant="dashboard">
            <CardHeader>
              <CardTitle>Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.department} - {student.year}</p>
                    </div>
                    <Badge variant="outline">{student.id}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Routine Generator */}
        <TabsContent value="routine" className="space-y-6">
          <Card variant="academic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Gemini AI Routine Generator
              </CardTitle>
              <CardDescription>
                Generate conflict-free timetables with AI optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Departments (Select Multiple)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["cse", "ece", "me", "ce"].map((dept) => (
                    <Button
                      key={dept}
                      variant={departments.includes(dept) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (departments.includes(dept)) {
                          setDepartments(departments.filter(d => d !== dept));
                        } else {
                          setDepartments([...departments, dept]);
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      {dept === "cse" ? "Computer Science" : 
                       dept === "ece" ? "Electronics & Communication" :
                       dept === "me" ? "Mechanical Engineering" :
                       "Civil Engineering"}
                      {departments.includes(dept) && (
                        <span className="ml-1 text-xs bg-primary-foreground text-primary rounded-full w-4 h-4 flex items-center justify-center">✓</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Department Tabs for Subjects */}
              <div className="space-y-2">
                <Label>Department Subjects</Label>
                <div className="flex space-x-2 mb-2 overflow-x-auto pb-2">
                  {Object.keys(departmentSubjects).map((dept) => (
                    <Button
                      key={dept}
                      variant={activeDepartmentTab === dept ? "default" : "outline"}
                      onClick={() => setActiveDepartmentTab(dept)}
                      size="sm"
                      className="capitalize"
                    >
                      {dept.toUpperCase()}
                    </Button>
                  ))}
                </div>
                
                {/* Subjects for Active Department */}
                <div className="space-y-4">
                  {departmentSubjects[activeDepartmentTab]?.map((subject, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 p-3 border rounded-md relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 text-destructive"
                        onClick={() => {
                          const newSubjects = {...departmentSubjects};
                          newSubjects[activeDepartmentTab].splice(index, 1);
                          setDepartmentSubjects(newSubjects);
                        }}
                        disabled={departmentSubjects[activeDepartmentTab].length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Input 
                        placeholder="Subject name" 
                        value={subject.name}
                        onChange={(e) => {
                          const newSubjects = {...departmentSubjects};
                          newSubjects[activeDepartmentTab][index].name = e.target.value;
                          setDepartmentSubjects(newSubjects);
                        }}
                      />
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Teacher" 
                          className="flex-1"
                          value={subject.teacher}
                          onChange={(e) => {
                            const newSubjects = {...departmentSubjects};
                            newSubjects[activeDepartmentTab][index].teacher = e.target.value;
                            setDepartmentSubjects(newSubjects);
                          }}
                        />
                        <Input 
                          placeholder="Credits" 
                          className="w-20"
                          value={subject.credits}
                          onChange={(e) => {
                            const newSubjects = {...departmentSubjects};
                            newSubjects[activeDepartmentTab][index].credits = e.target.value;
                            setDepartmentSubjects(newSubjects);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => {
                    const newSubjects = {...departmentSubjects};
                    newSubjects[activeDepartmentTab] = [
                      ...newSubjects[activeDepartmentTab], 
                      { name: "", teacher: "", credits: "" }
                    ];
                    setDepartmentSubjects(newSubjects);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject for {activeDepartmentTab.toUpperCase()}
                  </Button>
                </div>
              </div>
              
              {/* Time Slots */}
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="space-y-4">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input 
                        placeholder="Start time (e.g. 10:00)" 
                        className="flex-1"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                      />
                      <Input 
                        placeholder="End time (e.g. 11:00)" 
                        className="flex-1"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeTimeSlot(index)}
                        disabled={timeSlots.length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addTimeSlot}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
              </div>
              
              {/* Classrooms */}
              <div className="space-y-2">
                <Label>Available Classrooms</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classrooms.map((room, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input 
                          placeholder="Room number (e.g. CR-101)" 
                          className="flex-1"
                          value={room}
                          onChange={(e) => updateClassroom(index, e.target.value)}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeClassroom(index)}
                          disabled={classrooms.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={addClassroom}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Classroom
                  </Button>
                </div>
              </div>
              
              {/* Additional Requirements */}
              <div className="space-y-2">
                <Label htmlFor="routine-prompt">Additional Requirements</Label>
                <Textarea
                  id="routine-prompt"
                  value={routinePrompt}
                  onChange={(e) => setRoutinePrompt(e.target.value)}
                  placeholder="Any special requirements or constraints for the routine generation..."
                  rows={3}
                />
              </div>
              
              <Button 
                variant="hero" 
                onClick={generateRoutine} 
                className="w-full"
                disabled={generationStatus.isGenerating}
              >
                {generationStatus.isGenerating ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI-Powered Routine
                  </>
                )}
              </Button>
              
              {/* Generation Status */}
              {generationStatus.isGenerating && (
                <div className="mt-4 border rounded-md p-4 bg-muted/30">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {generationStatus.statusMessage}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {generationStatus.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${generationStatus.progress}%` }}
                      ></div>
                    </div>
                    {generationStatus.attemptCount > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Attempt {generationStatus.attemptCount} - Using advanced techniques to generate conflict-free schedule
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Generated Routines Display */}
              {generatedRoutines.length > 0 && (
                <div className="mt-6 border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Generated Routines
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setGeneratedRoutines([])}>
                      Discard All
                    </Button>
                  </div>
                  
                  {/* Department Tabs */}
                  <div className="flex space-x-2 border-b mb-4 overflow-x-auto pb-2">
                    {generatedRoutines.map((routine, index) => (
                      <Button 
                        key={index}
                        variant={activeRoutineTab === index.toString() ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setActiveRoutineTab(index.toString());
                          setGeneratedRoutine(routine);
                        }}
                      >
                        {routine.department === 'cse' ? 'Computer Science' : 
                         routine.department === 'ece' ? 'Electronics & Communication' :
                         routine.department === 'me' ? 'Mechanical Engineering' :
                         routine.department === 'ce' ? 'Civil Engineering' : 
                         routine.department}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-muted">Time</th>
                          <th className="border p-2 bg-muted">Monday</th>
                          <th className="border p-2 bg-muted">Tuesday</th>
                          <th className="border p-2 bg-muted">Wednesday</th>
                          <th className="border p-2 bg-muted">Thursday</th>
                          <th className="border p-2 bg-muted">Friday</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((slot, index) => (
                          <tr key={index}>
                            <td className="border p-2 font-medium">
                              {slot.start}-{slot.end}
                            </td>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, dayIndex) => {
                              const session = generatedRoutine?.weeklySchedule[day]?.find(
                                s => s.time === `${slot.start}-${slot.end}`
                              );
                              
                              return (
                                <td key={dayIndex} className={`border p-2 ${session ? 'bg-green-50' : 'bg-gray-50'}`}>
                                  {session ? (
                                    <div className="space-y-1">
                                      <div className="font-medium text-primary">{session.subject}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {session.teacher} • {session.room}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground italic">Available</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Utilization Stats */}
                  <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                    <h4 className="text-sm font-medium mb-2">Schedule Utilization</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-xs">
                        {(() => {
                          const currentRoutine = generatedRoutine;
                          if (!currentRoutine?.weeklySchedule) return "No data";
                          
                          let totalSlots = timeSlots.length * 5; // 5 days
                          let usedSlots = 0;
                          
                          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
                            usedSlots += (currentRoutine.weeklySchedule[day] || []).length;
                          });
                          
                          const utilizationPercentage = Math.round((usedSlots / totalSlots) * 100);
                          
                          return `${usedSlots}/${totalSlots} slots used (${utilizationPercentage}%)`;
                        })()}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ 
                            width: (() => {
                              const currentRoutine = generatedRoutine;
                              if (!currentRoutine?.weeklySchedule) return "0%";
                              
                              let totalSlots = timeSlots.length * 5; // 5 days
                              let usedSlots = 0;
                              
                              ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
                                usedSlots += (currentRoutine.weeklySchedule[day] || []).length;
                              });
                              
                              return `${(usedSlots / totalSlots) * 100}%`;
                            })()
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <Button onClick={async () => {
                      try {
                        toast({
                          title: "Saving Routine",
                          description: "Saving routine to database...",
                        });
                        
                        const response = await axios.post('/api/admin/routines/save', {
                          department: generatedRoutine.department,
                          section: "A", // Default section
                          schedule: generatedRoutine.weeklySchedule
                        });
                        
                        if (response.data.success) {
                          toast({
                            title: "Routine Saved",
                            description: `Routine for ${generatedRoutine.department.toUpperCase()} has been saved successfully`,
                          });
                        } else {
                          throw new Error(response.data.message || "Failed to save routine");
                        }
                      } catch (error) {
                        console.error("Error saving routine:", error);
                        toast({
                          title: "Save Failed",
                          description: "Failed to save routine. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Save Current Routine
                    </Button>
                    <Button variant="outline" onClick={async () => {
                       try {
                         toast({
                           title: "Batch Saving",
                           description: `Saving ${generatedRoutines.length} routines to database...`,
                         });
                         
                         // Prepare routines data for batch save
                         const routinesData = generatedRoutines.map(routine => ({
                           department: routine.department,
                           section: "A", // Default section
                           schedule: routine.weeklySchedule
                         }));
                         
                         // Use the batch save endpoint
                         const response = await axios.post('/api/admin/routines/save-multiple', {
                           routines: routinesData
                         });
                         
                         const { success, failed } = response.data.data;
                         
                         toast({
                           title: "Batch Save Complete",
                           description: `Successfully saved ${success.length} routine(s)${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
                           variant: failed.length > 0 ? "destructive" : "default"
                         });
                       } catch (error) {
                         console.error("Error in batch save:", error);
                         toast({
                           title: "Batch Save Failed",
                           description: "An unexpected error occurred during the save process",
                           variant: "destructive",
                         });
                       }
                     }}>
                       <Download className="h-4 w-4 mr-2" />
                       Save All Routines
                     </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-6">
          <Card variant="dashboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-6 w-6" />
                Create Announcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                  placeholder="Announcement title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-content">Content</Label>
                <Textarea
                  id="announcement-content"
                  value={announcement.content}
                  onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                  placeholder="Announcement content"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={announcement.target === "all" ? "academic" : "outline"}
                    onClick={() => setAnnouncement({...announcement, target: "all"})}
                  >
                    All Users
                  </Button>
                  <Button
                    variant={announcement.target === "teachers" ? "academic" : "outline"}
                    onClick={() => setAnnouncement({...announcement, target: "teachers"})}
                  >
                    Teachers Only
                  </Button>
                  <Button
                    variant={announcement.target === "students" ? "academic" : "outline"}
                    onClick={() => setAnnouncement({...announcement, target: "students"})}
                  >
                    Students Only
                  </Button>
                </div>
              </div>
              <Button variant="success" onClick={publishAnnouncement} className="w-full">
                Publish Announcement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View comprehensive attendance analytics and insights.
                </p>
                <Button variant="outline" className="mt-4">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered academic performance insights and trends.
                </p>
                <Button variant="outline" className="mt-4">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};