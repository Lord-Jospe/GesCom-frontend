export interface ConceptoNominaResponse {
  conceptoId: number;
  tipo: string;
  descripcion: string;
  monto: number;
}

export interface NominaResponse {
  nominaId: number;
  usuarioId: number;
  nombreEmpleado: string;
  periodoInicio: string;
  periodoFin: string;
  salarioBase: number;
  totalAsignaciones: number;
  totalDeducciones: number;
  salarioNeto: number;
  estado: string;
  notas: string;
  conceptos: ConceptoNominaResponse[];
  createdAt: string;
}

export interface ConceptoExtraRequest {
  tipo: 'ASIGNACION' | 'DEDUCCION';
  descripcion: string;
  monto: number;
}

export interface CalcularNominaRequest {
  usuarioId: number;
  periodoInicio: string;
  periodoFin: string;
  extras?: ConceptoExtraRequest[];
  notas?: string;
}
