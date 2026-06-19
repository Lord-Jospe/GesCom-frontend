export interface TasaBcvResponse {
  tasaId: number;
  tasa: number;
  fechaHora: string;
  registradoPor: string;
}

export interface TasaBcvRequest {
  tasa: number;
  fechaHora: string;
}

export interface EmpresaResponse {
  empresaId: number;
  nombre: string;
  rif: string;
  correo: string;
  telefono: string;
  direccion: string;
  logoUrl: string;
  actividad: string;
  monedaBase: string;
  isActive: boolean;
  ivaActivo: boolean;
  ivaPorcentaje: number;
  igtfActivo: boolean;
  facturaPrefijo: string;
  facturaSiguienteNumero: number;
  ssoPorcentaje?: number;
  incesPorcentaje?: number;
  faovPorcentaje?: number;
  stockMinimoDefault?: number;
  createdAt: string;
}

export interface EditarEmpresaRequest {
  nombre?: string;
  rif?: string;
  direccion?: string;
  telefono?: string;
  actividad?: string;
  logoUrl?: string;
  correo?: string;
  ivaActivo?: boolean;
  ivaPorcentaje?: number;
  igtfActivo?: boolean;
  facturaPrefijo?: string;
  facturaSiguienteNumero?: number;
}

export interface SuscripcionResponse {
  suscripcionId: number;
  planNombre: string;
  precioUsd: number;
  fechaInicio: string;
  fechaVence: string;
  estado: string;
  maxTransaccionesMes: number;
  maxArchivosMes: number;
  maxUsuarios: number | null;
  tieneInventario: boolean;
  tieneNomina: boolean;
  tieneContabilidad: boolean;
}

export interface DashboardResumenResponse {
  ventas: number;
  gastos: number;
  ganancia: number;
  transacciones: number;
  moneda: string;
}

export interface DashboardChartsResponse {
  ventas30Dias: { fecha: string; monto: number }[];
  ingresosVsGastos6Meses: { mes: string; ingresos: number; gastos: number }[];
  categorias: { categoria: string; monto: number; porcentaje: number }[];
  porCobrar: number;
  porPagar: number;
  productosCriticos: number;
  monedaBase: string;
  tasaBcvActual: number;
}

export interface MonedaRequest {
  moneda: 'USD' | 'VES';
}
