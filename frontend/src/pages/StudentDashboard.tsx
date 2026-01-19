import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, GraduationCap, BookOpen, BarChart3, FileText, ClipboardList, FileCheck, Calendar, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const data = await apiService.getStudentProfile();
        setStudentData(data);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    navigate("/");
  };

  const calculateCIETotal = (subject) => {
    if (!subject.marks) return 0;

    if (subject.subject.type === "theory") {
      // CIE = best two slip tests average + assignment average + class test average + attendance
      const slipTests = subject.marks.slipTests || [];
      const bestTwoSlipTests = slipTests
        .map(st => st.marks)
        .sort((a, b) => b - a)
        .slice(0, 2);
      const slipTestAvg = bestTwoSlipTests.length > 0
        ? bestTwoSlipTests.reduce((a, b) => a + b, 0) / bestTwoSlipTests.length
        : 0;

      const assignments = subject.marks.assignments || [];
      const assignmentAvg = assignments.length > 0
        ? assignments.reduce((a, b) => a + b.marks, 0) / assignments.length
        : 0;

      const classTests = subject.marks.classTests || [];
      const classTestAvg = classTests.length > 0
        ? classTests.reduce((a, b) => a + b.marks, 0) / classTests.length
        : 0;

      const attendance = typeof subject.marks.attendance === 'number'
        ? subject.marks.attendance
        : (subject.marks.attendance?.marks || 0);

      return parseFloat((slipTestAvg + assignmentAvg + classTestAvg + attendance).toFixed(2));
    } else {
      // Lab: weekly CIE total + internal test total + attendance
      const labRecords = subject.marks.labRecords || [];
      const labRecordTotal = labRecords.reduce((sum, lr) => sum + lr.marks, 0);

      const labTests = subject.marks.labTests || [];
      const labTestTotal = labTests.reduce((sum, lt) => sum + lt.marks, 0);

      const attendance = typeof subject.marks.attendance === 'number'
        ? subject.marks.attendance
        : (subject.marks.attendance?.marks || 0);

      return parseFloat((labRecordTotal + labTestTotal + attendance).toFixed(2));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load student data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Student Portal</h1>
                <p className="text-white/90 text-sm">{studentData.student.name}</p>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white hover:bg-white/20" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Subjects List */}
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BookOpen className="w-6 h-6" />
              My Subjects
            </CardTitle>
            <CardDescription className="text-base">Click on a subject to view detailed marks breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentData.academicProfile.subjects.map((subject) => (
                <Card
                  key={subject.subject.code}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                    selectedSubject?.subject.code === subject.subject.code ? "border-2 border-primary shadow-md" : "border-2 border-transparent"
                  }`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{subject.subject.code}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">{subject.subject.name}</CardDescription>
                      </div>
                      <Badge variant={subject.subject.type === "theory" ? "default" : "secondary"} className="ml-2">
                        {subject.subject.type === "theory" ? "Theory" : "Lab"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="font-medium">
                        {subject.subject.type === "theory" ? "Theory (CIE: 40)" : "Lab (CIE: 50)"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-semibold">CIE Total</span>
                      <span className="font-bold text-2xl text-primary">
                        {calculateCIETotal(subject)}/{subject.subject.maxMarks}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Marks View */}
        {selectedSubject && (
          <Card className="shadow-lg border-primary mt-8">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl mb-2">
                    <BarChart3 className="w-6 h-6" />
                    {selectedSubject.subject.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {selectedSubject.subject.code} | {selectedSubject.subject.type === "theory" ? "Theory Subject" : "Lab Subject"}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Final Total</p>
                  <p className="text-3xl font-bold text-primary">
                    {calculateCIETotal(selectedSubject)}/{selectedSubject.subject.maxMarks}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {selectedSubject.subject.type === "theory" ? (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <FileText className="w-5 h-5" />
                        Slip Tests (Max 5 each)
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(selectedSubject.marks.slipTests || []).map((st, idx) => (
                          <Card key={idx} className="bg-muted/30 border-muted">
                            <CardContent className="pt-6 pb-6 text-center">
                              <p className="text-sm text-muted-foreground mb-2 font-medium">Slip Test {idx + 1}</p>
                              <p className="text-3xl font-bold text-primary">{st.marks}/5</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <ClipboardList className="w-5 h-5" />
                        Assignments (Max 10 each)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedSubject.marks.assignments || []).map((assignment, idx) => (
                          <Card key={idx} className="bg-muted/30 border-muted">
                            <CardContent className="pt-6 pb-6 text-center">
                              <p className="text-sm text-muted-foreground mb-2 font-medium">Assignment {idx + 1}</p>
                              <p className="text-3xl font-bold text-primary">{assignment.marks}/10</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <FileCheck className="w-5 h-5" />
                        Class Tests (Max 20 each)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedSubject.marks.classTests || []).map((ct, idx) => (
                          <Card key={idx} className="bg-muted/30 border-muted">
                            <CardContent className="pt-6 pb-6 text-center">
                              <p className="text-sm text-muted-foreground mb-2 font-medium">Class Test {idx + 1}</p>
                              <p className="text-3xl font-bold text-primary">{ct.marks}/20</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {selectedSubject.marks.attendance != null && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                          <Calendar className="w-5 h-5" />
                          Attendance (Max 5)
                        </h3>
                        <Card className="bg-muted/30 border-muted max-w-xs">
                          <CardContent className="pt-6 pb-6 text-center">
                            <p className="text-sm text-muted-foreground mb-2 font-medium">Attendance Marks</p>
                            <p className="text-3xl font-bold text-primary">
                              {typeof selectedSubject.marks.attendance === 'number'
                                ? selectedSubject.marks.attendance
                                : (selectedSubject.marks.attendance?.marks || 0)}/5
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <FileText className="w-5 h-5" />
                        Lab Records (Weekly CIE)
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(selectedSubject.marks.labRecords || []).map((lr, idx) => (
                          <Card key={idx} className="bg-muted/30 border-muted">
                            <CardContent className="pt-6 pb-6 text-center">
                              <p className="text-sm text-muted-foreground mb-2 font-medium">Week {idx + 1}</p>
                              <p className="text-3xl font-bold text-primary">{lr.marks}/30</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <FileCheck className="w-5 h-5" />
                        Lab Tests (Internal Tests)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedSubject.marks.labTests || []).map((lt, idx) => (
                          <Card key={idx} className="bg-muted/30 border-muted">
                            <CardContent className="pt-6 pb-6 text-center">
                              <p className="text-sm text-muted-foreground mb-2 font-medium">Internal Test {idx + 1}</p>
                              <p className="text-3xl font-bold text-primary">{lt.marks}/20</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <Calendar className="w-5 h-5" />
                        Attendance (Max 5)
                      </h3>
                      <Card className="bg-muted/30 border-muted max-w-xs">
                        <CardContent className="pt-6 pb-6 text-center">
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Attendance Marks</p>
                          <p className="text-3xl font-bold text-primary">
                            {typeof selectedSubject.marks.attendance === 'number'
                              ? selectedSubject.marks.attendance
                              : (selectedSubject.marks.attendance?.marks || 0)}/5
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
