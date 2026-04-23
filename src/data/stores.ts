export type Department = 'Mercado' | 'Hogar' | 'Electro' | 'Caja';

export const DEPARTMENTS: Department[] = ['Mercado', 'Hogar', 'Electro', 'Caja'];

export interface Employee {
  id: string;
  codigo: string;
  nombre: string;
  actividad: string;
  departamento: Department;
}

export interface Store {
  id: string;
  name: string;
  password: string;
}

export const STORES: Store[] = [
  { id: 'demo',   name: 'DEMO',    password: 'leonidas' },
  { id: 'akede',  name: 'AKEDE',   password: 'AKEDE' },
  { id: 'akb68',  name: 'AKB68',   password: 'AKB69' },
  { id: 'akven',  name: 'AKVEN',   password: 'AKVEN' },
  { id: 'ak170',  name: 'AK170',   password: 'AK171' },
  { id: 'akb30',  name: 'AKB30',   password: 'AKB31' },
  { id: 'akmos',  name: 'AKMOS',   password: 'AKMOS' },
  { id: 'akcal',  name: 'AKCAL',   password: 'AKCAL' },
  { id: 'akcan',  name: 'AKCAN',   password: 'AKCAN' },
  { id: 'akbar',  name: 'AKBAR',   password: 'AKBAR' },
  { id: 'akper',  name: 'AKPER',   password: 'AKPER' },
  { id: 'akvil',  name: 'AKVIL',   password: 'AKVIL' },
  { id: 'akyop',  name: 'AKYOP',   password: 'AKYOP' },
  { id: 'aksin',  name: 'AKSIN',   password: 'AKSIN' },
  { id: 'akflo',  name: 'AKFLO',   password: 'AKFLO' },
  { id: 'ktsal',  name: 'KTSAL',   password: 'KTSAL' },
  { id: 'ktsoa',  name: 'KTSOA',   password: 'KTSOA' },
  { id: 'ktuno',  name: 'KTUNO',   password: 'KTUNO' },
  { id: 'kttit',  name: 'KTTIT',   password: 'KTTIT' },
  { id: 'ktame',  name: 'KTAME',   password: 'KTAME' },
  { id: 'ktb94',  name: 'KTB94',   password: 'KTB95' },
  { id: 'ktmay',  name: 'KTMAY',   password: 'KTMAY' },
  { id: 'ktsba',  name: 'KTSBA',   password: 'KTSBA' },
  { id: 'ktchi',  name: 'KTCHI',   password: 'KTCHI' },
  { id: 'ktmos',  name: 'KTMOS',   password: 'KTMOS' },
  { id: 'ktnqs',  name: 'KTNQS',   password: 'KTNQS' },
  { id: 'ktvil',  name: 'KTVIL',   password: 'KTVIL' },
  { id: 'ktcal',  name: 'KTCAL',   password: 'KTCAL' },
  { id: 'ktbar',  name: 'KTBAR',   password: 'KTBAR' },
  { id: 'ktpob',  name: 'KTPOB',   password: 'KTPOB' },
  { id: 'kttes',  name: 'KTTES',   password: 'KTTES' },
  { id: 'ktark',  name: 'KTARK',   password: 'KTARK' },
  { id: 'ktman',  name: 'KTMAN',   password: 'KTMAN' },
  { id: 'ktbuc',  name: 'KTBUC',   password: 'KTBUC' },
  { id: 'ktfus',  name: 'KTFUS',   password: 'KTFUS' },
  { id: 'ktjul',  name: 'KTJUL',   password: 'KTJUL' },
  { id: 'kttun',  name: 'KTTUN',   password: 'KTTUN' },
  { id: 'ktgir',  name: 'KTGIR',   password: 'KTGIR' },
];

