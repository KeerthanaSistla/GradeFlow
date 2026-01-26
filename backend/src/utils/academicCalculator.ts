/**
 * Calculate academic year and semester based on batch and current date
 * Academic year starts on July 15 each year
 * Semesters: Odd semesters start July 16, Even semesters start January 1
 */

export interface AcademicInfo {
  year: number;
  semester: number;
}

export function calculateAcademicInfo(batchStartYear: number, batchEndYear: number): AcademicInfo {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const currentDay = now.getDate();

  // Academic year starts on July 15
  const academicYearStart = new Date(currentYear, 6, 15); // July 15
  const academicYearEnd = new Date(currentYear + 1, 6, 14); // July 14 next year

  // Determine which academic year we're in
  let academicYear: number;
  if (now >= academicYearStart) {
    academicYear = currentYear;
  } else {
    academicYear = currentYear - 1;
  }

  // Calculate year of study (1-4 for a 4-year program)
  const yearOfStudy = academicYear - batchStartYear + 1;

  // Ensure year of study is within valid range
  if (yearOfStudy < 1 || yearOfStudy > 4) {
    return { year: Math.max(1, Math.min(4, yearOfStudy)), semester: 1 };
  }

  // Determine semester based on current date
  let semester: number;

  if (currentMonth >= 6) { // July or later
    if (currentMonth === 6 && currentDay < 16) { // Before July 16
      // Still in even semester (June 1 - July 15)
      semester = (yearOfStudy - 1) * 2 + 2; // Even semester
    } else { // July 16 or later
      // Odd semester starts (July 16 - Dec 31)
      semester = (yearOfStudy - 1) * 2 + 1; // Odd semester
    }
  } else { // January to June
    // Even semester (Jan 1 - June 30)
    semester = (yearOfStudy - 1) * 2 + 2; // Even semester
  }

  // Ensure semester is within valid range (1-8 for 4-year program)
  semester = Math.max(1, Math.min(8, semester));

  return {
    year: yearOfStudy,
    semester: semester
  };
}

/**
 * Get current academic year string (e.g., "2024-25")
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Academic year starts July 15
  if (currentMonth > 6 || (currentMonth === 6 && currentDay >= 15)) {
    return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  } else {
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  }
}
