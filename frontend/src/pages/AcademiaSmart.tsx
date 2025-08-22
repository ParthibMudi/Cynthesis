import { useState } from "react";
import { AcademiaHeader } from "@/components/AcademiaHeader";
import { LoginPortal } from "@/components/LoginPortal";
import { AdminDashboard } from "@/components/AdminDashboard";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import LandingPage from "./LandingPage";
import AdminRegistration from "@/components/AdminRegistration";

type UserType = "admin" | "teacher" | "student";

interface User {
  type: UserType;
  id: string;
  name: string;
}

const AcademiaSmart = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<"landing" | "login" | "register" | "dashboard">("landing");

  const handleLogin = (userType: UserType, userId: string) => {
    // Mock user data based on demo credentials
    const userData = {
      admin: { name: "Institution Admin", id: userId },
      teacher: { name: "Dr. Ananya Sharma", id: userId },
      student: { name: "Priya Singh", id: userId }
    };

    setCurrentUser({
      type: userType,
      id: userId,
      name: userData[userType].name
    });
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("landing");
  };

  const handleGetStarted = () => {
    setCurrentPage("register");
  };

  const handleLoginClick = () => {
    setCurrentPage("login");
  };

  const handleBackToLanding = () => {
    setCurrentPage("landing");
  };

  const handleRegistrationComplete = (institutionId: string) => {
    setCurrentPage("login");
  };

  // Show different pages based on current state
  if (currentPage === "landing") {
    return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLoginClick} />;
  }

  if (currentPage === "register") {
    return <AdminRegistration onBack={handleBackToLanding} onComplete={handleRegistrationComplete} />;
  }

  if (currentPage === "login" && !currentUser) {
    return <LoginPortal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AcademiaHeader
        userType={currentUser.type}
        userName={currentUser.name}
        userId={currentUser.id}
        notifications={3}
        onLogout={handleLogout}
      />
      
      <main>
        {currentUser.type === "admin" && (
          <AdminDashboard institutionId={currentUser.id} />
        )}
        {currentUser.type === "teacher" && (
          <TeacherDashboard teacherId={currentUser.id} />
        )}
        {currentUser.type === "student" && (
          <StudentDashboard studentId={currentUser.id} />
        )}
      </main>
    </div>
  );
};

export default AcademiaSmart;