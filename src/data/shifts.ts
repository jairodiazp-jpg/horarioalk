export interface ShiftDefinition {
  code: string;
  start: string;
  end: string;
  type: 'morning' | 'afternoon' | 'intermediate' | 'night' | 'special';
  label: string;
}

export const SHIFTS: ShiftDefinition[] = [
  // Morning (A) shifts
  { code: 'A',   start: '05:30', end: '13:30', type: 'morning', label: 'A' },
  { code: 'A6',  start: '05:30', end: '12:30', type: 'morning', label: 'A6' },
  { code: 'A1',  start: '06:00', end: '14:00', type: 'morning', label: 'A1' },
  { code: 'A7',  start: '06:00', end: '13:00', type: 'morning', label: 'A7' },
  { code: 'A4',  start: '07:00', end: '16:00', type: 'morning', label: 'A4' },
  { code: 'A3',  start: '07:00', end: '15:00', type: 'morning', label: 'A3' },
  { code: 'A2',  start: '08:00', end: '14:00', type: 'morning', label: 'A2' },
  { code: 'A10', start: '07:30', end: '17:30', type: 'morning', label: 'A10' },
  // Intermediate (I) shifts
  { code: 'I9',  start: '07:00', end: '14:00', type: 'intermediate', label: 'I9' },
  { code: 'I',   start: '08:00', end: '17:00', type: 'intermediate', label: 'I' },
  { code: 'I10', start: '08:00', end: '16:00', type: 'intermediate', label: 'I10' },
  { code: 'I16', start: '08:30', end: '17:30', type: 'intermediate', label: 'I16' },
  { code: 'I1',  start: '09:00', end: '18:00', type: 'intermediate', label: 'I1' },
  { code: 'I15', start: '09:00', end: '17:00', type: 'intermediate', label: 'I15' },
  { code: 'I2',  start: '10:00', end: '19:00', type: 'intermediate', label: 'I2' },
  { code: 'I11', start: '10:00', end: '18:00', type: 'intermediate', label: 'I11' },
  { code: 'I3',  start: '11:00', end: '20:00', type: 'intermediate', label: 'I3' },
  { code: 'I26', start: '11:00', end: '19:00', type: 'intermediate', label: 'I26' },
  { code: 'I5',  start: '11:30', end: '20:30', type: 'intermediate', label: 'I5' },
  { code: 'I25', start: '11:30', end: '19:30', type: 'intermediate', label: 'I25' },
  { code: 'I19', start: '12:00', end: '20:00', type: 'intermediate', label: 'I19' },
  { code: 'I4',  start: '12:00', end: '21:00', type: 'intermediate', label: 'I4' },
  // Afternoon (C) shifts
  { code: 'C',   start: '13:00', end: '21:00', type: 'afternoon', label: 'C' },
  { code: 'C6',  start: '13:00', end: '20:00', type: 'afternoon', label: 'C6' },
  { code: 'C1',  start: '13:30', end: '21:30', type: 'afternoon', label: 'C1' },
  { code: 'C7',  start: '13:30', end: '20:30', type: 'afternoon', label: 'C7' },
  { code: 'C2',  start: '14:00', end: '22:00', type: 'afternoon', label: 'C2' },
  { code: 'C8',  start: '14:00', end: '21:00', type: 'afternoon', label: 'C8' },
  { code: 'C5',  start: '14:00', end: '20:00', type: 'afternoon', label: 'C5' },
  { code: 'C3',  start: '14:30', end: '22:30', type: 'afternoon', label: 'C3' },
  { code: 'C9',  start: '14:30', end: '21:30', type: 'afternoon', label: 'C9' },
  { code: 'C4',  start: '15:00', end: '23:00', type: 'afternoon', label: 'C4' },
  { code: 'C10', start: '15:00', end: '22:00', type: 'afternoon', label: 'C10' },
  // Night (N) shifts
  { code: 'N',   start: '19:00', end: '04:00', type: 'night', label: 'N' },
  { code: 'N14', start: '20:00', end: '04:00', type: 'night', label: 'N14' },
  { code: 'N11', start: '20:00', end: '05:00', type: 'night', label: 'N11' },
  { code: 'N1',  start: '21:00', end: '06:00', type: 'night', label: 'N1' },
  { code: 'N10', start: '21:30', end: '06:00', type: 'night', label: 'N10' },
  { code: 'N12', start: '22:00', end: '05:30', type: 'night', label: 'N12' },
  { code: 'N3',  start: '22:00', end: '07:00', type: 'night', label: 'N3' },
  // Special
  { code: 'COMP',  start: '', end: '', type: 'special', label: 'COMPENSATORIO' },
  { code: 'LIBRE', start: '', end: '', type: 'special', label: 'LIBRE DOMINGO' },
  { code: 'LIC',   start: '', end: '', type: 'special', label: 'LICENCIA' },
  { code: 'VC',    start: '', end: '', type: 'special', label: 'VACACIONES' },
  { code: 'DF',    start: '', end: '', type: 'special', label: 'DÍA DE LA FAMILIA' },
  { code: 'ALT',   start: '', end: '', type: 'special', label: 'ALTERNADO' },
];

export const SHIFT_MAP = new Map(SHIFTS.map(s => [s.code, s]));

export function getShiftClass(code: string): string {
  if (!code) return '';
  const upper = code.toUpperCase();
  if (upper === 'LIBRE') return 'shift-LIBRE';
  if (upper === 'COMP') return 'shift-COMP';
  if (upper === 'LIC') return 'shift-LIC';
  if (upper === 'VC') return 'shift-VC';
  if (upper === 'DF' || upper === 'ALT') return 'shift-DF';
  if (upper.startsWith('A')) return 'shift-A';
  if (upper.startsWith('C')) return 'shift-C';
  if (upper.startsWith('I') || upper === 'I') return 'shift-I';
  if (upper.startsWith('N')) return 'shift-N';
  return '';
}

export const MORNING_SHIFTS = ['A', 'A1', 'A2', 'A3', 'A4', 'A6', 'A7', 'A10'];
export const AFTERNOON_SHIFTS = ['C', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];
export const INTERMEDIATE_SHIFTS = ['I', 'I1', 'I2', 'I3', 'I4', 'I5', 'I9', 'I10', 'I11', 'I15', 'I16', 'I19', 'I25', 'I26'];
export const NIGHT_SHIFTS = ['N', 'N1', 'N3', 'N10', 'N11', 'N12', 'N14'];
export const ALL_SHIFT_CODES = [
  ...MORNING_SHIFTS,
  ...INTERMEDIATE_SHIFTS,
  ...AFTERNOON_SHIFTS,
  ...NIGHT_SHIFTS,
  'LIBRE', 'COMP', 'LIC', 'VC', 'DF',
];
