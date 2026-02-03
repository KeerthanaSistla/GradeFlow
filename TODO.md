# TODO: Fix Department Card Counts

## Current Issue
- Department cards in AdminDashboard show 0 for Faculty, Subjects, and Classes
- Backend `getDepartments` function doesn't populate related data
- Frontend expects populated arrays for counting

## Tasks
- [x] Update `getDepartments` function in `backend/src/controllers/adminController.ts` to populate faculty, subjects, and classes
- [ ] Test that counts update correctly in AdminDashboard
- [ ] Verify counts match department details page

## Files to Edit
- `backend/src/controllers/adminController.ts`
