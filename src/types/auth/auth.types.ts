export interface UserInfo {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  sexo?: string;
  rol: string;
}

export interface DecodedToken {
  usuarioId: number;
  nombre: string;
  rol: string;
  sub: string;
  iat: number;
  exp: number;
}