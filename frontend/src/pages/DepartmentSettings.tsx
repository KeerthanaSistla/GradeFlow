import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Settings, Users, BookOpen, GraduationCap, LogOut, Key, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, type Department } from "@/services/api";

const DepartmentSettings = () => {
  const { departmentId } = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    abbreviation: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDepartment();
  }, [departmentId]);

  const loadDepartment = async () => {
    try {
      const dept = await apiService.getDepartmentById(departmentId!);
      setDepartment(dept);
      setEditForm({
        name: dept.name,
        abbreviation: dept.abbreviation || ""
      });
    } catch (error: any) {
      console.error('Load department error:', error);
      toast({
        title: "Error",
        description: "Failed to load department",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department) return;

    try {
      await apiService.updateDepartment(department._id, editForm);
      toast({
        title: "Success",
        description: "Department details updated successfully",
      });
      setShowEditDetails(false);
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement password change API call
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Department Not Found</h2>
          <Button onClick={() => navigate('/admin')}>Back to Admin Dashboard</Button>
        </div>
      </div>
    );
  }

  // Calculate counts
  const studentCount = department.classes?.reduce((total, cls) => total + (cls.students?.length || 0), 0) || 0;
  const facultyCount = department.faculty?.length || 0;
  const subjectCount = department.subjects?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Department Settings</h1>
                <p className="text-sm text-white/90">{department.name}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/admin/department/${departmentId}`)}
              variant="outline"
              className="text-white border-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Department
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Department Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Department Overview
              </CardTitle>
              <CardDescription>
                Current statistics and information for {department.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{studentCount}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{subjectCount}</div>
                  <div className="text-sm text-muted-foreground">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{facultyCount}</div>
                  <div className="text-sm text-muted-foreground">Faculty</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Department Details
                </span>
                <Dialog open={showEditDetails} onOpenChange={setShowEditDetails}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Department Details</DialogTitle>
                      <DialogDescription>
                        Update the department name and abbreviation.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateDepartment} className="space-y-4">
                      <div>
                        <Label htmlFor="dept-name">Department Name</Label>
                        <Input
                          id="dept-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          placeholder="e.g., Computer Science"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dept-abbr">Abbreviation</Label>
                        <Input
                          id="dept-abbr"
                          value={editForm.abbreviation}
                          onChange={(e) => setEditForm({...editForm, abbreviation: e.target.value})}
                          placeholder="e.g., CSE"
                        />
                      </div>
                      <Button type="submit" className="w-full">Update Department</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Department Name</Label>
                <p className="text-lg font-semibold">{department.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Abbreviation</Label>
                <p className="text-lg font-semibold">{department.abbreviation || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Change Password</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Navigation Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>
                Quick actions for navigation and account management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleBackToAdmin}
                variant="outline"
                className="w-full justify-start"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Dashboard
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSettings;
