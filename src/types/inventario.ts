export type UnidadMedida = 'UNIDAD' | 'KG' | 'GR' | 'LITRO' | 'ML' | 'GALON' | 'METRO' | 'CM' | 'CAJA' | 'PAR' | 'DOCENA';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'MERMA';

export interface ProductoResponse {
  productoId: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  costoUnitario: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  ventaBajoPedido: boolean;
  alertaStock: string | null;  // ROJO, AMARILLO, null
  valorTotal: number;
  activo: boolean;
  createdAt: string;
}

export interface CrearProductoRequest {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidadMedida: UnidadMedida;
  costoUnitario?: number;
  precioVenta?: number;
  stockInicial?: number;
  stockMinimo?: number;
  ventaBajoPedido?: boolean;
}

export interface EditarProductoRequest {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  unidadMedida?: UnidadMedida;
  costoUnitario?: number;
  precioVenta?: number;
  stockMinimo?: number;
  ventaBajoPedido?: boolean;
}

export interface MovimientoInventarioResponse {
  movimientoId: number;
  productoId: number;
  productoNombre: string;
  tipo: string;
  cantidad: number;
  costoUnitario: number | null;
  motivo: string;
  transaccionId: number | null;
  registradoPor: string | null;
  createdAt: string;
}

export interface RegistrarMovimientoRequest {
  productoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  costoUnitario?: number;
  motivo?: string;
}