function makeEmployees(storeName: string, dept: Department, offset: number): Employee[] {
  const activities: Record<Department, string[]> = {
    Mercado: [
      'AUXILIAR LÍNEA DE MERCADO/FRUTAS Y VERDURAS',
      'AUXILIAR LÍNEA DE MERCADO/LÁCTEOS',
      'AUXILIAR LÍNEA DE MERCADO/CARNES',
      'AUXILIAR LÍNEA DE MERCADO/PANADERÍA',
      'AUXILIAR LÍNEA DE MERCADO/ABARROTES',
    ],
    Hogar: [
      'AUXILIAR LÍNEA DE HOGAR/MUEBLES',
      'AUXILIAR LÍNEA DE HOGAR/TEXTILES',
      'AUXILIAR LÍNEA DE HOGAR/COCINA',
      'AUXILIAR LÍNEA DE HOGAR/DECORACIÓN',
      'AUXILIAR LÍNEA DE HOGAR/JARDÍN',
    ],
    Electro: [
      'AUXILIAR LÍNEA DE ELECTRODOMÉSTICOS/AUDIO',
      'AUXILIAR LÍNEA DE ELECTRODOMÉSTICOS/VIDEO',
      'AUXILIAR LÍNEA DE ELECTRODOMÉSTICOS/MENORES',
      'AUXILIAR LÍNEA DE ELECTRODOMÉSTICOS/GRANDES',
      'AUXILIAR LÍNEA DE ELECTRODOMÉSTICOS/INFORMÁTICA',
    ],
    Caja: [
      'CAJERO/CAJA RÁPIDA',
      'CAJERO/CAJA NORMAL',
      'CAJERO/SERVICIO AL CLIENTE',
      'CAJERO/DEVOLUCIONES',
      'CAJERO/COORDINADOR',
    ],
  };

  const firstNames = ['CARLOS', 'MARÍA', 'JUAN', 'ANA', 'PEDRO', 'LUISA', 'ANDRÉS', 'PAULA', 'DIEGO', 'CLAUDIA',
    'SERGIO', 'NATALIA', 'MIGUEL', 'DANIELA', 'JORGE', 'VALENTINA', 'ALEJANDRO', 'CAROLINA', 'DAVID', 'PAOLA',
    'FELIPE', 'LAURA', 'EDGAR', 'VIVIANA', 'ROBERT', 'ADRIANA', 'CRISTIAN', 'MARCELA', 'HERNÁN', 'GLORIA',
    'IVAN', 'ALEJANDRA', 'JAIRO', 'SANDRA', 'FREDY', 'YULI', 'HAROLD', 'DIANA', 'CAMILO', 'JOHANA'];
  const lastNames = ['GARCÍA', 'RODRÍGUEZ', 'MARTÍNEZ', 'LÓPEZ', 'HERNÁNDEZ', 'GONZÁLES', 'PÉREZ', 'SÁNCHEZ',
    'RAMÍREZ', 'TORRES', 'FLORES', 'RIVERA', 'GÓMEZ', 'DÍAZ', 'REYES', 'MORALES', 'JIMÉNEZ', 'VARGAS',
    'CASTILLO', 'ROMERO', 'ORTIZ', 'SILVA', 'HERRERA', 'MEDINA', 'AGUILAR', 'GUZMÁN', 'ROJAS', 'CASTRO',
    'RUIZ', 'MUÑOZ', 'ALVARADO', 'MENDOZA', 'GUERRERO', 'FUENTES', 'RAMOS', 'VEGA', 'MONTES', 'SUÁREZ',
    'RÍOS', 'CANO'];

  return Array.from({ length: 40 }, (_, i) => ({
    id: `${storeName}-${dept}-${i + offset}`,
    codigo: `${38000000 + offset * 100 + i}`,
    nombre: `${firstNames[i % firstNames.length]} ${lastNames[(i + offset) % lastNames.length]}`,
    actividad: activities[dept][i % activities[dept].length],
    departamento: dept,
  }));
}

