import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import type { Department } from "@/services/api";

const AdminDashboard = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentPassword, setDepartmentPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    abbreviation: ""
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    setFilteredDepartments(
      departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      )
    );
  }, [departments, searchQuery]);

  const handleDepartmentClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // For now, accept any password. In real implementation, verify against backend
    if (departmentPassword.trim()) {
      setShowPasswordDialog(false);
      setDepartmentPassword("");
      navigate(`/admin/department/${selectedDepartment!._id}`);
    } else {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Load departments error:', error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const handleCreateDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await apiService.createDepartment(newDepartment);
      toast({
        title: "Success",
        description: "Department created successfully",
      });
      setNewDepartment({
        name: "",
        abbreviation: ""
      });
      loadDepartments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create department",
        variant: "destructive",
      });
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <ShieldCheck className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-white/90">Manage departments, subjects, faculty, classes, and students</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-white border-white hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Add Department Card */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-dashed border-2 border-gray-300 hover:border-primary">
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Plus className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">Add Department</h3>
                  <p className="text-sm text-gray-500 text-center">Create a new department</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription>
                  Enter the department details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div>
                  <Label htmlFor="department-name">Department Name</Label>
                  <Input
                    id="department-name"
                    value={newDepartment.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepartment({...newDepartment, name: e.target.value})}
                    placeholder="e.g., Computer Science and Engineering"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department-abbreviation">Department Code</Label>
                  <Input
                    id="department-abbreviation"
                    value={newDepartment.abbreviation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepartment({...newDepartment, abbreviation: e.target.value})}
                    placeholder="e.g., CSE"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Department</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Department Cards */}
          {filteredDepartments.map((dept) => (
            <Card
              key={dept._id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => handleDepartmentClick(dept)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  <span>{dept.name}</span>
                </CardTitle>
                <CardDescription>{dept.abbreviation || 'N/A'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Faculty:</span>
                    <Badge variant="secondary">{dept.faculty?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subjects:</span>
                    <Badge variant="secondary">{dept.subjects?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Classes:</span>
                    <Badge variant="secondary">{dept.classes?.length || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enter Department Password</DialogTitle>
              <DialogDescription>
                Please enter the password to access {selectedDepartment?.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="department-password">Password</Label>
                <Input
                  id="department-password"
                  type="password"
                  value={departmentPassword}
                  onChange={(e) => setDepartmentPassword(e.target.value)}
                  placeholder="Enter department password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Access Department</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
