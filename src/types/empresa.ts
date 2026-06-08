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
  tieneInventario: boolean;
  tieneNomina: boolean;
  tieneContabilidad: boolean;
}

export interface MonedaRequest {
  moneda: 'USD' | 'VES';
}
