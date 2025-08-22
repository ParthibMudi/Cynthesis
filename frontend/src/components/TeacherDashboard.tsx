import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/academic-card";
import { Button } from "@/components/ui/academic-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  QrCode, 
  Users, 
  Play, 
  Pause, 
  RefreshCw,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeacherDashboardProps {
  teacherId: string;
}

export const TeacherDashboard = ({ teacherId }: TeacherDashboardProps) => {
  const { toast } = useToast();
  const [attendanceSession, setAttendanceSession] = useState<{
    active: boolean;
    sessionId: string;
    qrToken: string;
    studentsPresent: number;
    expiresAt: Date;
  } | null>(null);

  const [qrRefreshTimer, setQrRefreshTimer] = useState(15);

  // Mock teacher data
  const teacherData = {
    name: "Dr. Ananya Sharma",
    department: "Computer Science",
    subjects: ["Data Structures & Algorithms", "Database Management", "Web Development"]
  };

  // Mock schedule
  const todaySchedule = [
    { time: "9:00-10:00", subject: "Data Structures", class: "CSE-A", room: "CR-101", status: "completed" },
    { time: "11:00-12:00", subject: "Database Management", class: "CSE-B", room: "CR-102", status: "current" },
    { time: "2:00-3:00", subject: "Web Development", class: "CSE-A", room: "CR-103", status: "upcoming" },
  ];

  // Mock announcements
  const announcements = [
    { id: 1, title: "Faculty Meeting", content: "Department meeting scheduled for tomorrow at 3 PM", time: "2 hours ago" },
    { id: 2, title: "Holiday Notice", content: "College will remain closed on Friday", time: "1 day ago" },
  ];

  // QR Code refresh timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (attendanceSession?.active && qrRefreshTimer > 0) {
      interval = setInterval(() => {
        setQrRefreshTimer(prev => {
          if (prev <= 1) {
            // Refresh QR code
            generateNewQR();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [attendanceSession?.active, qrRefreshTimer]);

  const startAttendanceSession = () => {
    const sessionId = `ATT_${Date.now()}`;
    const qrToken = `QR_${Math.random().toString(36).substr(2, 9)}`;
    
    setAttendanceSession({
      active: true,
      sessionId,
      qrToken,
      studentsPresent: 0,
      expiresAt: new Date(Date.now() + 15000) // 15 seconds
    });
    
    setQrRefreshTimer(15);
    
    toast({
      title: "Attendance Session Started",
      description: "QR code is now active for student scanning",
    });
  };

  const stopAttendanceSession = () => {
    setAttendanceSession(null);
    toast({
      title: "Attendance Session Ended",
      description: `${attendanceSession?.studentsPresent || 0} students marked present`,
    });
  };

  const generateNewQR = () => {
    if (attendanceSession) {
      const newToken = `QR_${Math.random().toString(36).substr(2, 9)}`;
      setAttendanceSession({
        ...attendanceSession,
        qrToken: newToken,
        expiresAt: new Date(Date.now() + 15000)
      });
    }
  };

  // Simulate student scanning
  const simulateStudentScan = () => {
    if (attendanceSession) {
      setAttendanceSession({
        ...attendanceSession,
        studentsPresent: attendanceSession.studentsPresent + 1
      });
      
      toast({
        title: "Student Marked Present",
        description: `Total present: ${attendanceSession.studentsPresent + 1}`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent text-accent-foreground";
      case "current":
        return "bg-primary text-primary-foreground";
      case "upcoming":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Teacher Info */}
      <Card variant="academic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Teacher Dashboard
              </CardTitle>
              <CardDescription>
                {teacherData.name} - {teacherData.department}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {teacherId}
            </Badge>
          </div>
        </CardHeader>
      </Card>

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
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
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
                            <p className="text-sm text-muted-foreground">Class: {session.class}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                          {session.status === "current" && (
                            <Button 
                              variant="academic" 
                              size="sm"
                              onClick={startAttendanceSession}
                              disabled={attendanceSession?.active}
                            >
                              Start Attendance
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance QR */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Display */}
            <Card variant="academic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-6 w-6" />
                  Attendance QR Code
                </CardTitle>
                <CardDescription>
                  Secure rotating QR for student attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {attendanceSession?.active ? (
                  <div>
                    {/* QR Code Placeholder */}
                    <div className="w-48 h-48 mx-auto bg-gradient-academic rounded-lg flex items-center justify-center shadow-floating">
                      <div className="text-white text-center">
                        <QrCode className="h-16 w-16 mx-auto mb-2" />
                        <p className="text-sm font-medium">QR CODE</p>
                        <p className="text-xs opacity-75">{attendanceSession.qrToken}</p>
                      </div>
                    </div>
                    
                    {/* Timer */}
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Refreshes in {qrRefreshTimer}s
                      </span>
                      <RefreshCw className={`h-4 w-4 ${qrRefreshTimer <= 3 ? 'animate-spin' : ''}`} />
                    </div>
                    
                    {/* Session Info */}
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-accent">
                        {attendanceSession.studentsPresent} Students Present
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Session: {attendanceSession.sessionId}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="warning" onClick={generateNewQR}>
                        Refresh QR
                      </Button>
                      <Button variant="destructive" onClick={stopAttendanceSession}>
                        <Pause className="h-4 w-4 mr-2" />
                        End Session
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <QrCode className="h-16 w-16 mx-auto mb-2" />
                        <p>No Active Session</p>
                      </div>
                    </div>
                    <Button variant="hero" onClick={startAttendanceSession}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Attendance Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Controls */}
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Session Status</p>
                  <Badge className={attendanceSession?.active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}>
                    {attendanceSession?.active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
                
                {attendanceSession?.active && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Security Features</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          Token rotates every 15 seconds
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          Single-use per student
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          Expired tokens rejected
                        </li>
                      </ul>
                    </div>
                    
                    {/* Demo: Simulate student scan */}
                    <Button 
                      variant="success" 
                      onClick={simulateStudentScan}
                      className="w-full"
                    >
                      Simulate Student Scan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Attendance</span>
                    <span className="font-semibold text-accent">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Classes This Week</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Students</span>
                    <span className="font-semibold">45</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="dashboard">
              <CardHeader>
                <CardTitle>AI Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI-powered analysis of student performance and engagement patterns.
                </p>
                <Button variant="academic">
                  Generate AI Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-6">
          <Card variant="dashboard">
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} variant="minimal">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {announcement.content}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {announcement.time}
                        </span>
                      </div>
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