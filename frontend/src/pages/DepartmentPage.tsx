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
import {
  Building2, Users, BookOpen, GraduationCap, Plus, LogOut,
  Loader2, Trash2, Edit, Upload, Search, ChevronLeft,
  ChevronRight, FileSpreadsheet, X, ArrowUpDown, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, type Department } from "@/services/api";

interface Faculty {
  _id: string;
  facultyId: string;
  name: string;
  email?: string;
  mobile?: string;
  designation?: string;
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
  batchId: string;
  students?: Student[];
}

interface Student {
  _id: string;
  rollNo: string;
  name: string;
  email?: string;
  mobile?: string;
}

interface Batch {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
}

const DepartmentPage = () => {
  const { departmentId } = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showAddBatchDialog, setShowAddBatchDialog] = useState(false);
  const [newBatch, setNewBatch] = useState({
    startYear: "",
    endYear: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    abbreviation: "",
    credits: "",
    type: "theory",
    semester: "1"
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
    role: "Professor"
  });
  const [newClass, setNewClass] = useState({
    section: ""
  });
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    email: "",
    mobile: ""
  });
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editFacultyData, setEditFacultyData] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: ""
  });
  const [showEditFacultyDialog, setShowEditFacultyDialog] = useState(false);

  useEffect(() => {
    loadDepartment();
    loadBatches();
  }, [departmentId]);

  const loadDepartment = async () => {
    try {
      const dept = await apiService.getDepartmentById(departmentId!);
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

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>, semester?: string) => {
    e.preventDefault();
    if (!department) return;

    const sem = semester || newSubject.semester;

    try {
      await apiService.addSubjectToDepartment(department._id, {
        subjectCode: newSubject.code,
        name: newSubject.name,
        abbreviation: newSubject.abbreviation,
        semester: sem
      });
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
        semester: "1"
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
        role: "Professor"
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
    if (!department || !selectedBatch || selectedBatch === "all") {
      toast({
        title: "Error",
        description: "Please select a batch first",
        variant: "destructive",
      });
      return;
    }

    const batch = batches.find(b => b.name === selectedBatch);
    if (!batch) {
      toast({
        title: "Error",
        description: "Selected batch not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await apiService.addClassToDepartment(department._id, {
        ...newClass,
        batchId: batch._id
      });
      toast({
        title: "Success",
        description: "Class added successfully",
      });

      // Optimistically update the local state for immediate UI update
      if (result.class) {
        setDepartment(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            classes: [...(prev.classes || []), result.class as Class]
          };
        });
      }

      setNewClass({
        section: ""
      });

      // Refresh data from server to ensure consistency
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
      const result = await apiService.createStudentAndAddToClass(department._id, selectedClass._id, newStudent);
      toast({
        title: "Success",
        description: "Student created and added to class successfully",
      });

      // Optimistically update the selectedClass state to include the new student
      if (result.student) {
        setSelectedClass(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            students: [...(prev.students || []), result.student as Student]
          };
        });

        // Also update the department state to reflect the change
        setDepartment(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            classes: prev.classes?.map(cls =>
              cls._id === selectedClass._id
                ? { ...cls, students: [...(cls.students || []), result.student as Student] }
                : cls
            )
          };
        });
      }

      setNewStudent({
        name: "",
        rollNo: "",
        email: "",
        mobile: ""
      });

      // Refresh data from server to ensure consistency
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

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = bulkStudentFile.name.substring(bulkStudentFile.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

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

  const handleEditFaculty = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setEditFacultyData({
      name: faculty.name,
      email: faculty.email || "",
      mobile: faculty.mobile || "",
      designation: faculty.designation || ""
    });
    setShowEditFacultyDialog(true);
  };

  const handleUpdateFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department || !editingFaculty) return;

    try {
      await apiService.updateFaculty(department._id, editingFaculty._id, editFacultyData);
      toast({
        title: "Success",
        description: "Faculty updated successfully",
      });
      setShowEditFacultyDialog(false);
      setEditingFaculty(null);
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update faculty",
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

  const handleEditStudent = (_student: Student) => {
    // TODO: Implement edit student functionality
    toast({
      title: "Feature Coming Soon",
      description: "Edit student functionality will be available soon",
    });
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

  const handleDeleteClass = async (classId: string) => {
    if (!department) return;

    if (!confirm('Are you sure you want to delete this section? This will also remove all students in this section.')) return;

    try {
      await apiService.deleteClass(department._id, classId);
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
      loadDepartment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const handleAddBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department) return;

    try {
      await apiService.request(`/admin/departments/${departmentId}/batches`, {
        method: 'POST',
        body: newBatch
      });
      toast({
        title: "Success",
        description: `Batch ${newBatch.startYear}-${newBatch.endYear} created successfully`,
      });
      setShowAddBatchDialog(false);
      setNewBatch({
        startYear: "",
        endYear: ""
      });
      loadBatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive",
      });
    }
  };

  const loadBatches = async () => {
    try {
      const response = await apiService.request(`/admin/departments/${departmentId}/batches`);
      // Handle API response that might be wrapped in data property
      const batchesData = (response as any).data || response;
      setBatches(batchesData as Batch[]);
    } catch (error: any) {
      console.error('Load batches error:', error);
      toast({
        title: "Error",
        description: "Failed to load batches",
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
  // Group faculty by designation
  const facultyByRole = department.faculty?.reduce((acc: Record<string, Faculty[]>, faculty: Faculty) => {
    const roleKey = faculty.designation || 'Other';
    if (!acc[roleKey]) {
      acc[roleKey] = [];
    }
    acc[roleKey].push(faculty);
    return acc;
  }, {}) || {};

  // Sort faculty designations in specific order
  const designationOrder = ['Professor', 'Associate Professor', 'Assistant Professor'];
  const sortedFacultyByRole = Object.entries(facultyByRole).sort((a, b) => {
    const indexA = designationOrder.indexOf(a[0]);
    const indexB = designationOrder.indexOf(b[0]);
    // If designation is not in the order list, put it at the end
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

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
                <p className="text-sm text-white/90">Department Code: {department.abbreviation || 'N/A'}</p>
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
                <Dialog open={showEditFacultyDialog} onOpenChange={setShowEditFacultyDialog}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Faculty Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateFaculty} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-faculty-name">Full Name</Label>
                        <Input
                          id="edit-faculty-name"
                          value={editFacultyData.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFacultyData({...editFacultyData, name: e.target.value})}
                          placeholder="e.g., Dr. John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-faculty-designation">Designation</Label>
                        <Select 
                          value={editFacultyData.designation} 
                          onValueChange={(value: string) => setEditFacultyData({...editFacultyData, designation: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Professor">Professor</SelectItem>
                            <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                            <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-faculty-email">Email</Label>
                        <Input
                          id="edit-faculty-email"
                          type="email"
                          value={editFacultyData.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFacultyData({...editFacultyData, email: e.target.value})}
                          placeholder="e.g., john.doe@college.edu"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-faculty-mobile">Mobile</Label>
                        <Input
                          id="edit-faculty-mobile"
                          value={editFacultyData.mobile}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFacultyData({...editFacultyData, mobile: e.target.value})}
                          placeholder="e.g., +91 9876543210"
                        />
                      </div>
                      <Button type="submit" className="w-full">Update Faculty</Button>
                    </form>
                  </DialogContent>
                </Dialog>
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
              sortedFacultyByRole.map(([role, facultyList]) => (
                <div key={role} className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">{role}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Faculty ID</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead className="text-center">Email</TableHead>
                        <TableHead className="text-center">Phone</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(facultyList as Faculty[]).map((faculty) => (
                        <TableRow key={faculty._id}>
                          <TableCell className="font-medium text-left">{faculty.facultyId}</TableCell>
                          <TableCell className="text-left">{faculty.name}</TableCell>
                          <TableCell className="text-left">{faculty.email}</TableCell>
                          <TableCell className="text-left">{faculty.mobile || '-'}</TableCell>
                          <TableCell className="text-left">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditFaculty(faculty)}
                              >
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
                      <DialogTitle>Bulk Upload Subjects</DialogTitle>
                      <DialogDescription>
                        Upload an Excel file with subject data. Select the semester for the subjects.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBulkAddSubjects} className="space-y-4">
                      <div>
                        <Label htmlFor="bulk-subject-semester">Semester</Label>
                        <Select
                          value={bulkSubjectSemester}
                          onValueChange={setBulkSubjectSemester}
                        >
                          <SelectTrigger id="bulk-subject-semester">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Semester {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                      <DialogTitle>Add New Subject</DialogTitle>
                      <DialogDescription>
                        Add a new subject to the department.
                      </DialogDescription>
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
                      <div>
                        <Label htmlFor="subject-semester">Semester</Label>
                        <Select
                          value={newSubject.semester}
                          onValueChange={(value: string) => setNewSubject({...newSubject, semester: value})}
                        >
                          <SelectTrigger id="subject-semester">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Semester {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">Add Subject</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
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
                        <form onSubmit={(e) => handleAddSubject(e, semester)} className="space-y-4">
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
                          <Button type="submit" className="w-full">Add Subject</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Code</TableHead>
                        <TableHead className="text-center">Subject Name</TableHead>
                        <TableHead className="text-center">Abbreviation</TableHead>
                        <TableHead className="text-center">Semester</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject._id}>
                          <TableCell className="font-medium text-left">{subject.code}</TableCell>
                          <TableCell className="text-left">{subject.name}</TableCell>
                          <TableCell className="text-left">{subject.abbreviation || '-'}</TableCell>
                          <TableCell className="text-left">{subject.semester}</TableCell>
                          <TableCell className="text-left">
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
            {/* Batch Filter Dropdown */}
            <div className="flex items-center space-x-4">
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.name} value={batch.name}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showAddBatchDialog} onOpenChange={setShowAddBatchDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Batch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Batch</DialogTitle>
                    <DialogDescription>
                      Create a new student batch (e.g., 2023-27 for students joining in 2023 and graduating in 2027).
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddBatch} className="space-y-4">
                    <div>
                      <Label htmlFor="batch-start-year">Start Year</Label>
                      <Input
                        id="batch-start-year"
                        type="number"
                        value={newBatch.startYear}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBatch({...newBatch, startYear: e.target.value})}
                        placeholder="e.g., 2023"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="batch-end-year">End Year</Label>
                      <Input
                        id="batch-end-year"
                        type="number"
                        value={newBatch.endYear}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBatch({...newBatch, endYear: e.target.value})}
                        placeholder="e.g., 2027"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Batch</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Student Sections</h2>
              {selectedBatch !== "all" && (
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
                      <Button type="submit" className="w-full">Add Section</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {selectedBatch === "all" ? (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Batch</h3>
                <p className="text-gray-600">Choose a batch from the dropdown above to view and manage student sections.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {department.classes?.filter(classItem => {
                  const batch = batches.find(b => b.name === selectedBatch);
                  if (!batch) return false;
                  return classItem.batchId === batch._id || classItem.batchId === batch._id.toString();
                }).map((classItem) => (
                  <Card
                    key={classItem._id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedClass?._id === classItem._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      // Ensure we include the batchId when setting selectedClass
                      setSelectedClass({
                        ...classItem,
                        batchId: classItem.batchId || '' // Add fallback if batchId is missing
                      });
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center space-x-2">
                            <GraduationCap className="w-5 h-5" />
                            <span>{classItem.section}</span>
                          </CardTitle>
                          <CardDescription className="text-sm">
                            <div className="grid grid-cols-2 gap-4 mt-1">
                              <div className="text-center">
                                <div className="font-medium text-primary">Year {classItem.year}</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-primary">Semester {classItem.semester}</div>
                              </div>
                            </div>
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(classItem._id);
                          }}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Students</div>
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            {classItem.students?.length || 0}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

{selectedClass && (
  <div className="mt-8 border rounded-lg shadow-sm bg-white">
    {/* Section Header */}
    <div className="border-b p-6 bg-muted/5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            {selectedClass.section}
            <Badge variant="outline" className="ml-2">
              {selectedClass.students?.length || 0} Students
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Batch: {batches.find(b => b._id === selectedClass.batchId)?.name || 'N/A'} •
            Year {selectedClass.year} • Semester {selectedClass.semester}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Import Students to {selectedClass.section}</DialogTitle>
                <DialogDescription>
                  Upload an Excel file (.xlsx, .xls) with student data.
                  <div className="mt-2 text-sm bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="font-medium text-blue-800 mb-1">Expected format:</p>
                    <ul className="list-disc list-inside text-blue-700 text-xs space-y-1">
                      <li>First column: Roll Number (e.g., 160123737001)</li>
                      <li>Second column: Full Name (e.g., John Doe)</li>
                      <li>Include header row: "Roll Number" and "Name"</li>
                    </ul>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkAddStudents} className="space-y-4">
                <div>
                  <Label htmlFor="bulk-student-file" className="block text-sm font-medium mb-2">
                    Excel File (.xlsx, .xls)
                  </Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Drag & drop or click to upload Excel file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports .xlsx and .xls files
                    </p>
                    <Input
                      id="bulk-student-file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkStudentFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('bulk-student-file')?.click()}
                      className="mt-3"
                    >
                      Browse Excel Files
                    </Button>
                    {bulkStudentFile && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded mr-3">
                              <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{bulkStudentFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(bulkStudentFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setBulkStudentFile(null)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!bulkStudentFile}
                >
                  Import Students from Excel
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Student to {selectedClass.section}</DialogTitle>
                <DialogDescription>
                  Add a new student to this section
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStudentAndAddToClass} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="student-rollno" className="text-sm font-medium">
                      Roll Number *
                    </Label>
                    <Input
                      id="student-rollno"
                      value={newStudent.rollNo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStudent({...newStudent, rollNo: e.target.value})}
                      placeholder="160123737001"
                      required
                      className="h-9"
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique roll number for the student
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="student-name"
                      value={newStudent.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStudent({...newStudent, name: e.target.value})}
                      placeholder="John Doe"
                      required
                      className="h-9"
                    />
                    <p className="text-xs text-muted-foreground">
                      Complete name as per official records
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">
                    Add Student
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewStudent({
                      name: "",
                      rollNo: "",
                      email: "",
                      mobile: ""
                    })}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>

    {/* Students Table */}
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-muted-foreground">
          Student Roster ({selectedClass.students?.length || 0})
        </h4>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by roll number or name..."
              className="pl-8 h-9 w-[300px]"
              // Add search functionality if needed
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px] text-center">
                <div className="flex items-center justify-center">
                  Roll Number
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedClass.students?.length ? (
              selectedClass.students
                .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''))
                .map((student) => (
                  <TableRow key={student._id} className="hover:bg-muted/50 group">
                    <TableCell>
                      <div className="inline-block font-mono text-sm bg-muted/20 px-3 py-1.5 rounded border border-muted/30">
                        {student.rollNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">{student.name}</div>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDeleteStudent(student._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Users className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      No students in this section
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add students individually or import from an Excel file
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Upload className="w-3.5 h-3.5 mr-2" />
                          Import from Excel
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      {selectedClass.students?.length ? (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {selectedClass.students.length} student{selectedClass.students.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground">
              <Download className="inline h-3 w-3 mr-1" />
              <a
                href="#"
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  // Add export to Excel functionality here
                  toast({
                    title: "Export Feature",
                    description: "Export to Excel will be available soon",
                  });
                }}
              >
                Export to Excel
              </a>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  </div>
)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DepartmentPage;