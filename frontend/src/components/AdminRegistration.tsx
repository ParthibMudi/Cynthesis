import { useState } from "react";
import { GraduationCap, Building2, MapPin, Phone, Mail, User, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface AdminRegistrationProps {
  onBack: () => void;
  onComplete: (institutionId: string) => void;
}

interface RegistrationData {
  institutionName: string;
  institutionType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  description: string;
}

const AdminRegistration = ({ onBack, onComplete }: AdminRegistrationProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  
  const [formData, setFormData] = useState<RegistrationData>({
    institutionName: "",
    institutionType: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    description: ""
  });

  const [errors, setErrors] = useState<Partial<RegistrationData>>({});

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    if (currentStep === 1) {
      if (!formData.institutionName.trim()) newErrors.institutionName = "Institution name is required";
      if (!formData.institutionType.trim()) newErrors.institutionType = "Institution type is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    }

    if (currentStep === 2) {
      if (!formData.adminName.trim()) newErrors.adminName = "Admin name is required";
      if (!formData.adminEmail.trim()) newErrors.adminEmail = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) newErrors.adminEmail = "Valid email is required";
      if (!formData.adminPhone.trim()) newErrors.adminPhone = "Phone number is required";
      else if (!/^\d{10}$/.test(formData.adminPhone.replace(/\D/g, ''))) newErrors.adminPhone = "Valid 10-digit phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const generateInstitutionId = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const typeCode = formData.institutionType.substring(0, 3).toUpperCase();
    return `${typeCode}-${year}-${randomNum}`;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const institutionId = generateInstitutionId();
    setGeneratedId(institutionId);
    
    toast({
      title: "Registration Successful!",
      description: "Your institution ID has been generated successfully.",
    });
    
    setIsLoading(false);
    setStep(3);
  };

  const handleComplete = () => {
    onComplete(generatedId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold">AcademiaSmart</h1>
          </div>
          <p className="text-muted-foreground">Register your institution and get your unique Institution ID</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= stepNum 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 
                    ${step > stepNum ? 'bg-primary' : 'bg-muted'}`} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {step === 1 && "Institution Details"}
                  {step === 2 && "Administrator Information"}
                  {step === 3 && "Registration Complete"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Tell us about your educational institution"}
                  {step === 2 && "Provide administrator contact details"}
                  {step === 3 && "Your institution ID is ready!"}
                </CardDescription>
              </div>
              {step < 3 && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Institution Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
                      id="institutionName"
                      placeholder="e.g., ABC Institute of Technology"
                      value={formData.institutionName}
                      onChange={(e) => handleInputChange("institutionName", e.target.value)}
                      className={errors.institutionName ? "border-destructive" : ""}
                    />
                    {errors.institutionName && (
                      <p className="text-sm text-destructive">{errors.institutionName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institutionType">Institution Type *</Label>
                    <Input
                      id="institutionType"
                      placeholder="e.g., Engineering College"
                      value={formData.institutionType}
                      onChange={(e) => handleInputChange("institutionType", e.target.value)}
                      className={errors.institutionType ? "border-destructive" : ""}
                    />
                    {errors.institutionType && (
                      <p className="text-sm text-destructive">{errors.institutionType}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Complete address of the institution"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      className={errors.pincode ? "border-destructive" : ""}
                    />
                    {errors.pincode && (
                      <p className="text-sm text-destructive">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description about your institution"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Administrator Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Administrator Name *</Label>
                  <Input
                    id="adminName"
                    placeholder="Full name of the administrator"
                    value={formData.adminName}
                    onChange={(e) => handleInputChange("adminName", e.target.value)}
                    className={errors.adminName ? "border-destructive" : ""}
                  />
                  {errors.adminName && (
                    <p className="text-sm text-destructive">{errors.adminName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email Address *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@institution.edu"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                    className={errors.adminEmail ? "border-destructive" : ""}
                  />
                  {errors.adminEmail && (
                    <p className="text-sm text-destructive">{errors.adminEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone Number *</Label>
                  <Input
                    id="adminPhone"
                    type="tel"
                    placeholder="10-digit phone number"
                    value={formData.adminPhone}
                    onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                    className={errors.adminPhone ? "border-destructive" : ""}
                  />
                  {errors.adminPhone && (
                    <p className="text-sm text-destructive">{errors.adminPhone}</p>
                  )}
                </div>

                <Separator />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Review Institution Details</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Institution:</strong> {formData.institutionName}</p>
                    <p><strong>Type:</strong> {formData.institutionType}</p>
                    <p><strong>Location:</strong> {formData.city}, {formData.state}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">Registration Successful!</h3>
                  <p className="text-muted-foreground">
                    Your institution has been registered successfully. Here's your unique Institution ID:
                  </p>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border-2 border-primary/20">
                  <Label className="text-sm font-medium text-muted-foreground">Your Institution ID</Label>
                  <div className="text-3xl font-bold text-primary mt-2 mb-3 tracking-wider">
                    {generatedId}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Keep this ID safe - you'll need it to log in
                  </Badge>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-left">
                  <h4 className="font-medium mb-2">Institution Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><Building2 className="h-4 w-4 inline mr-2" /><strong>Name:</strong> {formData.institutionName}</p>
                    <p><MapPin className="h-4 w-4 inline mr-2" /><strong>Location:</strong> {formData.city}, {formData.state}</p>
                    <p><User className="h-4 w-4 inline mr-2" /><strong>Administrator:</strong> {formData.adminName}</p>
                    <p><Mail className="h-4 w-4 inline mr-2" /><strong>Email:</strong> {formData.adminEmail}</p>
                    <p><Phone className="h-4 w-4 inline mr-2" /><strong>Phone:</strong> {formData.adminPhone}</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>✉️ A confirmation email with your Institution ID has been sent to {formData.adminEmail}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              {step === 1 && (
                <Button onClick={handleNext} size="lg">
                  Continue
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              )}

              {step === 2 && (
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Previous
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "Generating ID..." : "Complete Registration"}
                  </Button>
                </div>
              )}

              {step === 3 && (
                <Button onClick={handleComplete} size="lg">
                  Continue to Login
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegistration;