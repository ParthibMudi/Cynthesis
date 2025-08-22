import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  status?: 'completed' | 'current' | 'upcoming';
}

interface DailySchedule {
  [day: string]: ScheduleItem[];
}

interface RoutineContextType {
  routine: DailySchedule | null;
  todaySchedule: ScheduleItem[];
  loading: boolean;
  error: string | null;
  fetchRoutine: () => Promise<void>;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export const RoutineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routine, setRoutine] = useState<DailySchedule | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  const fetchRoutine = async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      setError(null);
      
      const endpoint = user.role === 'admin' 
        ? 'http://localhost:5000/api/admin/routine'
        : user.role === 'teacher'
          ? 'http://localhost:5000/api/teacher/routine'
          : 'http://localhost:5000/api/student/routine';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch routine');
      }

      setRoutine(data.data);
      
      // Process today's schedule
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      
      if (data.data && data.data[today]) {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        
        // Add status to each schedule item
        const scheduleWithStatus = data.data[today].map((item: ScheduleItem) => {
          const [startTime] = item.time.split('-');
          const [startHour, startMinute] = startTime.split(':').map(Number);
          
          let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
          
          if (currentHour > startHour || (currentHour === startHour && currentMinute > startMinute + 60)) {
            status = 'completed';
          } else if (currentHour === startHour || (currentHour === startHour + 1 && currentMinute < startMinute)) {
            status = 'current';
          }
          
          return { ...item, status };
        });
        
        setTodaySchedule(scheduleWithStatus);
      } else {
        setTodaySchedule([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchRoutine();
    }
  }, [token, user]);

  return (
    <RoutineContext.Provider
      value={{
        routine,
        todaySchedule,
        loading,
        error,
        fetchRoutine
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = (): RoutineContextType => {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
};

export default RoutineContext;