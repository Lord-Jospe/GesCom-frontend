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

export interface RegisterFormData {
  // Paso 1 — datos personales
  primerNombre: string;
  primerApellido: string;
  email: string;
  password: string;
  aceptaTerminos: boolean;

  // Paso 2 — empresa
  nombreEmpresa: string;
  rif: string;
  telefono: string;
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

export interface UsuarioPerfilResponse {
    usuarioId:        number;
    primerNombre:     string;
    segundoNombre?:   string;
    primerApellido:   string;
    segundoApellido?: string;
    email:            string;
    rol:              string;
    activo:         boolean;
    createdAt:        string;
}

export interface EmpresaPerfilResponse {
    empresaId:   number;
    nombre:      string;
    rif:         string;
    correo:      string;
    telefono?:   string;
    direccion?:  string;
    actividad?:  string;
    monedaBase:  string;
}

export interface EditarPerfilRequest {
    primerNombre?:   string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    email?:            string;
    password?:       string;
}