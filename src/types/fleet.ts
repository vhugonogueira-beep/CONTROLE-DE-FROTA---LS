export interface FleetRecord {
  id: string;
  veiculo: string;
  dataInicial: string;
  horarioInicial: string;
  dataFinal: string;
  horarioFinal: string;
  destino: string;
  kmInicial: number;
  kmFinal: number;
  responsavel: string;
  atividade: string;
  lavagem: 'realizada' | 'pendente';
  tanque: 'cheio' | 'necessario_abastecer' | 'meio_tanque';
  andarEstacionado: string;
  status: 'em_andamento' | 'finalizado' | 'cancelado';
  createdAt: string;
}

export interface FleetStats {
  totalViagens: number;
  totalKm: number;
  veiculosAtivos: number;
  lavagensRealizadas: number;
}
