export interface FleetRecord {
  id: string;
  veiculo: string;
  dataInicial: string;
  horarioInicial: string;
  dataFinal?: string;
  horarioFinal?: string;
  destino: string;
  kmInicial: number;
  kmFinal?: number;
  responsavel: string;
  atividade: string;
  lavagem: 'realizada' | 'pendente';
  tanque: 'cheio' | 'necessario_abastecer' | 'meio_tanque';
  andarEstacionado: string;
  status: 'em_andamento' | 'finalizado' | 'cancelado' | 'agendado';
  area?: string;
  rawMessage?: string;
  fotoPainelInicialUrl?: string;
  fotoPainelFinalUrl?: string;
  comprovanteAbastecimentoUrl?: string;
  createdAt: string;
}

export interface FleetStats {
  totalViagens: number;
  totalKm: number;
  veiculosAtivos: number;
  garagem: number;
  lavagensRealizadas: number;
  utilizacaoPorArea: {
    licenciamento: number;
    aquisicao: number;
    engenharia: number;
  };
}
