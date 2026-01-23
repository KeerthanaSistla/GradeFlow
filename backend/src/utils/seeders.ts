import CIEConfiguration from '../models/CIEConfiguration';
import AssessmentComponent from '../models/AssessmentComponent';
import CIERuleComponent from '../models/CIERuleComponent';

/**
 * Seed default assessment components for a department
 * Should run once per department during setup
 */
export async function seedDefaultAssessmentComponents(departmentId: string) {
  const components = [
    { name: 'Slip Test 1', type: 'SLIP', maxMarks: 10, sequence: 1 },
    { name: 'Slip Test 2', type: 'SLIP', maxMarks: 10, sequence: 2 },
    { name: 'Slip Test 3', type: 'SLIP', maxMarks: 10, sequence: 3 },
    { name: 'Assignment 1', type: 'ASSIGNMENT', maxMarks: 10, sequence: 1 },
    { name: 'Assignment 2', type: 'ASSIGNMENT', maxMarks: 10, sequence: 2 },
    { name: 'Midsem Exam', type: 'MIDSEM', maxMarks: 50, sequence: 1 },
    { name: 'Attendance', type: 'SLIP', maxMarks: 5, sequence: 0 } // placeholder for attendance
  ];

  for (const comp of components) {
    const exists = await AssessmentComponent.findOne({
      departmentId,
      name: comp.name
    });

    if (!exists) {
      await AssessmentComponent.create({
        ...comp,
        departmentId,
        weightGroup: comp.type
      });
    }
  }

  console.log(`Seeded assessment components for department ${departmentId}`);
}

/**
 * Seed default CIE configuration and rules for a department
 */
export async function seedDefaultCIEConfiguration(departmentId: string) {
  // Create config
  const existingConfig = await CIEConfiguration.findOne({
    departmentId,
    isActive: true
  });

  if (existingConfig) {
    console.log(`CIE configuration already exists for department ${departmentId}`);
    return;
  }

  const config = await CIEConfiguration.create({
    departmentId,
    label: 'Default CIE 2025-26',
    maxCIEMarks: 50,
    slipTestsCount: 3,
    slipTestsConsider: 2,
    attendanceMaxMarks: 5,
    attendanceThresholds: {
      marks5: 85,
      marks4: 75,
      marks3: 65
    },
    isActive: true
  });

  // Create rule components
  await CIERuleComponent.create([
    { cieConfigurationId: config._id, componentType: 'SLIP', weight: 8.5, sequence: 1 },
    { cieConfigurationId: config._id, componentType: 'ASSIGNMENT', weight: 9.5, sequence: 2 },
    { cieConfigurationId: config._id, componentType: 'MIDSEM', weight: 25, sequence: 3 },
    { cieConfigurationId: config._id, componentType: 'ATTENDANCE', weight: 5, sequence: 4 }
  ]);

  console.log(`Seeded CIE configuration for department ${departmentId}`);
}
