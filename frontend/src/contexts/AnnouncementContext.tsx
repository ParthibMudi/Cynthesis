import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  postedBy: string;
  targetAudience: string[];
  createdAt: string;
}

interface AnnouncementContextType {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: () => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  const fetchAnnouncements = async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      setError(null);
      
      const endpoint = user.role === 'admin' 
        ? 'http://localhost:5000/api/admin/announcements'
        : user.role === 'teacher'
          ? 'http://localhost:5000/api/teacher/announcements'
          : 'http://localhost:5000/api/student/announcements';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch announcements');
      }

      setAnnouncements(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchAnnouncements();
    }
  }, [token, user]);

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        loading,
        error,
        fetchAnnouncements
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncements = (): AnnouncementContextType => {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
};

export default AnnouncementContext;