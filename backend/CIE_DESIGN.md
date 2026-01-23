# CIE Configuration & Calculation

## Overview

This system separates **CIE rule definition** from **CIE calculation**:

- **Rule Definition** (`CIEConfiguration` + `CIERuleComponent`): Admin-configured rules per department
- **Calculation** (`cieCalculator.ts`): Automatic computation based on student marks

## Models

### 1. `CIEConfiguration`

Stores the **master CIE rule** for a department.

```ts
{
  _id: ObjectId,
  departmentId: ObjectId,
  label: "Default CIE 2025-26",
  maxCIEMarks: 50,
  slipTestsCount: 3,           // total slip tests
  slipTestsConsider: 2,        // best 2 of 3
  attendanceMaxMarks: 5,
  attendanceThresholds: {
    marks5: 85,                // >= 85% → 5 marks
    marks4: 75,                // >= 75% → 4 marks
    marks3: 65                 // >= 65% → 3 marks
  },
  isActive: true
}
```

### 2. `CIERuleComponent`

Maps each **assessment type** to its **weight** in CIE calculation.

```ts
{
  _id: ObjectId,
  cieConfigurationId: ObjectId,
  componentType: "SLIP" | "ASSIGNMENT" | "MIDSEM" | "ATTENDANCE",
  weight: 8.5,    // actual marks for this component
  sequence: 1     // order in calculation
}
```

**Example rule set:**
```
SLIP       → 8.5 marks (best 2 of 3, avg)
ASSIGNMENT → 9.5 marks (average)
MIDSEM     → 25 marks  (average)
ATTENDANCE → 5 marks   (direct input)
---
Total CIE  → 48 marks
```

### 3. Assessment Entry (`StudentAssessment`)

Faculty enters marks directly:

```ts
{
  studentId: ObjectId,
  teachingAssignmentId: ObjectId,
  componentId: ObjectId,         // ref: AssessmentComponent
  marks: 9                        // actual mark (0-maxMarks)
}
```

## Calculation Flow

### Input Data

```
StudentAssessment records for one student + one subject:
- Slip Test 1: 8
- Slip Test 2: 6
- Slip Test 3: 9
- Assignment 1: 9
- Assignment 2: 10
- Midsem: 24
- Attendance: 5 (direct input)
```

### Step 1: Group by Type

```
Slips: [8, 6, 9]
Assignments: [9, 10]
Midsems: [24]
Attendance: 5
```

### Step 2: Apply Rules

**Slip Tests (best 2 of 3):**
```
sorted desc: [9, 8, 6]
best 2: [9, 8]
score: (9 + 8) / 2 = 8.5
```

**Assignments (average):**
```
(9 + 10) / 2 = 9.5
```

**Midsem (average):**
```
24 / 1 = 24
```

**Attendance:**
```
5 (direct input, no calculation)
```

### Step 3: Sum

```
CIE = 8.5 + 9.5 + 24 + 5 = 47 / 50
```

## API Usage

### 1. Get CIE for a Student

```ts
import { calculateStudentCIE } from '@/utils/cieCalculator';

const breakdown = await calculateStudentCIE(studentId, teachingAssignmentId);

// Returns:
{
  slipScore: 8.5,
  assignmentScore: 9.5,
  midsemScore: 24,
  attendanceMarks: 5,
  totalCIE: 47
}
```

### 2. Get Configuration

```ts
import { getCIEConfiguration } from '@/utils/cieCalculator';

const config = await getCIEConfiguration(departmentId);
```

### 3. Seed Default Config

```ts
import { seedDefaultCIEConfiguration } from '@/utils/seeders';

await seedDefaultCIEConfiguration(departmentId);
```

## Key Design Points

✅ **Configurable**: Department can adjust thresholds/weights  
✅ **No Duplication**: Rules stored once, applied to all students  
✅ **Deterministic**: Same marks → same CIE, always  
✅ **Recalculable**: Rerun calc anytime if marks change  
✅ **Scalable**: Easy to add new component types  

## Future Extensions

- Multi-component types (e.g., Lab, Project)
- Weighted average instead of simple average
- Per-subject rule variations
- Elective-specific CIE rules
