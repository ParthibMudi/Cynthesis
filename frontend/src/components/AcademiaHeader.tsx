import { BookOpen, Bell, User, LogOut, Settings, Calendar, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/academic-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AcademiaHeaderProps {
  userType: "admin" | "teacher" | "student";
  userName: string;
  userId: string;
  notifications?: number;
  onLogout: () => void;
}

export const AcademiaHeader = ({
  userType,
  userName,
  userId,
  notifications = 0,
  onLogout,
}: AcademiaHeaderProps) => {
  const getUserTypeColor = () => {
    switch (userType) {
      case "admin":
        return "bg-destructive text-destructive-foreground";
      case "teacher":
        return "bg-primary text-primary-foreground";
      case "student":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Mock notifications data
  const notificationsList = [
    {
      id: 1,
      type: "schedule",
      title: "New Class Scheduled",
      message: "Data Structures class added for tomorrow at 10:00 AM",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      type: "announcement",
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday 2:00 AM - 4:00 AM",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 3,
      type: "reminder",
      title: "Assignment Due",
      message: "OOP assignment submission due tomorrow",
      time: "2 hours ago",
      read: false,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "schedule":
        return <Calendar className="h-4 w-4 text-primary" />;
      case "announcement":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "reminder":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AcademiaSmart
            </h1>
            <p className="text-xs text-muted-foreground">AI-Powered Education</p>
          </div>
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground"
                  >
                    {notifications > 9 ? "9+" : notifications}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b p-4">
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  You have {notificationsList.filter(n => !n.read).length} unread notifications
                </p>
              </div>
              <ScrollArea className="h-80">
                <div className="p-2">
                  {notificationsList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t p-3">
                <Button variant="ghost" className="w-full text-sm">
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 h-auto py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-gradient-academic text-white text-xs font-medium">
                    {getUserInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none">{userName}</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge variant="secondary" className={`text-xs ${getUserTypeColor()}`}>
                      {userType.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">#{userId}</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex items-center space-x-3 p-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-gradient-academic text-white">
                    {getUserInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-sm text-muted-foreground">#{userId}</span>
                  <Badge variant="secondary" className={`w-fit text-xs mt-1 ${getUserTypeColor()}`}>
                    {userType.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>View Profile</span>
                  <span className="text-xs text-muted-foreground">Manage your account</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Settings</span>
                  <span className="text-xs text-muted-foreground">Preferences and privacy</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Notifications</span>
                  <span className="text-xs text-muted-foreground">Manage notifications</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Sign out</span>
                  <span className="text-xs text-muted-foreground">Log out of your account</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};