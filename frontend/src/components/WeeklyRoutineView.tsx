import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, BookOpen } from "lucide-react";
import { studentAPI } from "@/lib/api";

interface RoutineSlot {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  department?: string;
  type?: "lecture" | "lab" | "break";
}

interface WeeklyRoutineViewProps {
  userType: "teacher" | "student";
  userId: string;
  department?: string;
}

export const WeeklyRoutineView = ({ userType, userId, department }: WeeklyRoutineViewProps) => {
  const [weeklyRoutine, setWeeklyRoutine] = useState<Record<string, RoutineSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getRoutine();
        setWeeklyRoutine(response.data.data || {});
        setError(null);
      } catch (err) {
        console.error("Error fetching routine:", err);
        setError("Failed to load routine. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutine();
  }, [userType, userId, department]);

  const getSlotTypeColor = (type: string | undefined) => {
    switch (type) {
      case "lecture": return "bg-primary/10 text-primary border-primary/20";
      case "lab": return "bg-accent/10 text-accent-foreground border-accent/20";
      case "break": return "bg-muted/50 text-muted-foreground border-muted";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Weekly Routine</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {department || "CSE A"} - Academic Year 2024-25
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {days.map((day) => (
          <Card key={day} className="h-fit border-l-4 border-l-primary/30 bg-gradient-to-b from-primary/5 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-center text-primary">
                {day}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyRoutine[day]?.map((slot, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all hover:shadow-sm ${getSlotTypeColor(slot.type || "lecture")}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium text-sm">{slot.time}</span>
                  </div>
                  
                  {slot.subject.toLowerCase().includes("break") ? (
                    <div className="text-center">
                      <span className="text-sm font-medium">{slot.subject}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 mb-2">
                        <BookOpen className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">{slot.subject}</p>
                          {slot.department && (
                            <p className="text-xs text-muted-foreground">{slot.department}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{slot.teacher}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{slot.room}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};