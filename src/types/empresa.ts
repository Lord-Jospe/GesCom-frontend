export interface TasaBcvResponse {
  tasaId: number;
  tasa: number;
  fecha: string;
  registradoPor: string;
}

export interface TasaBcvRequest {
  tasa: number;
  fecha: string;
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

export interface MonedaRequest {
  moneda: 'USD' | 'VES';
}
