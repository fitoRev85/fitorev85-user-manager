
export interface Evento {
  id: string;
  propriedadeId: string;
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  tipo: 'feriado' | 'evento_local' | 'congresso' | 'feira' | 'show' | 'esportivo' | 'outro';
  impacto: 'alto' | 'medio' | 'baixo';
  impactoOcupacao: number;
  impactoADR: number;
  recorrente: boolean;
  ativo: boolean;
  cor?: string;
}

export interface Alert {
  id: string;
  eventoId: string;
  tipo: string;
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  data: string;
  visualizado: boolean;
}

export interface AlertaAutomatico {
  id: string;
  tipo: 'evento_proximo' | 'oportunidade_pricing';
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  evento: Evento;
  dias: number;
}
