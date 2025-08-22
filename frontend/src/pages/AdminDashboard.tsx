import { useState } from "react";
import { AcademiaHeader } from "@/components/AcademiaHeader";
import { AdminDashboard as AdminDashboardComponent } from "@/components/AdminDashboard";

const AdminDashboard = () => {
  // Mock admin user data
  const mockAdmin = {
    type: "admin" as const,
    id: "INST-2024-001",
    name: "Institution Admin"
  };

  const handleLogout = () => {
    // Navigate to landing page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <AcademiaHeader
        userType={mockAdmin.type}
        userName={mockAdmin.name}
        userId={mockAdmin.id}
        notifications={3}
        onLogout={handleLogout}
      />
      
      <main>
        <AdminDashboardComponent institutionId={mockAdmin.id} />
      </main>
    </div>
  );
};

export default AdminDashboard;