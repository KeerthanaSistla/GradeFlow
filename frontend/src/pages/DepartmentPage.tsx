import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, BookOpen, GraduationCap, Plus, LogOut, Loader2, Trash2, Edit, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface Faculty {
  _id: string;
  facultyId: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
}

interface Subject {
  _id: string;
  code: string;
  name: string;
  abbreviation?: string;
  semester: string;
}

interface Class {
  _id: string;
  section: string;
  year: number;
  semester: number;
  students?: Student[];
}

interface Student {
  _id: string;
  rollNo: string;
  name: string;
  email?: string;
  mobile?: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  faculty?: Faculty[];
  subjects?: Subject[];
  classes?: Class[];
}

const DepartmentPage = () => {
  const { departmentId } = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    abbreviation: "",
    credits: "",
    type: "theory",
    semester: ""
  });
  const [bulkSubjectSemester, setBulkSubjectSemester] = useState("");
  const [bulkSubjectFile, setBulkSubjectFile] = useState<File | null>(null);
  const [bulkFacultyFile, setBulkFacultyFile] = useState<File | null>(null);
  const [bulkStudentFile, setBulkStudentFile] = useState<File | null>(null);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    mobile: "",
    facultyId: "",
    role: "Assistant Professor"
  });
  const [newClass, setNewClass] = useState({
    section: "",
    year: "",
    semester: ""
  });
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    email: "",
    mobile: ""
  });

  useEffect(() => {
    loadDepartment();
  }, [departmentId]);

  const loadDepartment = async () => {
    try {
      const data = await apiService.getDepartments();
      const depts = Array.isArray(data) ? data : (data as Record<string, unknown>).departments as Department[];
      const dept = depts.find((d: Department) => d._id === departmentId);
      if (!dept) {
        navigate('/admin');
        return;
      }
      setDepartment(dept);
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

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department) return;

    try {
      await apiService.addSubjectToDepartment(department._id, newSubject);
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
      setNewSubject({
        code: "",
        name: "",
        abbreviation: "",
        credits: "",
        type: "theory",
        semester: ""
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      });
    }
  };

  const handleAddFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department) return;

    try {
      await apiService.addFacultyToDepartment(department._id, newFaculty);
      toast({
        title: "Success",
        description: "Faculty added successfully",
      });
      setNewFaculty({
        name: "",
        email: "",
        mobile: "",
        facultyId: "",
        role: "Assistant Professor"
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add faculty",
        variant: "destructive",
      });
    }
  };

  const handleAddClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department) return;

    try {
      await apiService.addClassToDepartment(department._id, newClass);
      toast({
        title: "Success",
        description: "Class added successfully",
      });
      setNewClass({
        section: "",
        year: "",
        semester: ""
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add class",
        variant: "destructive",
      });
    }
  };

  const handleCreateStudentAndAddToClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department || !selectedClass) return;

    try {
      await apiService.createStudentAndAddToClass(department._id, selectedClass._id, newStudent);
      toast({
        title: "Success",
        description: "Student created and added to class successfully",
      });
      setNewStudent({
        name: "",
        rollNo: "",
        email: "",
        mobile: ""
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create student and add to class",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddSubjects = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department || !bulkSubjectFile || !bulkSubjectSemester) return;

    try {
      const result = await apiService.bulkAddSubjects(department._id, bulkSubjectFile, bulkSubjectSemester);
      toast({
        title: "Success",
        description: result.message,
      });
      if ((result as Record<string, unknown>).errors && ((result as Record<string, unknown>).errors as unknown[]).length > 0) {
        toast({
          title: "Some errors occurred",
          description: ((result as Record<string, unknown>).errors as string[]).join(', '),
          variant: "destructive",
        });
      }
      setBulkSubjectFile(null);
      setBulkSubjectSemester("");
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to bulk add subjects",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department || !bulkFacultyFile) return;

    try {
      const result = await apiService.bulkAddFaculty(department._id, bulkFacultyFile);
      toast({
        title: "Success",
        description: result.message,
      });
      setBulkFacultyFile(null);
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to bulk add faculty",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddStudents = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department || !selectedClass || !bulkStudentFile) return;

    try {
      const result = await apiService.bulkAddStudents(department._id, selectedClass._id, bulkStudentFile);
      toast({
        title: "Success",
        description: result.message,
      });
      setBulkStudentFile(null);
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to bulk add students",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!department) return;

    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await apiService.deleteSubject(department._id, subjectId);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!department) return;

    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      await apiService.deleteFaculty(department._id, facultyId);
      toast({
        title: "Success",
        description: "Faculty deleted successfully",
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete faculty",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!department || !selectedClass) return;

    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await apiService.deleteStudent(department._id, selectedClass._id, studentId);
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
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

  // Group faculty by role
  const facultyByRole = department.faculty?.reduce((acc: Record<string, Faculty[]>, faculty: Faculty) => {
    if (!acc[faculty.role]) {
      acc[faculty.role] = [];
    }
    acc[faculty.role].push(faculty);
    return acc;
  }, {}) || {};

  // Group subjects by semester
  const subjectsBySemester = department.subjects?.reduce((acc: Record<string, Subject[]>, subject: Subject) => {
    if (!acc[subject.semester]) {
      acc[subject.semester] = [];
    }
    acc[subject.semester].push(subject);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Building2 className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{department.name}</h1>
                <p className="text-sm text-white/90">Department Code: {department.code}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/admin')} variant="outline" className="text-white border-white hover:bg-white/20">
                Back to Admin
              </Button>
              <Button onClick={handleLogout} variant="outline" className="text-white border-white hover:bg-white/20">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-blue-100">
            <TabsTrigger 
              value="faculty" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Faculty
            </TabsTrigger>
            <TabsTrigger 
              value="subjects" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Subjects
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Students
            </TabsTrigger>
          </TabsList>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Faculty Members</h2>
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Bulk Upload Faculty</DialogTitle>
                      <DialogDescription>
                        Upload an Excel file with faculty data. Expected columns: Name, Email, Mobile, Faculty ID, Role
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBulkAddFaculty} className="space-y-4">
                      <div>
                        <Label htmlFor="bulk-faculty-file">Excel File</Label>
                        <Input
                          id="bulk-faculty-file"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkFacultyFile(e.target.files?.[0] || null)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Upload Faculty</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Faculty
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Faculty Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddFaculty} className="space-y-4">
                      <div>
                        <Label htmlFor="faculty-name">Full Name</Label>
                        <Input
                          id="faculty-name"
                          value={newFaculty.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFaculty({...newFaculty, name: e.target.value})}
                          placeholder="e.g., Dr. John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="faculty-id">Faculty ID</Label>
                        <Input
                          id="faculty-id"
                          value={newFaculty.facultyId}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFaculty({...newFaculty, facultyId: e.target.value})}
                          placeholder="e.g., FAC001"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="faculty-role">Designation</Label>
                        <Select 
                          value={newFaculty.role} 
                          onValueChange={(value: string) => setNewFaculty({...newFaculty, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Professor">Professor</SelectItem>
                            <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                            <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                            <SelectItem value="Lecturer">Lecturer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="faculty-email">Email</Label>
                        <Input
                          id="faculty-email"
                          type="email"
                          value={newFaculty.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFaculty({...newFaculty, email: e.target.value})}
                          placeholder="e.g., john.doe@college.edu"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="faculty-mobile">Mobile</Label>
                        <Input
                          id="faculty-mobile"
                          value={newFaculty.mobile}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFaculty({...newFaculty, mobile: e.target.value})}
                          placeholder="e.g., +91 9876543210"
                        />
                      </div>
                      <Button type="submit" className="w-full">Add Faculty</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {Object.keys(facultyByRole).length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Faculty Members</h3>
                <p className="text-gray-600">Add faculty members to get started.</p>
              </div>
            ) : (
              Object.entries(facultyByRole).map(([role, facultyList]) => (
                <div key={role} className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">{role}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(facultyList as Faculty[]).map((faculty) => (
                        <TableRow key={faculty._id}>
                          <TableCell className="font-medium">{faculty.facultyId}</TableCell>
                          <TableCell>{faculty.name}</TableCell>
                          <TableCell>{faculty.email}</TableCell>
                          <TableCell>{faculty.mobile || '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteFaculty(faculty._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Subjects by Semester</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Semester
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Semester</DialogTitle>
                    <DialogDescription>
                      Create a new semester section for subjects.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Info",
                      description: "Semester sections are created automatically when adding subjects.",
                    });
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="semester-number">Semester Number</Label>
                      <Input
                        id="semester-number"
                        type="number"
                        placeholder="e.g., 5"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Semester</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {Object.keys(subjectsBySemester).length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects</h3>
                <p className="text-gray-600">Add subjects to get started.</p>
              </div>
            ) : (
              Object.entries(subjectsBySemester).map(([semester, subjects]) => (
                <div key={semester} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-primary">Semester {semester}</h3>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Bulk Upload
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Bulk Upload Subjects for Semester {semester}</DialogTitle>
                            <DialogDescription>
                              Upload an Excel file with subject data.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleBulkAddSubjects} className="space-y-4">
                            <div>
                              <Label htmlFor="bulk-subject-file">Excel File</Label>
                              <Input
                                id="bulk-subject-file"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkSubjectFile(e.target.files?.[0] || null)}
                                required
                              />
                            </div>
                            <Input
                              type="hidden"
                              value={semester}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkSubjectSemester(e.target.value)}
                            />
                            <Button type="submit" className="w-full">Upload Subjects</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Subject
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Subject to Semester {semester}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddSubject} className="space-y-4">
                            <div>
                              <Label htmlFor="subject-code">Subject Code</Label>
                              <Input
                                id="subject-code"
                                value={newSubject.code}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubject({...newSubject, code: e.target.value})}
                                placeholder="e.g., 22CSC21"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="subject-name">Subject Name</Label>
                              <Input
                                id="subject-name"
                                value={newSubject.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubject({...newSubject, name: e.target.value})}
                                placeholder="e.g., Software Engineering"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="subject-abbreviation">Abbreviation</Label>
                              <Input
                                id="subject-abbreviation"
                                value={newSubject.abbreviation}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubject({...newSubject, abbreviation: e.target.value})}
                                placeholder="e.g., SE"
                              />
                            </div>
                            <Input
                              type="hidden"
                              value={semester}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubject({...newSubject, semester: e.target.value})}
                            />
                            <Button type="submit" className="w-full">Add Subject</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Abbreviation</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject._id}>
                          <TableCell className="font-medium">{subject.code}</TableCell>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>{subject.abbreviation || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSubject(subject._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Student Sections</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>
                      Create a new student section (e.g., IT1, IT2, CSE-A).
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddClass} className="space-y-4">
                    <div>
                      <Label htmlFor="class-section">Section Name</Label>
                      <Input
                        id="class-section"
                        value={newClass.section}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClass({...newClass, section: e.target.value})}
                        placeholder="e.g., IT1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="class-year">Year</Label>
                      <Input
                        id="class-year"
                        type="number"
                        value={newClass.year}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClass({...newClass, year: e.target.value})}
                        placeholder="e.g., 3"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="class-semester">Semester</Label>
                      <Input
                        id="class-semester"
                        type="number"
                        value={newClass.semester}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClass({...newClass, semester: e.target.value})}
                        placeholder="e.g., 6"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Section</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {department.classes?.map((classItem) => (
                <Card
                  key={classItem._id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedClass?._id === classItem._id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedClass(classItem)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5" />
                      <span>{classItem.section}</span>
                    </CardTitle>
                    <CardDescription>
                      Year {classItem.year}, Semester {classItem.semester}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span>Students:</span>
                      <Badge variant="secondary" className="">{classItem.students?.length || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedClass && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Students in {selectedClass.section}</h3>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Bulk Upload
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Bulk Upload Students to {selectedClass.section}</DialogTitle>
                          <DialogDescription>
                            Upload a CSV file with student data. Expected columns: rollnumber, name
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleBulkAddStudents} className="space-y-4">
                          <div>
                            <Label htmlFor="bulk-student-file">CSV File</Label>
                            <Input
                              id="bulk-student-file"
                              type="file"
                              accept=".csv"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkStudentFile(e.target.files?.[0] || null)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Upload Students</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Student
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Student to {selectedClass.section}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateStudentAndAddToClass} className="space-y-4">
                          <div>
                            <Label htmlFor="student-rollno">Roll Number</Label>
                            <Input
                              id="student-rollno"
                              value={newStudent.rollNo}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStudent({...newStudent, rollNo: e.target.value})}
                              placeholder="e.g., 160123737001"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="student-name">Full Name</Label>
                            <Input
                              id="student-name"
                              value={newStudent.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStudent({...newStudent, name: e.target.value})}
                              placeholder="e.g., John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="student-email">Email</Label>
                            <Input
                              id="student-email"
                              type="email"
                              value={newStudent.email}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStudent({...newStudent, email: e.target.value})}
                              placeholder="e.g., john.doe@college.edu"
                            />
                          </div>
                          <div>
                            <Label htmlFor="student-mobile">Mobile</Label>
                            <Input
                              id="student-mobile"
                              value={newStudent.mobile}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStudent({...newStudent, mobile: e.target.value})}
                              placeholder="e.g., +91 9876543210"
                            />
                          </div>
                          <Button type="submit" className="w-full">Add Student</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClass.students?.sort((a, b) => a.rollNo.localeCompare(b.rollNo)).map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell>{student.mobile || '-'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudent(student._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DepartmentPage;