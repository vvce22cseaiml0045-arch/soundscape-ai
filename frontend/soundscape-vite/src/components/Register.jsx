import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Register({ onBackToLogin, onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      return false;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return false;
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter a password.",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
      });
      return false;
    }

    return true;
  };

  const register = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const form = new FormData();
      form.append("email", email);
      form.append("password", password);

      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created! You can now sign in.",
        });
        onRegisterSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.message || "An error occurred during registration.",
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
      register();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-2 border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 backdrop-blur-sm">
      <CardHeader className="text-center pb-2 bg-gray-50/50 dark:bg-gray-800 rounded-t-lg border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
          <UserPlus className="w-6 h-6 text-gray-900 dark:text-gray-100" /> Create Account
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Join Soundscape AI to start analyzing audio
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
              placeholder="Create a password (min 6 characters)"
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="h-11 pr-10 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button 
          onClick={register} 
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        <Button 
          variant="outline"
          onClick={onBackToLogin}
          className="w-full h-11"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </CardContent>
    </Card>
  );
}

export default Register;