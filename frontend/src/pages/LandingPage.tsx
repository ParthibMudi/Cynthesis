import { useState } from "react";
import { GraduationCap, Brain, QrCode, Users, Calendar, BarChart3, Shield, Zap, Clock, BookOpen, Star, ArrowRight, Check } from "lucide-react";
import MockApiTest from "../components/MockApiTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

const LandingPage = ({ onGetStarted, onLogin }: LandingPageProps) => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Routine Generation",
      description: "Gemini AI creates conflict-free academic schedules with smart resource allocation",
      color: "text-primary"
    },
    {
      icon: QrCode,
      title: "Secure QR Attendance",
      description: "Rotating QR codes with 15-second refresh and single-use tokens prevent proxy attendance",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Multi-Portal Access",
      description: "Dedicated dashboards for administrators, teachers, and students with role-based permissions",
      color: "text-secondary"
    },
    {
      icon: BarChart3,
      title: "AI Performance Analytics",
      description: "Get intelligent insights on student performance and personalized study recommendations",
      color: "text-primary"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated timetable generation considering departments, subjects, teachers, and room availability",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with unique ID-based authentication and data protection",
      color: "text-secondary"
    }
  ];

  const benefits = [
    "Reduce attendance proxy by 95% with secure QR technology",
    "Save 80% time in timetable creation with AI automation",
    "Improve academic insights with AI-powered analytics",
    "Streamline communication across institution",
    "Real-time performance tracking and notifications",
    "Mobile-first responsive design for all devices"
  ];

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Principal, Tech Institute",
      content: "AcademiaSmart transformed our attendance system. The rotating QR codes eliminated proxy attendance completely.",
      rating: 5
    },
    {
      name: "Prof. Ananya Sharma",
      role: "HOD Computer Science",
      content: "The AI routine generator saved us hours of manual scheduling. No more timetable conflicts!",
      rating: 5
    },
    {
      name: "Priya Singh",
      role: "Final Year Student",
      content: "The AI study tips and personalized insights helped me improve my grades significantly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 pt-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="h-16 w-16 text-primary mr-4" />
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                AcademiaSmart
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Next-generation AI-powered academic platform with secure attendance, 
              intelligent scheduling, and personalized learning insights
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/register'}
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Institution ID
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {/* API Connection Test Component */}
              {/* <div className="mt-4 w-full max-w-md">
                <MockApiTest />
              </div> */}
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/login'}
                className="h-14 px-8 text-lg font-semibold border-2 hover:bg-accent/10"
              >
                Login to Portal
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className="px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                5-minute setup
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Enterprise security
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                AI-powered
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to modernize your academic institution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Choose AcademiaSmart?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join hundreds of institutions already transforming their academic management
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-base">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-background to-background/80 shadow-2xl">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="text-muted-foreground mb-6">
                    Set up your institution in minutes and experience the future of academic management
                  </p>
                  <Button 
                    size="lg" 
                    onClick={onGetStarted}
                    className="w-full h-12 text-lg font-semibold"
                  >
                    Create Institution Account
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Trusted by educators and students across the country
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-base mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">Transform Your Institution Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Join the academic revolution with AI-powered management and secure attendance systems
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="secondary"
                onClick={onGetStarted}
                className="h-14 px-8 text-lg font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={onLogin}
                className="h-14 px-8 text-lg font-semibold border-white/20 text-white hover:bg-white/10"
              >
                Login to Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">AcademiaSmart</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 AcademiaSmart. Empowering education with AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;