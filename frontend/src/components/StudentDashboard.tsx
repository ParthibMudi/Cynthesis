import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/academic-card";
import { Button } from "@/components/ui/academic-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  QrCode, 
  Book, 
  MessageSquare,
  Scan,
  Bot,
  CheckCircle,
  Clock,
  TrendingUp,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentDashboardProps {
  studentId: string;
}

export const StudentDashboard = ({ studentId }: StudentDashboardProps) => {
  const { toast } = useToast();
  const [qrInput, setQrInput] = useState("");
  const [scanHistory, setScanHistory] = useState([
    { subject: "Data Structures", time: "9:00 AM", date: "Today", status: "present" },
    { subject: "Database Management", time: "11:00 AM", date: "Yesterday", status: "present" },
    { subject: "Web Development", time: "2:00 PM", date: "Yesterday", status: "absent" },
  ]);

  // Mock student data
  const studentData = {
    name: "Priya Singh",
    department: "Computer Science",
    year: "2nd Year",
    semester: "4th Semester"
  };

  // Mock schedule
  const todaySchedule = [
    { time: "9:00-10:00", subject: "Data Structures", teacher: "Dr. Ananya Sharma", room: "CR-101", status: "completed" },
    { time: "11:00-12:00", subject: "Database Management", teacher: "Prof. Raj Kumar", room: "CR-102", status: "current" },
    { time: "2:00-3:00", subject: "Web Development", teacher: "Dr. Ananya Sharma", room: "CR-103", status: "upcoming" },
  ];

  // Mock announcements
  const announcements = [
    { id: 1, title: "Assignment Submission", content: "Submit your web development assignment by Friday", time: "3 hours ago", priority: "high" },
    { id: 2, title: "Holiday Notice", content: "College will remain closed on Friday", time: "1 day ago", priority: "medium" },
    { id: 3, title: "Library Hours", content: "Extended library hours during exam week", time: "2 days ago", priority: "low" },
  ];

  // AI Study Tips
  const aiStudyTips = [
    {
      subject: "Data Structures",
      tip: "Practice implementing linked lists with different data types to strengthen your understanding",
      difficulty: "Medium",
      timeEstimate: "30 mins"
    },
    {
      subject: "Database Management",
      tip: "Review normalization concepts with real-world examples like e-commerce databases",
      difficulty: "Easy",
      timeEstimate: "20 mins"
    },
    {
      subject: "Web Development",
      tip: "Build a responsive portfolio website to practice CSS Grid and Flexbox",
      difficulty: "Hard",
      timeEstimate: "2 hours"
    }
  ];

  const markAttendance = () => {
    if (qrInput.trim()) {
      // Simulate QR validation
      const isValid = qrInput.startsWith("QR_");
      
      if (isValid) {
        const newEntry = {
          subject: "Database Management",
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: "Today",
          status: "present" as const
        };
        
        setScanHistory([newEntry, ...scanHistory]);
        setQrInput("");
        
        toast({
          title: "Attendance Marked Successfully",
          description: "You have been marked present for Database Management",
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: "The QR code is expired or invalid. Please scan the latest QR.",
          variant: "destructive",
        });
      }
    }
  };

  const simulateQRScan = () => {
    // Simulate scanning a valid QR code
    setQrInput("QR_valid_token_123");
    setTimeout(() => markAttendance(), 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent text-accent-foreground";
      case "current":
        return "bg-primary text-primary-foreground";
      case "upcoming":
        return "bg-warning text-warning-foreground";
      case "present":
        return "bg-accent text-accent-foreground";
      case "absent":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-accent text-accent-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "Hard":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Student Info */}
      <Card variant="academic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-6 w-6 text-primary" />
                Student Dashboard
              </CardTitle>
              <CardDescription>
                {studentData.name} - {studentData.department}, {studentData.year}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-accent text-accent-foreground mb-1">
                {studentId}
              </Badge>
              <p className="text-sm text-muted-foreground">{studentData.semester}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="dashboard">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Classes Today</p>
          </CardContent>
        </Card>
        <Card variant="dashboard">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">85%</p>
            <p className="text-sm text-muted-foreground">Attendance</p>
          </CardContent>
        </Card>
        <Card variant="dashboard">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">8.5</p>
            <p className="text-sm text-muted-foreground">CGPA</p>
          </CardContent>
        </Card>
        <Card variant="dashboard">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">New Notices</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <QrCode className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="study-ai">
            <Bot className="h-4 w-4 mr-2" />
            AI Study Tips
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <MessageSquare className="h-4 w-4 mr-2" />
            Announcements
          </TabsTrigger>
        </TabsList>

        {/* Today's Schedule */}
        <TabsContent value="schedule" className="space-y-6">
          <Card variant="dashboard">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((session, index) => (
                  <Card key={index} variant="minimal">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-medium">{session.time}</p>
                            <p className="text-sm text-muted-foreground">{session.room}</p>
                          </div>
                          <div>
                            <p className="font-medium">{session.subject}</p>
                            <p className="text-sm text-muted-foreground">Prof. {session.teacher}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Attendance */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Scanner */}
            <Card variant="academic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-6 w-6" />
                  Scan QR for Attendance
                </CardTitle>
                <CardDescription>
                  Scan the teacher's QR code to mark your attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-input">QR Code Token</Label>
                  <Input
                    id="qr-input"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Enter QR token or scan QR code"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="academic" onClick={markAttendance} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                  <Button variant="success" onClick={simulateQRScan}>
                    Demo Scan
                  </Button>
                </div>

                {/* Security Info */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Security Features:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• QR codes expire every 15 seconds</li>
                    <li>• One-time use per student</li>
                    <li>• Location-based validation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Attendance History */}
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{entry.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.date} at {entry.time}
                        </p>
                      </div>
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Study Tips */}
        <TabsContent value="study-ai" className="space-y-6">
          <Card variant="academic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                AI-Powered Study Recommendations
              </CardTitle>
              <CardDescription>
                Personalized study tips based on your performance and schedule
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {aiStudyTips.map((tip, index) => (
              <Card key={index} variant="dashboard">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-warning" />
                      {tip.subject}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(tip.difficulty)}>
                        {tip.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {tip.timeEstimate}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{tip.tip}</p>
                  <Button variant="outline" size="sm">
                    Start Studying
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Performance Insights */}
          <Card variant="floating">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">95%</p>
                  <p className="text-sm text-muted-foreground">Study Goal Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">7.2h</p>
                  <p className="text-sm text-muted-foreground">Weekly Study Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">3</p>
                  <p className="text-sm text-muted-foreground">Improvement Areas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-6">
          <Card variant="dashboard">
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Stay updated with important notices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} variant="minimal">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {announcement.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};