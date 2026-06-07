export type CategoriaProveedor = 'MERCANCIA' | 'SERVICIOS' | 'TRANSPORTE' | 'OTROS';

export interface ProveedorResponse {
  proveedorId: number;
  nombre: string;
  rif: string;
  email: string;
  telefono: string;
  categoria: string;
  isActive: boolean;
  createdAt: string;
}

export interface CrearProveedorRequest {
  nombre: string;
  rif: string;
  email: string;
  telefono: string;
  categoria: CategoriaProveedor;
}

export interface EditarProveedorRequest {
  nombre?: string;
  rif?: string;
  email?: string;
  telefono?: string;
  categoria?: CategoriaProveedor;
}
