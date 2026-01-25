# TODO: Modify Add Section to only have "Section Name"

## Backend Changes
- [ ] Update Section model to remove year and semester fields
- [ ] Update addClassToDepartment controller to not require year and semester
- [ ] Update getDepartmentById to exclude year and semester from classes response

## Frontend Changes
- [ ] Update Class interface to remove year and semester
- [ ] Update newClass state to remove year and semester
- [ ] Update handleAddClass to not send year and semester
- [ ] Update section display to not show year and semester

## Testing
- [ ] Test section creation and display after changes
- [ ] Ensure no other parts of the application are broken
