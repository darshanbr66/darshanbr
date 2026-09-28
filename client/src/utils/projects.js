// Display number for a project in the showcase ("01", "02", …).
export function projectNumber(index) {
  return String(index + 1).padStart(2, '0')
}
