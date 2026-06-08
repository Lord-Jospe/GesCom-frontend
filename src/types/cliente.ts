export type TipoPersona = 'NATURAL' | 'JURIDICA';

export interface ClienteResponse {
  clienteId: number;
  tipoPersona: string;
  nombre: string;
  rifCedula: string;
  correo: string;
  telefono: string;
  direccion: string;
  isActive: boolean;
  createdAt: string;
}

export interface CrearClienteRequest {
  tipoPersona: TipoPersona;
  nombre: string;
  rifCedula: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export interface EditarClienteRequest {
  tipoPersona?: TipoPersona;
  nombre?: string;
  rifCedula?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
}
