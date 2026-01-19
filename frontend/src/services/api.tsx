const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('token', data.token);
    }

    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Faculty methods
  async getFacultySubjects() {
    return this.request('/faculty/subjects');
  }

  async getAvailableSubjects() {
    return this.request('/faculty/subjects/available');
  }

  async assignSubjectToFaculty(assignmentData) {
    return this.request('/faculty/subjects/assign', {
      method: 'POST',
      body: assignmentData,
    });
  }

  async removeSubjectFromFaculty(subjectId) {
    return this.request(`/faculty/subjects/${subjectId}/remove`, {
      method: 'DELETE',
    });
  }

  async getClassStudents(classCode) {
    return this.request(`/faculty/classes/${classCode}/students`);
  }

  async uploadBulkMarks(classCode, markType, marksArray) {
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

  async uploadExcelMarks(classCode, markType, file) {
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
  async getStudentProfile() {
    return this.request('/students/profile');
  }

  async getStudentMarks(subjectCode) {
    return this.request(`/students/marks/${subjectCode}`);
  }

  // Admin methods
  async getDepartments() {
    return this.request('/admin/departments');
  }

  async createDepartment(departmentData) {
    return this.request('/admin/departments', {
      method: 'POST',
      body: departmentData,
    });
  }

  async addSubjectToDepartment(departmentId, subjectData) {
    return this.request(`/admin/departments/${departmentId}/subjects`, {
      method: 'POST',
      body: subjectData,
    });
  }

  async addFacultyToDepartment(departmentId, facultyData) {
    return this.request(`/admin/departments/${departmentId}/faculty`, {
      method: 'POST',
      body: facultyData,
    });
  }

  async addClassToDepartment(departmentId, classData) {
    return this.request(`/admin/departments/${departmentId}/classes`, {
      method: 'POST',
      body: classData,
    });
  }

  async createStudentAndAddToClass(departmentId, classId, studentData) {
    return this.request(`/admin/departments/${departmentId}/classes/${classId}/create-student`, {
      method: 'POST',
      body: studentData,
    });
  }

  // Bulk upload methods
  async bulkAddSubjects(departmentId, file, semester) {
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

  async bulkAddFaculty(departmentId, file) {
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

  async bulkAddStudents(departmentId, classId, file) {
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
  async deleteSubject(departmentId, subjectId) {
    return this.request(`/admin/departments/${departmentId}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
  }

  async deleteFaculty(departmentId, facultyId) {
    return this.request(`/admin/departments/${departmentId}/faculty/${facultyId}`, {
      method: 'DELETE',
    });
  }

  async deleteStudent(departmentId, classId, studentId) {
    return this.request(`/admin/departments/${departmentId}/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
