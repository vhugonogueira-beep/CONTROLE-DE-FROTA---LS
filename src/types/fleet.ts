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
  tanque: 'cheio' | '3/4' | 'meio_tanque' | '1/4' | 'reserva';
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
  kmPorVeiculo: Record<string, number>;
  carrosAlugados: number;
  valorTotalAluguel: number;
  veiculosAlugadosLista: { modelo: string; placa: string; vencimento?: string; valorAluguel?: number }[];
  utilizacaoPorArea: {
    licenciamento: number;
    aquisicao: number;
    engenharia: number;
  };
}
