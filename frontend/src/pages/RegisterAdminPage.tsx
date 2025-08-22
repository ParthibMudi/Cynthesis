import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/academic-card";
import { Button } from "@/components/ui/academic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const RegisterAdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !password || !confirmPassword || !institutionName || !institutionAddress) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/auth/register-admin", {
        name,
        email,
        password,
        institutionName,
        institutionAddress
      });
      
      // Set the admin ID and show the dialog
      setAdminId(response.data.user.userId);
      setShowDialog(true);
      
      toast({
        title: "Registration successful",
        description: "Please save your admin ID for login.",
      });
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy admin ID to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(adminId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to close dialog and navigate to login
  const handleCloseDialog = () => {
    setShowDialog(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin ID Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">Registration Successful!</DialogTitle>
              <DialogDescription className="text-center">
                Your admin account has been created successfully. Please save your Admin ID for login.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Admin ID:</p>
                <div className="flex items-center justify-center gap-2 bg-muted p-3 rounded-md">
                  <span className="text-xl font-bold">{adminId}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className="h-8 w-8"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                You will need this ID to log in to your admin account. Please keep it safe.
              </p>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button variant="academic" onClick={handleCloseDialog}>
                Proceed to Login
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
            Admin Registration
          </p>
        </div>

        {/* Registration Form */}
        <Card variant="academic">
          <CardHeader>
            <CardTitle className="text-center">Create Admin Account</CardTitle>
            <CardDescription className="text-center">
              Register as an admin and create your institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution-name">Institution Name</Label>
                <Input
                  id="institution-name"
                  placeholder="Enter institution name"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="institution-address">Institution Address</Label>
                <Input
                  id="institution-address"
                  placeholder="Enter institution address"
                  value={institutionAddress}
                  onChange={(e) => setInstitutionAddress(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Admin Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit"
                variant="academic" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register Admin Account"}
              </Button>
              
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  className="flex items-center gap-1 mx-auto"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterAdminPage;