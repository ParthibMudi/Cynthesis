import { AcademiaHeader } from "@/components/AcademiaHeader";
import { WeeklyRoutineView } from "@/components/WeeklyRoutineView";

const WeeklyRoutine = () => {
  // Mock user data - in real app, this would come from auth context
  const mockUser = {
    type: "student" as const,
    id: "STU-2024-001",
    name: "Priya Singh"
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <AcademiaHeader
        userType={mockUser.type}
        userName={mockUser.name}
        userId={mockUser.id}
        notifications={1}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-6">
        <WeeklyRoutineView 
          userType={mockUser.type}
          userId={mockUser.id}
          department="CSE A"
        />
      </main>
    </div>
  );
};

export default WeeklyRoutine;