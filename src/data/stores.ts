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
  { id: 'ktmos',  name: 'KTMOS}',  password: 'KTMOS}' },
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

const SAMPLE_MORNING = ['LIBRE', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1'];
const SAMPLE_AFTERNOON = ['LIBRE', 'C1', 'C1', 'C1', 'C1', 'C1', 'C1'];
const SAMPLE_NIGHT = ['LIBRE', 'N10', 'N10', 'N10', 'N10', 'N10', 'N10'];

export function generateDefaultSchedule(employees: Employee[], year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const schedule: Record<string, Record<number, string>> = {};

  employees.forEach((emp, idx) => {
    schedule[emp.id] = {};
    const isNight = idx >= 38;
    const isAfternoon = !isNight && idx >= 18;
    const baseMorning = SAMPLE_MORNING;
    const baseAfternoon = SAMPLE_AFTERNOON;
    const baseNight = SAMPLE_NIGHT;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dow = date.getDay(); // 0=Sun, 1=Mon...6=Sat
      let base: string[];
      if (isNight) base = baseNight;
      else if (isAfternoon) base = baseAfternoon;
      else base = baseMorning;

      // Assign LIBRE on weekdays, rotating per employee
      const libreDay = ((idx % 5) + 1); // 1=Mon...5=Fri
      if (dow === libreDay) {
        schedule[emp.id][day] = 'LIBRE';
      } else if (dow === 0 && isNight) {
        schedule[emp.id][day] = 'LIBRE';
      } else {
        const shift = base[day % base.length] !== 'LIBRE' ? base[day % base.length] : (isNight ? 'N10' : isAfternoon ? 'C1' : 'A1');
        schedule[emp.id][day] = shift;
      }
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
