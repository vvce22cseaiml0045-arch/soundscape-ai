import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff, Volume2, BarChart3, MapPin, Shield, Lock } from "lucide-react";
import Register from "./Register";

function Login({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { toast } = useToast();

  // Handle responsive behavior - collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024; // lg breakpoint
      setIsCollapsed(!isLarge); // Collapse on small screens, expand on large screens
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const login = async () => {
    // Validation
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to continue.",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        variant: "destructive", 
        title: "Password Required",
        description: "Please enter your password to continue.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const form = new FormData();
      form.append("email", email);
      form.append("password", password);

      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to Soundscape AI Dashboard!",
        });
        setLoggedIn();
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed", 
          description: "Invalid email or password. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to the server. Please check if the backend is running.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    toast({
      title: "Ready to Sign In",
      description: "You can now sign in with your new account.",
    });
  };

  const features = [
    {
      icon: Volume2,
      title: "Audio Analysis",
      description: "Advanced ML algorithms analyze audio patterns to classify urban noise types with high accuracy."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Get instant insights with comprehensive statistics and visualizations of noise data."
    },
    {
      icon: MapPin,
      title: "Smart Routing",
      description: "AI-powered route suggestions help you avoid high-noise areas for a quieter journey."
    },
    {
      icon: Shield,
      title: "Health Monitoring",
      description: "Protect your hearing with personalized noise exposure warnings and recommendations."
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Project Information */}
      <div 
        className={`relative transition-all duration-500 ease-in-out ${
          isCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-1/2'
        } bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700`}
      >
        
        <div className="relative z-10 h-full flex flex-col justify-center p-8 lg:p-12 text-white">
          <div className="max-w-lg">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight flex items-center gap-3">
                <Volume2 className="w-10 h-10" /> Soundscape AI
              </h1>
              <p className="text-xl lg:text-2xl text-emerald-100 font-light">
                Intelligent Noise Classification & Urban Sound Analytics
              </p>
            </div>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-emerald-100 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm text-emerald-200">
                Powered by advanced machine learning algorithms and real-time data processing
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Right Panel - Login Form */}
      <div className={`flex items-center justify-center p-4 transition-all duration-500 ${
        isCollapsed ? 'w-full' : 'w-full lg:w-1/2'
      } bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
        
        {/* Show expand button when panel is collapsed on larger screens */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="fixed top-4 left-4 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-lg lg:flex hidden items-center justify-center text-white transition-colors z-10"
            title="Show project info"
          >
            →
          </button>
        )}

        {/* Show Register component if showRegister is true */}
        {showRegister ? (
          <Register 
            onBackToLogin={() => setShowRegister(false)}
            onRegisterSuccess={handleRegisterSuccess}
          />
        ) : (
          <Card className="w-full max-w-md shadow-xl border-2 border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 backdrop-blur-sm">
            <CardHeader className="text-center pb-2 bg-gray-50/50 dark:bg-gray-800 rounded-t-lg border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                <Lock className="w-6 h-6 text-gray-900 dark:text-gray-100" /> Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sign in to access your Soundscape AI Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 bg-white dark:bg-gray-800 rounded-b-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="h-11 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="h-11 pr-10 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                onClick={login} 
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Login;