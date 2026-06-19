export type TipoCuenta = 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'GASTO';

export interface PlanCuentaResponse {
  cuentaId: number;
  codigo: string;
  nombre: string;
  tipoCuenta: string;
  cuentaPadreId: number | null;
  activo: boolean;
  esPredeterminada: boolean;
}

export interface LineaAsientoResponse {
  lineaId: number;
  cuentaId: number;
  cuentaCodigo: string;
  cuentaNombre: string;
  esDebito: boolean;
  monto: number;
}

export interface AsientoResponse {
  asientoId: number;
  numeroAsiento: number;
  fecha: string;
  descripcion: string;
  transaccionId: number | null;
  esAutomatico: boolean;
  periodoCerrado: boolean;
  totalDebito: number;
  totalCredito: number;
  lineas: LineaAsientoResponse[];
  createdAt: string;
}

export interface LibroMayorResponse {
  cuentaId: number;
  cuentaCodigo: string;
  cuentaNombre: string;
  tipoCuenta: string;
  saldoInicial: number;
  totalDebitos: number;
  totalCreditos: number;
  saldoFinal: number;
  movimientos: LineaAsientoResponse[];
}

export interface BalanceGeneralResponse {
  fecha: string;
  totalActivos: number;
  totalPasivos: number;
  totalPatrimonio: number;
  cuadrado: boolean;
}

export interface EstadoResultadosResponse {
  fechaInicio: string;
  fechaFin: string;
  totalIngresos: number;
  totalGastos: number;
  utilidadNeta: number;
  detalle: { cuentaCodigo: string; cuentaNombre: string; tipo: string; monto: number }[];
}

export interface CrearAsientoRequest {
  fecha: string;
  descripcion: string;
  lineas: { cuentaId: number; esDebito: boolean; monto: number }[];
}
