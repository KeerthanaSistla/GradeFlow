import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Users, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface User {
  _id: string;
  role: string;
  name: string;
  email?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const Login = () => {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.login({
        username,
        password
        // Note: Removed role from login - backend determines role from user data
      });

      const data = response as unknown as LoginResponse;

      // Store user info
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userData", JSON.stringify(data.user));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name}!`,
      });

      navigate(data.user.role === "student" ? "/student" : data.user.role === "faculty" ? "/faculty" : data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-info to-accent p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Academic Portal
            </h1>
            <p className="text-white/90 text-lg">
              Faculty-Student Marks Management System
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20"
              onClick={() => setRole("student")}
            >
              <CardHeader className="text-center">
                <GraduationCap className="w-12 h-12 text-white mx-auto mb-4" />
                <CardTitle className="text-white">Student Login</CardTitle>
                <CardDescription className="text-white/80">
                  Access your marks and academic records
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20"
              onClick={() => setRole("faculty")}
            >
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-white mx-auto mb-4" />
                <CardTitle className="text-white">Faculty Login</CardTitle>
                <CardDescription className="text-white/80">
                  Manage student marks and subjects
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20"
              onClick={() => setRole("admin")}
            >
              <CardHeader className="text-center">
                <Building2 className="w-12 h-12 text-white mx-auto mb-4" />
                <CardTitle className="text-white">Admin Login</CardTitle>
                <CardDescription className="text-white/80">
                  Manage departments, faculty, and system settings
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-info to-accent p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {role === "student" ? (
              <GraduationCap className="w-8 h-8 text-[#3b4caa]" />
            ) : role === "faculty" ? (
              <Users className="w-8 h-8 text-[#3b4caa]" />
            ) : (
              <Building2 className="w-8 h-8 text-[#3b4caa]" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {role === "student" ? "Student" : role === "faculty" ? "Faculty" : "Admin"} Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                {role === "student" ? "Roll Number" : role === "admin" ? "Username" : "Name"}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={role === "student" ? "Enter your roll number (e.g., 160123737001)" : role === "admin" ? "Enter your username (e.g., admin)" : "Enter your name (e.g., E. Rama Lakshmi)"}
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setRole(null)}
                disabled={loading}
              >
                Back to Role Selection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
