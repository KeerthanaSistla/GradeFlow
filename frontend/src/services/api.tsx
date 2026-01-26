const API_BASE_URL = 'http://localhost:4000/api';

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
}

interface ApiResponse {
  [key: string]: unknown;
}

export interface Department {
  _id: string;
  name: string;
  abbreviation?: string;
  createdAt?: string;
  faculty?: Array<{
    _id: string;
    facultyId: string;
    name: string;
    email?: string;
    mobile?: string;
    designation?: string;
  }>;
  subjects?: Array<{
    _id: string;
    code: string;
    name: string;
    abbreviation?: string;
    semester: string;
  }>;
  classes?: Array<{
    _id: string;
    section: string;
    year: number;
    semester: number;
    batchId: string;
    students?: Array<{
      _id: string;
      rollNo: string;
      name: string;
      email?: string;
      mobile?: string;
    }>;
  }>;
}

class ApiService {
  token: string | null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit & { headers?: Record<string, string> } = {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    if (options.body) {
      if (options.body instanceof FormData) {
        config.body = options.body;
        delete (config.headers as Record<string, string>)['Content-Type'];
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error((errorData as Record<string, unknown>).message as string || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods - Role-based login
  async adminLogin(credentials: Record<string, unknown>): Promise<ApiResponse> {
    const data = await this.request('/admin/login', {
      method: 'POST',
      body: credentials,
    });

    if ((data as Record<string, unknown>).token) {
      this.token = (data as Record<string, unknown>).token as string;
      localStorage.setItem('token', this.token);
    }

    return data;
  }

  async facultyLogin(credentials: Record<string, unknown>): Promise<ApiResponse> {
    const data = await this.request('/faculty/login', {
      method: 'POST',
      body: credentials,
    });

    if ((data as Record<string, unknown>).token) {
      this.token = (data as Record<string, unknown>).token as string;
      localStorage.setItem('token', this.token);
    }

    return data;
  }

  async studentLogin(credentials: Record<string, unknown>): Promise<ApiResponse> {
    const data = await this.request('/student/login', {
      method: 'POST',
      body: credentials,
    });

    if ((data as Record<string, unknown>).token) {
      this.token = (data as Record<string, unknown>).token as string;
      localStorage.setItem('token', this.token);
    }

    return data;
  }

  // Generic login (for backward compatibility)
  async login(credentials: Record<string, unknown>): Promise<ApiResponse> {
    // Try admin login first (for existing flow)
    const data = await this.request('/admin/login', {
      method: 'POST',
      body: credentials,
    });

    if ((data as Record<string, unknown>).token) {
      this.token = (data as Record<string, unknown>).token as string;
      localStorage.setItem('token', this.token);
    }

    return data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  // Faculty methods
  async getFacultySubjects(): Promise<ApiResponse> {
    return this.request('/faculty/subjects');
  }

  async getAvailableSubjects(): Promise<ApiResponse> {
    return this.request('/faculty/subjects/available');
  }

  async assignSubjectToFaculty(assignmentData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/faculty/subjects/assign', {
      method: 'POST',
      body: assignmentData,
    });
  }

  async removeSubjectFromFaculty(subjectId: string): Promise<ApiResponse> {
    return this.request(`/faculty/subjects/${subjectId}/remove`, {
      method: 'DELETE',
    });
  }

  async getClassStudents(classCode: string): Promise<ApiResponse> {
    return this.request(`/faculty/classes/${classCode}/students`);
  }

  async uploadBulkMarks(classCode: string, markType: string, marksArray: Array<{ rollNo: string; marks: number }>): Promise<ApiResponse> {
    // Send the whole classCode to the backend and let it parse subject/section
    // robustly. This avoids client-side parsing errors when codes contain '-'.
    return this.request('/faculty/marks/bulk-update', {
      method: 'POST',
      body: {
        classCode,
        markType: markType.toLowerCase().replace(/\s+/g, ''),
        marksArray: marksArray.map(mark => ({
          rollNo: mark.rollNo,
          marks: mark.marks
        }))
      },
    });
  }

  async uploadExcelMarks(classCode: string, markType: string, file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('classCode', classCode);
    formData.append('markType', markType.toLowerCase().replace(/\s+/g, ''));

    return this.request('/faculty/marks/upload-excel', {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for FormData
        ...this.token && { 'Authorization': `Bearer ${this.token}` }
      },
    });
  }

  // Student methods
  async getStudentProfile(): Promise<ApiResponse> {
    return this.request('/students/profile');
  }

  async getStudentMarks(subjectCode: string): Promise<ApiResponse> {
    return this.request(`/students/marks/${subjectCode}`);
  }

  // Admin methods
  async getDepartments(): Promise<Department[]> {
    const data = await this.request('/admin/departments');
    return data as unknown as Department[];
  }

  async getDepartmentById(departmentId: string): Promise<Department> {
    const data = await this.request(`/admin/departments/${departmentId}`);
    return data as unknown as Department;
  }

  async createDepartment(departmentData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/admin/departments', {
      method: 'POST',
      body: departmentData,
    });
  }

  async addSubjectToDepartment(departmentId: string, subjectData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/subjects`, {
      method: 'POST',
      body: subjectData,
    });
  }

  async addFacultyToDepartment(departmentId: string, facultyData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/faculty`, {
      method: 'POST',
      body: facultyData,
    });
  }

  async addClassToDepartment(departmentId: string, classData: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await this.request(`/admin/departments/${departmentId}/classes`, {
        method: 'POST',
        body: classData,
      });
      return response;
    } catch (error: any) {
      console.error('Add class error:', error);
      throw new Error(error.message || 'Failed to add class');
    }
  }

  async createStudentAndAddToClass(departmentId: string, classId: string, studentData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/classes/${classId}/create-student`, {
      method: 'POST',
      body: studentData,
    });
  }

  // Bulk upload methods
  async bulkAddSubjects(departmentId: string, file: File, semester: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('semester', semester);

    return this.request(`/admin/departments/${departmentId}/subjects/bulk`, {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for FormData
        ...this.token && { 'Authorization': `Bearer ${this.token}` }
      },
    });
  }

  async bulkAddFaculty(departmentId: string, file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('excelFile', file);

    return this.request(`/admin/departments/${departmentId}/faculty/bulk`, {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for FormData
        ...this.token && { 'Authorization': `Bearer ${this.token}` }
      },
    });
  }

  async bulkAddStudents(departmentId: string, classId: string, file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('excelFile', file);

    return this.request(`/admin/departments/${departmentId}/classes/${classId}/students/bulk`, {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for FormData
        ...this.token && { 'Authorization': `Bearer ${this.token}` }
      },
    });
  }

  // Delete methods
  async deleteSubject(departmentId: string, subjectId: string): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
  }

  async deleteFaculty(departmentId: string, facultyId: string): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/faculty/${facultyId}`, {
      method: 'DELETE',
    });
  }

  async updateFaculty(departmentId: string, facultyId: string, facultyData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/faculty/${facultyId}`, {
      method: 'PUT',
      body: facultyData,
    });
  }

  async updateSubject(departmentId: string, subjectId: string, subjectData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/subjects/${subjectId}`, {
      method: 'PUT',
      body: subjectData,
    });
  }

  async deleteClass(departmentId: string, classId: string): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/classes/${classId}`, {
      method: 'DELETE',
    });
  }

  async deleteStudent(departmentId: string, classId: string, studentId: string): Promise<ApiResponse> {
    return this.request(`/admin/departments/${departmentId}/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
