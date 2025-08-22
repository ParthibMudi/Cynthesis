import { useState } from "react";
import { AcademiaHeader } from "@/components/AcademiaHeader";
import { TeacherDashboard as TeacherDashboardComponent } from "@/components/TeacherDashboard";

const TeacherDashboard = () => {
  // Mock teacher user data
  const mockTeacher = {
    type: "teacher" as const,
    id: "TCH-2024-001",
    name: "Dr. Ananya Sharma"
  };

  const handleLogout = () => {
    // Navigate to landing page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <AcademiaHeader
        userType={mockTeacher.type}
        userName={mockTeacher.name}
        userId={mockTeacher.id}
        notifications={2}
        onLogout={handleLogout}
      />
      
      <main>
        <TeacherDashboardComponent teacherId={mockTeacher.id} />
      </main>
    </div>
  );
};

export default TeacherDashboard;