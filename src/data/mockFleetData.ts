import { FleetRecord, FleetStats } from '@/types/fleet';

export const mockFleetRecords: FleetRecord[] = [
  {
    id: '1',
    veiculo: 'Saveiro Robust',
    dataInicial: '2026-01-27',
    horarioInicial: '16:00',
    dataFinal: '2026-02-02',
    horarioFinal: '12:00',
    destino: 'Baião',
    kmInicial: 146.7,
    kmFinal: 1367,
    responsavel: 'Marcio Amaral',
    atividade: 'Acquisition 6 sites PTI',
    lavagem: 'realizada',
    tanque: 'necessario_abastecer',
    andarEstacionado: '-1',
    createdAt: '2026-01-27T16:00:00Z',
  },
  {
    id: '2',
    veiculo: 'Fiat Strada',
    dataInicial: '2026-01-25',
    horarioInicial: '08:00',
    dataFinal: '2026-01-26',
    horarioFinal: '18:00',
    destino: 'Porto',
    kmInicial: 45230,
    kmFinal: 45580,
    responsavel: 'João Silva',
    atividade: 'Manutenção preventiva',
    lavagem: 'pendente',
    tanque: 'cheio',
    andarEstacionado: '0',
    createdAt: '2026-01-25T08:00:00Z',
  },
  {
    id: '3',
    veiculo: 'Renault Kangoo',
    dataInicial: '2026-01-20',
    horarioInicial: '07:30',
    dataFinal: '2026-01-22',
    horarioFinal: '19:00',
    destino: 'Lisboa',
    kmInicial: 89000,
    kmFinal: 89450,
    responsavel: 'Ana Costa',
    atividade: 'Entrega de equipamentos',
    lavagem: 'realizada',
    tanque: 'meio_tanque',
    andarEstacionado: '-2',
    createdAt: '2026-01-20T07:30:00Z',
  },
];

export const calculateStats = (records: FleetRecord[]): FleetStats => {
  const totalKm = records.reduce((acc, record) => acc + (record.kmFinal - record.kmInicial), 0);
  const veiculosUnicos = new Set(records.map(r => r.veiculo)).size;
  const lavagensRealizadas = records.filter(r => r.lavagem === 'realizada').length;

  return {
    totalViagens: records.length,
    kmTotal: totalKm,
    veiculosAtivos: veiculosUnicos,
    lavagensRealizadas,
  };
};
