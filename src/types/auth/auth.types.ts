export interface UserInfo {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
  usuarioId: number;
  empresaId: number;
  nombreCompleto: string;
  rol: string;
  nombreEmpresa: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroEmpresaRequest {
  // Datos de la empresa
  nombreEmpresa: string;
  rif: string;
  correoEmpresa: string;
  planNombre: string; // "SEMILLA" | "EMPRENDEDOR" | "NEGOCIO"

  // Datos del admin
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  emailAdmin: string;
  password: string;
}


export interface DecodedToken {
  usuarioId: number;
  empresaId: number;
  nombre: string;
  rol: string;
  sub: string;   // email
  iat: number;
  exp: number;
}