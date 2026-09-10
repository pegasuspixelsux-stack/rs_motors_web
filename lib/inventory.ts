/**
 * Mock inventory.
 *
 * This is the single seam for a live backend. Everything the UI needs comes
 * through `getInventory()` / `getCategories()`; swap their bodies for a
 * Supabase query (or any fetch) and nothing else in the app has to change.
 *
 *   export async function getInventory(): Promise<Vehicle[]> {
 *     const { data } = await supabase.from("vehicles").select("*").order("ingreso", { ascending: false });
 *     return data ?? [];
 *   }
 *
 * Photos are illustrative stock images — see public/images/vehicles/SOURCES.md.
 */

export type VehicleStatus = "disponible" | "recien-ingresado" | "reservado";

export type VehicleCategory = "Hatchback" | "Sedán" | "SUV" | "Utilitario";

export interface Vehicle {
  id: string;
  slug: string;
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  km: number;
  precioUSD: number;
  combustible: "Nafta" | "Diésel" | "Híbrido";
  transmision: "Manual" | "Automática";
  categoria: VehicleCategory;
  puertas: number;
  status: VehicleStatus;
  ingreso: string; // ISO date — newest first
  ubicacion: string;
  inspeccionado: boolean;
  imagen: string;
  destacado?: boolean;
}

export const STATUS_LABEL: Record<VehicleStatus, string> = {
  disponible: "Disponible",
  "recien-ingresado": "Recién ingresado",
  reservado: "Reservado",
};

