import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, BookOpen, GraduationCap, Plus, LogOut, Loader2, Trash2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: ""
  });
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    abbreviation: "",
    credits: "",
    type: "theory",
    semester: ""
  });
  const [bulkSubjectSemester, setBulkSubjectSemester] = useState("");
  const [bulkSubjectFile, setBulkSubjectFile] = useState(null);
  const [bulkFacultyFile, setBulkFacultyFile] = useState(null);
  const [bulkStudentFile, setBulkStudentFile] = useState(null);
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

  // Preview states for uploaded data
  const [uploadedSubjects, setUploadedSubjects] = useState([]);
  const [uploadedFaculty, setUploadedFaculty] = useState([]);
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

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



  const handleCreateDepartment = async (e) => {
    e.preventDefault();

    try {
      await apiService.createDepartment(newDepartment);
      toast({
        title: "Success",
        description: "Department created successfully",
      });
      setNewDepartment({
        name: "",
        code: ""
      });
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create department",
        variant: "destructive",
      });
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    try {
      await apiService.addSubjectToDepartment(selectedDepartment._id, newSubject);
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
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      });
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    try {
      await apiService.addFacultyToDepartment(selectedDepartment._id, newFaculty);
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
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add faculty",
        variant: "destructive",
      });
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    try {
      await apiService.addClassToDepartment(selectedDepartment._id, newClass);
      toast({
        title: "Success",
        description: "Class added successfully",
      });
      setNewClass({
        section: "",
        year: "",
        semester: ""
      });
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add class",
        variant: "destructive",
      });
    }
  };

  const handleCreateStudentAndAddToClass = async (e) => {
    e.preventDefault();
    if (!selectedDepartment || !selectedClass) return;

    try {
      await apiService.createStudentAndAddToClass(selectedDepartment._id, selectedClass._id, newStudent);
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
      setSelectedClass(null);
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create student and add to class",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddSubjects = async (e) => {
    e.preventDefault();
    if (!selectedDepartment || !bulkSubjectFile || !bulkSubjectSemester) return;

    try {
      const result = await apiService.bulkAddSubjects(selectedDepartment._id, bulkSubjectFile, bulkSubjectSemester);
      toast({
        title: "Success",
        description: result.message,
      });
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Some errors occurred",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
      setBulkSubjectFile(null);
      setBulkSubjectSemester("");
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to bulk add subjects",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddFaculty = async (e) => {
    e.preventDefault();
    if (!selectedDepartment || !bulkFacultyFile) return;

    try {
      const result = await apiService.bulkAddFaculty(selectedDepartment._id, bulkFacultyFile);
      toast({
        title: "Success",
        description: result.message,
      });
      setBulkFacultyFile(null);
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to bulk add faculty",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddStudents = async (e) => {
    e.preventDefault();
    if (!selectedDepartment || !selectedClass || !bulkStudentFile) return;

    try {
      const result = await apiService.bulkAddStudents(selectedDepartment._id, selectedClass._id, bulkStudentFile);
      toast({
        title: "Success",
        description: result.message,
      });
      setBulkStudentFile(null);
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to bulk add students",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!selectedDepartment) return;

    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await apiService.deleteSubject(selectedDepartment._id, subjectId);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!selectedDepartment) return;

    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      await apiService.deleteFaculty(selectedDepartment._id, facultyId);
      toast({
        title: "Success",
        description: "Faculty deleted successfully",
      });
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete faculty",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!selectedDepartment || !selectedClass) return;

    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await apiService.deleteStudent(selectedDepartment._id, selectedClass._id, studentId);
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      loadDepartments();
    } catch (error) {
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
        {/* Department Selector */}
        <div className="mb-6">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="department-select" className="text-sm font-medium text-gray-700 mb-2 block">
                Select Department
              </Label>
              <Select value={selectedDepartment?._id || ""} onValueChange={(value) => {
                const dept = departments.find(d => d._id === value);
                setSelectedDepartment(dept);
              }}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Choose a department to manage" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDepartment} className="space-y-4">
                  <div>
                    <Label htmlFor="department-name">Department Name</Label>
                    <Input
                      id="department-name"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                      placeholder="e.g., Computer Science and Engineering"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department-code">Department Code</Label>
                    <Input
                      id="department-code"
                      value={newDepartment.code}
                      onChange={(e) => setNewDepartment({...newDepartment, code: e.target.value})}
                      placeholder="e.g., CSE"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">Create Department</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-blue-100">
            <TabsTrigger value="subjects" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Subjects</TabsTrigger>
            <TabsTrigger value="faculty" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Faculty</TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Classes</TabsTrigger>
          </TabsList>



          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            {selectedDepartment ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Subjects in {selectedDepartment.name}</h2>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Bulk Upload
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Bulk Upload Subjects to {selectedDepartment.name}</DialogTitle>
                          <DialogDescription>
                            Upload an Excel file with subject data. Expected columns: Code, Subject, Abbreviation, Credits, Theory/Lab
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleBulkAddSubjects} className="space-y-4">
                          <div>
                            <Label htmlFor="bulk-subject-semester">Semester</Label>
                            <Input
                              id="bulk-subject-semester"
                              type="number"
                              value={bulkSubjectSemester}
                              onChange={(e) => setBulkSubjectSemester(e.target.value)}
                              placeholder="e.g., 5"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="bulk-subject-file">Excel File</Label>
                            <Input
                              id="bulk-subject-file"
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={(e) => setBulkSubjectFile(e.target.files[0])}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Upload Subjects</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Subject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Subject to {selectedDepartment.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddSubject} className="space-y-4">
                          <div>
                            <Label htmlFor="subject-code">Subject Code</Label>
                            <Input
                              id="subject-code"
                              value={newSubject.code}
                              onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                              placeholder="e.g., 22CSC21"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="subject-name">Subject Name</Label>
                            <Input
                              id="subject-name"
                              value={newSubject.name}
                              onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                              placeholder="e.g., Software Engineering"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="subject-credits">Credits</Label>
                            <Input
                              id="subject-credits"
                              type="number"
                              value={newSubject.credits}
                              onChange={(e) => setNewSubject({...newSubject, credits: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="subject-type">Type</Label>
                            <Select value={newSubject.type} onValueChange={(value) => setNewSubject({...newSubject, type: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="theory">Theory</SelectItem>
                                <SelectItem value="lab">Lab</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="subject-semester">Semester</Label>
                            <Input
                              id="subject-semester"
                              type="number"
                              value={newSubject.semester}
                              onChange={(e) => setNewSubject({...newSubject, semester: e.target.value})}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Add Subject</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Abbreviation</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Theory/Lab</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDepartment.subjects?.map((subject) => (
                      <TableRow key={subject._id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>{subject.abbreviation || '-'}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>{subject.credits}</TableCell>
                        <TableCell>
                          <Badge variant={subject.type === 'theory' ? 'default' : 'secondary'}>
                            {subject.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{subject.semester}</TableCell>
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
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Department</h3>
                <p className="text-gray-600">Choose a department from the Departments tab to manage subjects.</p>
              </div>
            )}
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-6">
            {selectedDepartment ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Faculty in {selectedDepartment.name}</h2>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Bulk Upload
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Bulk Upload Faculty to {selectedDepartment.name}</DialogTitle>
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
                              onChange={(e) => setBulkFacultyFile(e.target.files[0])}
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
                          <DialogTitle>Add Faculty to {selectedDepartment.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddFaculty} className="space-y-4">
                          <div>
                            <Label htmlFor="faculty-name">Full Name</Label>
                            <Input
                              id="faculty-name"
                              value={newFaculty.name}
                              onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                              placeholder="e.g., Dr. John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="faculty-email">Email</Label>
                            <Input
                              id="faculty-email"
                              type="email"
                              value={newFaculty.email}
                              onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                              placeholder="e.g., john.doe@college.edu"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="faculty-mobile">Mobile</Label>
                            <Input
                              id="faculty-mobile"
                              value={newFaculty.mobile}
                              onChange={(e) => setNewFaculty({...newFaculty, mobile: e.target.value})}
                              placeholder="e.g., +91 9876543210"
                            />
                          </div>
                          <div>
                            <Label htmlFor="faculty-id">Faculty ID</Label>
                            <Input
                              id="faculty-id"
                              value={newFaculty.facultyId}
                              onChange={(e) => setNewFaculty({...newFaculty, facultyId: e.target.value})}
                              placeholder="e.g., FAC001"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="faculty-role">Role</Label>
                            <Select value={newFaculty.role} onValueChange={(value) => setNewFaculty({...newFaculty, role: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Professor">Professor</SelectItem>
                                <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                                <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                                <SelectItem value="Lecturer">Lecturer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full">Add Faculty</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>FacultyId</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>PhoneNumber</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDepartment.faculty?.map((faculty) => (
                      <TableRow key={faculty._id}>
                        <TableCell className="font-medium">{faculty.name}</TableCell>
                        <TableCell>{faculty.facultyId}</TableCell>
                        <TableCell>{faculty.role}</TableCell>
                        <TableCell>{faculty.email}</TableCell>
                        <TableCell>{faculty.mobile || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFaculty(faculty._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Department</h3>
                <p className="text-gray-600">Choose a department from the Departments tab to manage faculty.</p>
              </div>
            )}
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            {selectedDepartment ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Classes in {selectedDepartment.name}</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Class to {selectedDepartment.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddClass} className="space-y-4">
                        <div>
                          <Label htmlFor="class-section">Section</Label>
                          <Input
                            id="class-section"
                            value={newClass.section}
                            onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                            placeholder="e.g., CSE-A"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="class-year">Year</Label>
                          <Input
                            id="class-year"
                            type="number"
                            value={newClass.year}
                            onChange={(e) => setNewClass({...newClass, year: e.target.value})}
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
                            onChange={(e) => setNewClass({...newClass, semester: e.target.value})}
                            placeholder="e.g., 6"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Class</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Select a class to add students</h3>
                  {selectedClass && (
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Bulk Upload Students
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Bulk Upload Students to {selectedClass.section}</DialogTitle>
                            <DialogDescription>
                              Upload an Excel file with student data. Expected columns: Name, Roll No, Email, Mobile
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleBulkAddStudents} className="space-y-4">
                            <div>
                              <Label htmlFor="bulk-student-file">Excel File</Label>
                              <Input
                                id="bulk-student-file"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setBulkStudentFile(e.target.files[0])}
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
                            Add Student to {selectedClass.section}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Student to {selectedClass.section}</DialogTitle>
                            <DialogDescription>
                              Create a new student and add them to this class.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateStudentAndAddToClass} className="space-y-4">
                            <div>
                              <Label htmlFor="student-name">Full Name</Label>
                              <Input
                                id="student-name"
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                                placeholder="e.g., John Doe"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="student-rollno">Roll Number</Label>
                              <Input
                                id="student-rollno"
                                value={newStudent.rollNo}
                                onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})}
                                placeholder="e.g., 12345"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="student-email">Email</Label>
                              <Input
                                id="student-email"
                                type="email"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                                placeholder="e.g., john.doe@college.edu"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="student-mobile">Mobile</Label>
                              <Input
                                id="student-mobile"
                                value={newStudent.mobile}
                                onChange={(e) => setNewStudent({...newStudent, mobile: e.target.value})}
                                placeholder="e.g., +91 9876543210"
                              />
                            </div>
                            <Button type="submit" className="w-full">Add Student</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedDepartment.classes?.map((classItem, index) => (
                    <Card
                      key={index}
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
                          <Badge variant="secondary">{classItem.students?.length || 0}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedClass && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Students in {selectedClass.section}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>RollNumber</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>PhoneNumber</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClass.students?.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">{student.rollNo}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.mobile || '-'}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStudent(student._id)}
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
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Department</h3>
                <p className="text-gray-600">Choose a department from the Departments tab to manage classes.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
