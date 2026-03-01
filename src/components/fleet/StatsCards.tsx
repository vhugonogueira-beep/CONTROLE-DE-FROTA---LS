import { Car, MapPin, Gauge, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FleetStats } from '@/types/fleet';

// Custom car rental icon SVG component
const CarRentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17h14M7 13h10M6 9l2-4h8l2 4" />
    <circle cx="7.5" cy="17" r="1.5" />
    <circle cx="16.5" cy="17" r="1.5" />
    <path d="M4 13l-1 4h1M20 13l1 4h-1" />
    <rect x="8" y="1" width="8" height="5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" />
    <text x="12" y="4.8" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="sans-serif">R$</text>
  </svg>
);

interface StatsCardsProps {
  stats: FleetStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total de Viagens',
      value: stats.totalViagens,
      icon: MapPin,
      gradient: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-500',
      description: 'Registros no sistema',
    },
    {
      title: 'Utilização por Área',
      value: '', // Not used for this card
      icon: Car,
      gradient: 'from-amber-500/10 to-amber-500/5',
      iconColor: 'text-amber-500',
      description: '',
      isAreaCard: true,
    },
    {
      title: 'KM Percorridos',
      value: stats.totalKm.toLocaleString(),
      icon: Gauge,
      gradient: 'from-cyan-500/10 to-cyan-500/5',
      iconColor: 'text-cyan-500',
      description: 'Distância acumulada',
      isKmCard: true,
    },
    {
      title: 'Carros Alugados',
      value: stats.carrosAlugados,
      icon: null as any,
      customIcon: true,
      gradient: 'from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-500',
      description: 'Veículos locados/terceiros',
      isAlugadoCard: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={`relative overflow-hidden border-0 bg-gradient-to-br ${card.gradient} backdrop-blur-sm animate-fade-in shadow-sm hover:shadow-md transition-shadow duration-300`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                  {card.title}
                </p>
                {card.isAreaCard ? (
                  <div className="space-y-1 my-1">
                    <div className="flex justify-between items-center pr-4">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60">AQUISIÇÃO</span>
                      <span className="text-sm font-black">{stats.utilizacaoPorArea.aquisicao}</span>
                    </div>
                    <div className="flex justify-between items-center pr-4">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60">ENGENHARIA</span>
                      <span className="text-sm font-black">{stats.utilizacaoPorArea.engenharia}</span>
                    </div>
                    <div className="flex justify-between items-center pr-4">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60">LICENCIAMENTO</span>
                      <span className="text-sm font-black">{stats.utilizacaoPorArea.licenciamento}</span>
                    </div>
                  </div>
                ) : card.isKmCard ? (
                  <div className="space-y-1 my-1">
                    {Object.entries(stats.kmPorVeiculo).map(([plate, km]) => (
                      <div key={plate} className="flex justify-between items-center pr-4 border-b border-white/5 pb-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/60">{plate}</span>
                        <span className="text-sm font-black">{km.toLocaleString()} <span className="text-[8px] font-bold">KM</span></span>
                      </div>
                    ))}
                    <div className="pt-1">
                      <span className="text-[8px] font-black text-muted-foreground/40 uppercase">Total: {card.value} KM</span>
                    </div>
                  </div>
                ) : card.isAlugadoCard ? (
                  <div className="space-y-1 my-1">
                    {stats.veiculosAlugadosLista.length > 0 ? (
                      <>
                        {stats.veiculosAlugadosLista.map((v) => (
                          <div key={v.placa} className="flex justify-between items-center pr-4 border-b border-white/5 pb-1">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/60">{v.modelo}</span>
                              <span className="text-[9px] font-bold text-purple-400">{v.placa}</span>
                            </div>
                            <span className="text-[10px] font-black text-purple-400">
                              {v.valorAluguel ? `R$ ${v.valorAluguel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-1.5 border-t border-purple-500/20">
                          <span className="text-[8px] font-black text-muted-foreground/40 uppercase">Total: {stats.carrosAlugados} veículos</span>
                          <span className="text-[10px] font-black text-purple-400">
                            R$ {stats.valorTotalAluguel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-2xl font-black tracking-tight text-muted-foreground/40">0</p>
                    )}
                  </div>
                ) : (
                  <p className="text-3xl font-black tracking-tight text-center">
                    {card.value}
                  </p>
                )}
                <p className="text-[10px] font-medium text-muted-foreground mt-1">
                  {card.description}
                </p>
              </div>
              <div className={`rounded-xl bg-background/60 p-3 shadow-inner ${card.iconColor} shrink-0`}>
                {card.customIcon ? (
                  <CarRentIcon className="h-12 w-12" />
                ) : (
                  <card.icon className="h-12 w-12" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