const INVENTORY: Vehicle[] = [
  {
    id: "RS-051",
    slug: "vw-gol-trend-2016",
    marca: "Volkswagen",
    modelo: "Gol Trend",
    version: "1.6 MSI",
    anio: 2016,
    km: 78500,
    precioUSD: 12900,
    combustible: "Nafta",
    transmision: "Manual",
    categoria: "Hatchback",
    puertas: 5,
    status: "disponible",
    ingreso: "2024-07-12",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-1.jpg",
  },
  {
    id: "RS-052",
    slug: "chevrolet-onix-lt-2019",
    marca: "Chevrolet",
    modelo: "Onix",
    version: "1.4 LT",
    anio: 2019,
    km: 54200,
    precioUSD: 15400,
    combustible: "Nafta",
    transmision: "Manual",
    categoria: "Hatchback",
    puertas: 5,
    status: "disponible",
    ingreso: "2024-07-20",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-1.jpg",
  },
  {
    id: "RS-053",
    slug: "fiat-cronos-drive-2021",
    marca: "Fiat",
    modelo: "Cronos",
    version: "1.3 Drive",
    anio: 2021,
    km: 31900,
    precioUSD: 16800,
    combustible: "Nafta",
    transmision: "Manual",
    categoria: "Sedán",
    puertas: 4,
    status: "disponible",
    ingreso: "2024-07-25",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-2.jpg",
  },
  {
    id: "RS-054",
    slug: "vw-vento-comfortline-2015",
    marca: "Volkswagen",
    modelo: "Vento",
    version: "2.0 Comfortline",
    anio: 2015,
    km: 96700,
    precioUSD: 14200,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "Sedán",
    puertas: 4,
    status: "disponible",
    ingreso: "2024-06-28",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-2.jpg",
  },
  {
    id: "RS-055",
    slug: "peugeot-208-active-2018",
    marca: "Peugeot",
    modelo: "208",
    version: "1.6 Active",
    anio: 2018,
    km: 62300,
    precioUSD: 13700,
    combustible: "Nafta",
    transmision: "Manual",
    categoria: "Hatchback",
    puertas: 5,
    status: "disponible",
    ingreso: "2024-08-05",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-16.jpg",
  },
  {
    id: "RS-056",
    slug: "renault-sandero-life-2020",
    marca: "Renault",
    modelo: "Sandero",
    version: "1.6 Life",
    anio: 2020,
    km: 40100,
    precioUSD: 13200,
    combustible: "Nafta",
    transmision: "Manual",
    categoria: "Hatchback",
    puertas: 5,
    status: "recien-ingresado",
    ingreso: "2024-09-02",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-1.jpg",
  },
  {
    id: "RS-057",
    slug: "toyota-corolla-xei-2019",
    marca: "Toyota",
    modelo: "Corolla",
    version: "2.0 XEI",
    anio: 2019,
    km: 58900,
    precioUSD: 24900,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "Sedán",
    puertas: 4,
    status: "disponible",
    ingreso: "2024-07-30",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-15.jpg",
    destacado: true,
  },
  {
    id: "RS-058",
    slug: "hyundai-creta-gl-2020",
    marca: "Hyundai",
    modelo: "Creta",
    version: "1.6 GL",
    anio: 2020,
    km: 47600,
    precioUSD: 22400,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "SUV",
    puertas: 5,
    status: "recien-ingresado",
    ingreso: "2024-09-05",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-5.jpg",
    destacado: true,
  },
  {
    id: "RS-059",
    slug: "chevrolet-tracker-premier-2021",
    marca: "Chevrolet",
    modelo: "Tracker",
    version: "1.2T Premier",
    anio: 2021,
    km: 35400,
    precioUSD: 25800,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "SUV",
    puertas: 5,
    status: "disponible",
    ingreso: "2024-08-18",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-5.jpg",
  },
  {
    id: "RS-060",
    slug: "ford-ecosport-se-2017",
    marca: "Ford",
    modelo: "EcoSport",
    version: "1.5 SE",
    anio: 2017,
    km: 89200,
    precioUSD: 15900,
    combustible: "Nafta",
    transmision: "Manual",
    categoria: "SUV",
    puertas: 5,
    status: "disponible",
    ingreso: "2024-06-15",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-5.jpg",
  },
  {
    id: "RS-061",
    slug: "honda-civic-exl-2016",
    marca: "Honda",
    modelo: "Civic",
    version: "1.8 EXL",
    anio: 2016,
    km: 84300,
    precioUSD: 17600,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "Sedán",
    puertas: 4,
    status: "disponible",
    ingreso: "2024-07-08",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-2.jpg",
  },
  {
    id: "RS-062",
    slug: "chevrolet-cruze-lt-2020",
    marca: "Chevrolet",
    modelo: "Cruze",
    version: "1.4T LT",
    anio: 2020,
    km: 44800,
    precioUSD: 20900,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "Sedán",
    puertas: 4,
    status: "recien-ingresado",
    ingreso: "2024-09-04",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-17.jpg",
  },
  {
    id: "RS-063",
    slug: "vw-golf-gti-2017",
    marca: "Volkswagen",
    modelo: "Golf GTI",
    version: "2.0 TSI",
    anio: 2017,
    km: 71500,
    precioUSD: 23400,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "Hatchback",
    puertas: 5,
    status: "recien-ingresado",
    ingreso: "2024-09-07",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-16.jpg",
    destacado: true,
  },
  {
    id: "RS-064",
    slug: "nissan-sentra-advance-2018",
    marca: "Nissan",
    modelo: "Sentra",
    version: "2.0 Advance",
    anio: 2018,
    km: 67400,
    precioUSD: 16300,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "Sedán",
    puertas: 4,
    status: "disponible",
    ingreso: "2024-07-02",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-12.jpg",
  },
  {
    id: "RS-065",
    slug: "ford-focus-se-2015",
    marca: "Ford",
    modelo: "Focus",
    version: "2.0 SE",
    anio: 2015,
    km: 101300,
    precioUSD: 12400,
    combustible: "Nafta",
    transmision: "Automática",
    categoria: "Hatchback",
    puertas: 5,
    status: "disponible",
    ingreso: "2024-06-10",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-15.jpg",
  },
  {
    id: "RS-066",
    slug: "toyota-hilux-sr-2018",
    marca: "Toyota",
    modelo: "Hilux",
    version: "2.4 TDI SR",
    anio: 2018,
    km: 112700,
    precioUSD: 31500,
    combustible: "Diésel",
    transmision: "Manual",
    categoria: "Utilitario",
    puertas: 4,
    status: "disponible",
    ingreso: "2024-06-02",
    ubicacion: "Maldonado",
    inspeccionado: true,
    imagen: "/images/vehicles/car-5.jpg",
  },
];

export const CATEGORY_ORDER: VehicleCategory[] = [
  "Hatchback",
  "Sedán",
  "SUV",
  "Utilitario",
];

/** Swap this for a DB/API call. Sorted newest-in first. */
export function getInventory(): Vehicle[] {
  return [...INVENTORY].sort((a, b) => b.ingreso.localeCompare(a.ingreso));
}

export function getCategories(): { value: VehicleCategory | "todos"; label: string }[] {
  return [
    { value: "todos", label: "Todos" },
    ...CATEGORY_ORDER.map((c) => ({ value: c, label: c })),
  ];
}
