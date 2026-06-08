export type NombreRol = 'ADMIN' | 'CONTADOR' | 'OPERADOR';

export interface UsuarioResponse {
  usuarioId: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  rol: NombreRol;
  activo: boolean;
  sueldo: number | null;
  monedaSueldo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearUsuarioRequest {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  password: string;
  rol: string;
  sueldo?: number;
  monedaSueldo?: string;
}

export interface EditarUsuarioRequest {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  password?: string;
  email?: string;
  rol?: string;
  sueldo?: number;
  monedaSueldo?: string;
}

export interface UsuarioPageResponse {
    contenido: UsuarioResponse[];
    paginaActual: number;
    totalPaginas: number;
    totalElementos: number;
    tamano: number;
    esUltima: boolean;
}

export interface UsuarioFiltroParams {
    pagina?: number;
    tamano?: number;
    rolId?: number;
    busqueda?: string;
    soloActivos?: boolean;
}

