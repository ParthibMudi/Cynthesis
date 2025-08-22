import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/academic-card";
import { Button } from "@/components/ui/academic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Users, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const { toast } = useToast();
  
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  const [teacherId, setTeacherId] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (adminId.trim() && adminPassword.trim()) {
      setIsLoading(true);
      try {
        await login(adminId, adminPassword);
        navigate("/admin");
        toast({
          title: "Login successful",
          description: "Welcome to your admin dashboard",
        });
      } catch (err) {
        toast({
          title: "Login failed",
          description: error || "Invalid credentials",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTeacherLogin = async () => {
    if (teacherId.trim() && teacherPassword.trim()) {
      setIsLoading(true);
      try {
        await login(teacherId, teacherPassword);
        navigate("/teacher");
        toast({
          title: "Login successful",
          description: "Welcome to your teacher dashboard",
        });
      } catch (err) {
        toast({
          title: "Login failed",
          description: error || "Invalid credentials",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStudentLogin = async () => {
    if (studentId.trim() && studentPassword.trim()) {
      setIsLoading(true);
      try {
        await login(studentId, studentPassword);
        navigate("/student");
        toast({
          title: "Login successful",
          description: "Welcome to your student dashboard",
        });
      } catch (err) {
        toast({
          title: "Login failed",
          description: error || "Invalid credentials",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-academic">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AcademiaSmart
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-Powered Academic Platform
          </p>
        </div>

        {/* Login Tabs */}
        <Card variant="academic">
          <CardHeader>
            <CardTitle className="text-center">Portal Login</CardTitle>
            <CardDescription className="text-center">
              Select your portal and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
              </TabsList>
              
              {/* Admin Login */}
              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-id">Admin ID</Label>
                  <Input
                    id="admin-id"
                    placeholder="Enter Admin ID"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <Button 
                  variant="academic" 
                  className="w-full" 
                  onClick={handleAdminLogin}
                  disabled={!adminId.trim() || !adminPassword.trim() || isLoading}
                >
                  {isLoading ? "Logging in..." : "Access Admin Portal"}
                </Button>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an admin account?{" "}
                    <Button variant="link" className="p-0" onClick={handleRegisterClick}>
                      Register here
                    </Button>
                  </p>
                </div>
              </TabsContent>
              
              {/* Teacher Login */}
              <TabsContent value="teacher" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-id">Teacher ID</Label>
                  <Input
                    id="teacher-id"
                    placeholder="Enter Teacher ID"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder="Enter Password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                  />
                </div>
                <Button 
                  variant="academic" 
                  className="w-full" 
                  onClick={handleTeacherLogin}
                  disabled={!teacherId.trim() || !teacherPassword.trim() || isLoading}
                >
                  {isLoading ? "Logging in..." : "Access Teacher Portal"}
                </Button>
              </TabsContent>
              
              {/* Student Login */}
              <TabsContent value="student" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input
                    id="student-id"
                    placeholder="Enter Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    placeholder="Enter Password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                  />
                </div>
                <Button 
                  variant="academic" 
                  className="w-full" 
                  onClick={handleStudentLogin}
                  disabled={!studentId.trim() || !studentPassword.trim() || isLoading}
                >
                  {isLoading ? "Logging in..." : "Access Student Portal"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card variant="minimal" className="mt-6">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span className="text-muted-foreground">ADM1234 / ADM1234@123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Teacher:</span>
                <span className="text-muted-foreground">TCH1234 / TCH1234@123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Student:</span>
                <span className="text-muted-foreground">STD1234 / STD1234@123</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;