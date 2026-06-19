export type TipoTransaccion = 'INGRESO' | 'EGRESO' | 'NOTA_CREDITO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'PAGO_MOVIL' | 'DIVISAS' | 'OTRO';
export type EstadoTransaccion = 'PAGADA' | 'PENDIENTE' | 'PARCIAL' | 'ANULADA';

export interface TransaccionLineaResponse {
  lineaId: number;
  productoId: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  subtotalLinea: number;
}

export interface TransaccionResponse {
  transaccionId: number;
  empresaId: number;
  tipo: string;
  clienteId: number | null;
  clienteNombre: string;
  proveedorId: number | null;
  proveedorNombre: string;
  numeroFactura: string;
  fecha: string;
  moneda: string;
  tasaBcvUsada: number;
  subtotal: number;
  ivaPorcentaje: number;
  ivaMonto: number;
  igtfAplica: boolean;
  igtfMonto: number;
  descuentoGlobalPorcentaje: number;
  descuentoGlobalMonto: number;
  total: number;
  totalUsd: number;
  totalVes: number;
  metodoPago: string;
  estado: string;
  motivoAnulacion: string;
  notas: string;
  lineas: TransaccionLineaResponse[];
  diasTranscurridos: number;
  indicadorVencimiento: string;
  saldoPendiente: number;
  createdAt: string;
}

export interface AgregarLineaRequest {
  descripcion: string;
  productoId?: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
}

export interface CrearTransaccionRequest {
  tipo: TipoTransaccion;
  clienteId?: number;
  proveedorId?: number;
  fecha: string;
  moneda: string;
  metodoPago: MetodoPago;
  descuentoGlobalPorcentaje?: number;
  descuentoGlobalMonto?: number;
  pendiente?: boolean;
  notas?: string;
  lineas: AgregarLineaRequest[];
}

export interface EditarTransaccionRequest {
  fecha?: string;
  metodoPago?: MetodoPago;
  descuentoGlobalPorcentaje?: number;
  descuentoGlobalMonto?: number;
  notas?: string;
}

export interface FiltroTransaccionRequest {
  tipo?: TipoTransaccion;
  estado?: EstadoTransaccion;
  clienteId?: number;
  proveedorId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface RegistrarPagoRequest {
  monto: number;
  fecha: string;
  metodoPago: MetodoPago;
  referencia?: string;
  notas?: string;
}

export interface PagoResponse {
  pagoId: number;
  transaccionId: number;
  monto: number;
  fecha: string;
  metodoPago: string;
  referencia: string;
  notas: string;
  createdAt: string;
}

export interface AdjuntoResponse {
  adjuntoId: number;
  nombreOriginal: string;
  tipoArchivo: string;
  tamanio: number;
  transaccionId: number;
  numeroFactura: string | null;
  createdAt: string;
}
