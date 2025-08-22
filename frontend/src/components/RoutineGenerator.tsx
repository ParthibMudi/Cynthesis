import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Clock, Users, MapPin, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminAPI, studentAPI } from "@/lib/api";

interface RoutineGeneratorProps {
  onGenerateComplete?: (routine: any) => void;
}

export const RoutineGenerator = ({ onGenerateComplete }: RoutineGeneratorProps) => {
  const [routinePrompt, setRoutinePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("idle"); // idle, generating, polling, complete
  const [pollingMessage, setPollingMessage] = useState("Generating AI routine...");
  const { toast } = useToast();

  // Pre-filled department and subject data
  const departmentData = {
    "CSE A & B": {
      subjects: [
        { name: "Data Structures & Algorithms (DS&A)", hours: 5, teacher: "Prof. Ananya Sharma" },
        { name: "Object-Oriented Programming (OOP)", hours: 4, teacher: "Dr. Ben Carter" },
        { name: "Database Management Systems (DBMS)", hours: 4, teacher: "Prof. Chloe Davis" },
        { name: "Computer Organization & Architecture (COA)", hours: 3, teacher: "Dr. David Chen" }
      ]
    },
    "ECE A & B": {
      subjects: [
        { name: "Analog & Digital Electronics", hours: 5, teacher: "Prof. Emily White" },
        { name: "Signals & Systems", hours: 4, teacher: "Dr. Frank Miller" },
        { name: "Microcontrollers & Applications", hours: 4, teacher: "Prof. Emily White" },
        { name: "Electromagnetic Field Theory (EMFT)", hours: 3, teacher: "Prof. Grace Lee" }
      ]
    },
    "CHE A": {
      subjects: [
        { name: "Chemical Process Calculations", hours: 4, teacher: "Prof. Ishan Khan" },
        { name: "Fluid Mechanics", hours: 5, teacher: "Dr. Hannah Jones" },
        { name: "Thermodynamics", hours: 4, teacher: "Prof. Grace Lee" },
        { name: "Mass Transfer Operations", hours: 3, teacher: "Dr. Hannah Jones" }
      ]
    },
    "CSBS A": {
      subjects: [
        { name: "Business Communication", hours: 3, teacher: "Dr. Maya Singh" },
        { name: "Data Structures & Algorithms (DS&A)", hours: 5, teacher: "Prof. Ananya Sharma" },
        { name: "Fundamentals of Economics", hours: 4, teacher: "Prof. Ishan Khan" },
        { name: "Software Engineering", hours: 4, teacher: "Dr. Ben Carter" }
      ]
    },
    "AIML A": {
      subjects: [
        { name: "Introduction to AI", hours: 4, teacher: "Prof. Noah Williams" },
        { name: "Machine Learning Fundamentals", hours: 5, teacher: "Dr. Olivia Brown" },
        { name: "Python for AI", hours: 4, teacher: "Prof. Noah Williams" },
        { name: "Linear Algebra for AI", hours: 3, teacher: "Dr. Frank Miller" }
      ]
    },
    "DS A": {
      subjects: [
        { name: "Introduction to Data Science", hours: 4, teacher: "Dr. Olivia Brown" },
        { name: "Statistical Methods for Data Science", hours: 5, teacher: "Prof. Peter Green" },
        { name: "Data Visualization", hours: 4, teacher: "Prof. Peter Green" },
        { name: "Database Management Systems (DBMS)", hours: 4, teacher: "Prof. Chloe Davis" }
      ]
    },
    "BCA": {
      subjects: [
        { name: "Web Technologies", hours: 4, teacher: "Dr. Xavier Lee" },
        { name: "Computer Fundamentals", hours: 4, teacher: "Dr. Xavier Lee" },
        { name: "C Programming", hours: 5, teacher: "Prof. Aarti Singh" },
        { name: "Discrete Mathematics", hours: 3, teacher: "Dr. David Chen" }
      ]
    },
    "MBA": {
      subjects: [
        { name: "Organizational Behavior", hours: 4, teacher: "Dr. Maya Singh" },
        { name: "Marketing Management", hours: 4, teacher: "Prof. Aarti Singh" },
        { name: "Financial Accounting", hours: 5, teacher: "Dr. Bhavin Desai" },
        { name: "Human Resource Management (HRM)", hours: 4, teacher: "Dr. Bhavin Desai" }
      ]
    }
  };

  const infrastructure = {
    "Lecture Halls": ["LH-101 (120)", "LH-102 (120)", "LH-201 (100)", "LH-202 (100)"],
    "Classrooms": ["CR-101 (60)", "CR-102 (60)", "CR-103 (60)", "CR-104 (60)", "CR-105 (60)", "CR-201 (60)", "CR-202 (60)", "CR-203 (60)"],
    "Labs": ["CS-Lab-A", "CS-Lab-B", "AI-Lab-1", "ECE-Lab-1", "CHE-Lab-1"],
    "Special": ["Seminar Hall-A (MBA/Events)"]
  };

  const generateRoutine = async () => {
    setIsGenerating(true);
    setGenerationStatus("generating");
    setPollingMessage("Initializing AI routine generation...");
    
    try {
      // Prepare data for routine generation
      const routineData = {
        department: "CSE A & B", // For now, using a default department
        section: "A",
        subjects: departmentData["CSE A & B"].subjects,
        timeSlots: ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00", "3:00-4:00", "4:00-5:00"],
        classrooms: [...infrastructure["Lecture Halls"], ...infrastructure["Classrooms"], ...infrastructure["Labs"]],
        additionalRequirements: routinePrompt
      };

      // Call the backend API to generate routine using the API library
      const response = await adminAPI.generateRoutine(routineData);
      
      // If we get here, the request was accepted - now we need to poll for completion
      setGenerationStatus("polling");
      setPollingMessage("AI is generating your routine. This may take 15-30 seconds...");
      
      // Poll for routine completion
      const pollInterval = setInterval(async () => {
        try {
          // Try to fetch the routine to see if it's ready
          const routineResponse = await studentAPI.getRoutine();
          
          // Check if we have a valid routine
          if (routineResponse.data && Object.keys(routineResponse.data.data).length > 0) {
            clearInterval(pollInterval);
            setGenerationStatus("complete");
            setPollingMessage("Routine generation complete!");
            
            toast({
              title: "🎉 AI Routine Generated!",
              description: "Conflict-free timetable created successfully with optimal resource allocation.",
            });
            
            // Small delay before hiding the loading state to show the success message
            setTimeout(() => {
              setIsGenerating(false);
              setGenerationStatus("idle");
              onGenerateComplete?.({
                status: "success",
                message: "Weekly routine generated successfully",
                departments: Object.keys(departmentData).length,
                conflicts: 0
              });
            }, 1500);
          }
        } catch (pollError) {
          // Continue polling even if there's an error fetching the routine
          console.log("Polling for routine completion...");
        }
      }, 3000); // Poll every 3 seconds
      
      // Set a timeout to stop polling after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generationStatus === "polling") {
          setIsGenerating(false);
          setGenerationStatus("idle");
          toast({
            title: "⚠️ Routine Generation Taking Longer",
            description: "The AI is still working on your routine. Please check back later.",
            variant: "destructive"
          });
        }
      }, 60000); // 60 second timeout
    } catch (error: any) {
      console.error("Error generating routine:", error);
      setGenerationStatus("idle");
      toast({
        title: "❌ Routine Generation Failed",
        description: error.response?.data?.message || error.message || "An unknown error occurred",
        variant: "destructive"
      });
      setIsGenerating(false);
      onGenerateComplete?.({
        status: "error",
        message: error.response?.data?.message || error.message || "An unknown error occurred"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary/30 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Gemini AI Routine Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="departments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="departments">Departments & Subjects</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="generate">Generate Routine</TabsTrigger>
            </TabsList>
            
            <TabsContent value="departments" className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(departmentData).map(([dept, data]) => (
                  <Card key={dept} className="border-l-4 border-l-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-primary">{dept}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-sm">{subject.name}</p>
                                <p className="text-xs text-muted-foreground">{subject.teacher}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              <Clock className="h-3 w-3 mr-1" />
                              {subject.hours}h/week
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="infrastructure" className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(infrastructure).map(([category, rooms]) => (
                  <Card key={category} className="border-l-4 border-l-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-primary flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {rooms.map((room, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {room}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="generate" className="space-y-4">
              <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Additional Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter any specific requirements for the timetable generation:
• Preferred time slots for specific subjects
• Lab session preferences  
• Faculty availability constraints
• Room-specific requirements
• Break timings
• Any other special instructions..."
                    value={routinePrompt}
                    onChange={(e) => setRoutinePrompt(e.target.value)}
                    className="min-h-32"
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="space-y-2">
                      <Users className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-2xl font-bold text-primary">{Object.keys(departmentData).length}</p>
                      <p className="text-sm text-muted-foreground">Departments</p>
                    </div>
                    <div className="space-y-2">
                      <BookOpen className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-2xl font-bold text-primary">
                        {Object.values(departmentData).reduce((total, dept) => total + dept.subjects.length, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Subjects</p>
                    </div>
                    <div className="space-y-2">
                      <MapPin className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-2xl font-bold text-primary">
                        {Object.values(infrastructure).reduce((total, rooms) => total + rooms.length, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Rooms</p>
                    </div>
                    <div className="space-y-2">
                      <Clock className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-2xl font-bold text-primary">6</p>
                      <p className="text-sm text-muted-foreground">Days/Week</p>
                    </div>
                  </div>
                  
                  {isGenerating && (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={generateRoutine}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        {pollingMessage}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Conflict-Free Routine
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};