const MORNING_CODES = ['A1', 'A', 'A3', 'A4', 'A6', 'A7', 'A2', 'A10'];
const AFTERNOON_CODES = ['C1', 'C', 'C2', 'C3', 'I', 'I1', 'I2', 'I3', 'I4', 'C5', 'C6', 'C7', 'C8'];
const NIGHT_CODES = ['N10', 'N1', 'N', 'N14'];

export function generateDefaultSchedule(employees: Employee[], year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const schedule: Record<string, Record<number, string>> = {};
  const totalEmps = employees.length;
  if (totalEmps === 0) return schedule;

  // Reserve 2 employees for night shift (last 2), rest split morning/afternoon
  const nightCount = Math.min(2, totalEmps);
  const dayEmployees = employees.slice(0, totalEmps - nightCount);
  const nightEmployees = employees.slice(totalEmps - nightCount);

  // Split day employees into two groups for weekly rotation
  const halfPoint = Math.ceil(dayEmployees.length / 2);
  const groupA = dayEmployees.slice(0, halfPoint);   // Even weeks = morning
  const groupB = dayEmployees.slice(halfPoint);       // Even weeks = afternoon

  // First day info for week calculation
  const firstDate = new Date(year, month - 1, 1);
  const firstDow = firstDate.getDay(); // 0=Sun..6=Sat

  // Distribute LIBRE days (Mon=1..Fri=5) across employees so no day is overloaded
  // Each employee gets a fixed LIBRE weekday that rotates across weeks
  const assignLibreDay = (empIdx: number, weekNum: number): number => {
    // Rotate: each employee shifts their libre day each week for equity
    return ((empIdx + weekNum) % 5) + 1; // 1=Mon..5=Fri
  };

  // --- Day employees ---
  dayEmployees.forEach((emp, idx) => {
    schedule[emp.id] = {};
    const isGroupA = idx < halfPoint;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dow = date.getDay();
      const weekNum = Math.floor((day + (firstDow === 0 ? 6 : firstDow - 1) - 1) / 7);

      // LIBRE: one day Mon-Fri per week, distributed
      const libreWeekday = assignLibreDay(idx, weekNum);
      if (dow === libreWeekday) {
        schedule[emp.id][day] = 'LIBRE';
        continue;
      }

      // Sunday: some work, some rest based on rotation
      if (dow === 0) {
        // Every other Sunday off for equity
        if ((weekNum + idx) % 3 === 0) {
          schedule[emp.id][day] = 'LIBRE';
          continue;
        }
      }

      // Weekly rotation: morning <-> afternoon
      const isMorningWeek = (weekNum % 2 === 0) ? isGroupA : !isGroupA;

      if (isMorningWeek) {
        schedule[emp.id][day] = MORNING_CODES[idx % MORNING_CODES.length];
      } else {
        schedule[emp.id][day] = AFTERNOON_CODES[idx % AFTERNOON_CODES.length];
      }
    }
  });

  // --- Night employees ---
  nightEmployees.forEach((emp, idx) => {
    schedule[emp.id] = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dow = date.getDay();
      const weekNum = Math.floor((day + (firstDow === 0 ? 6 : firstDow - 1) - 1) / 7);

      // LIBRE: one day Mon-Fri per week
      const libreWeekday = assignLibreDay(dayEmployees.length + idx, weekNum);
      if (dow === libreWeekday) {
        schedule[emp.id][day] = 'LIBRE';
        continue;
      }

      // Sundays off for night workers
      if (dow === 0) {
        schedule[emp.id][day] = 'LIBRE';
        continue;
      }

      schedule[emp.id][day] = NIGHT_CODES[idx % NIGHT_CODES.length];
    }
  });

  return schedule;
}

export function buildStoreData(storeId: string) {
  const data: Record<Department, Employee[]> = {
    Mercado: makeEmployees(storeId, 'Mercado', 0),
    Hogar:   makeEmployees(storeId, 'Hogar',   40),
    Electro: makeEmployees(storeId, 'Electro', 80),
    Caja:    makeEmployees(storeId, 'Caja',    120),
  };
  return data;
}
