import { useState } from "react";
import { AcademiaHeader } from "@/components/AcademiaHeader";
import { StudentDashboard as StudentDashboardComponent } from "@/components/StudentDashboard";

const StudentDashboard = () => {
  // Mock student user data
  const mockStudent = {
    type: "student" as const,
    id: "STU-2024-001",
    name: "Priya Singh"
  };

  const handleLogout = () => {
    // Navigate to landing page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <AcademiaHeader
        userType={mockStudent.type}
        userName={mockStudent.name}
        userId={mockStudent.id}
        notifications={1}
        onLogout={handleLogout}
      />
      
      <main>
        <StudentDashboardComponent studentId={mockStudent.id} />
      </main>
    </div>
  );
};

export default StudentDashboard;