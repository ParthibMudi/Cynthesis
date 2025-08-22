import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/academic-card";
import { Button } from "@/components/ui/academic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Users, Shield } from "lucide-react";

interface LoginPortalProps {
  onLogin: (userType: "admin" | "teacher" | "student", userId: string) => void;
}

export const LoginPortal = ({ onLogin }: LoginPortalProps) => {
  const [adminId, setAdminId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [institutionId, setInstitutionId] = useState("");

  const handleAdminLogin = () => {
    if (institutionId.trim()) {
      onLogin("admin", institutionId);
    }
  };

  const handleTeacherLogin = () => {
    if (teacherId.trim()) {
      onLogin("teacher", teacherId);
    }
  };

  const handleStudentLogin = () => {
    if (studentId.trim()) {
      onLogin("student", studentId);
    }
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
              Select your portal and enter your unique ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Student
                </TabsTrigger>
              </TabsList>

              {/* Admin Login */}
              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institution-id">Institution ID</Label>
                  <Input
                    id="institution-id"
                    placeholder="Enter Institution ID"
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                  />
                </div>
                <Button 
                  variant="academic" 
                  className="w-full" 
                  onClick={handleAdminLogin}
                  disabled={!institutionId.trim()}
                >
                  Access Admin Portal
                </Button>
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
                <Button 
                  variant="academic" 
                  className="w-full" 
                  onClick={handleTeacherLogin}
                  disabled={!teacherId.trim()}
                >
                  Access Teacher Portal
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
                <Button 
                  variant="academic" 
                  className="w-full" 
                  onClick={handleStudentLogin}
                  disabled={!studentId.trim()}
                >
                  Access Student Portal
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
                <span className="text-muted-foreground">INST-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Teacher:</span>
                <span className="text-muted-foreground">TCH-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Student:</span>
                <span className="text-muted-foreground">STU-2024-001</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};