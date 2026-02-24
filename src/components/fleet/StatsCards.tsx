import { Car, MapPin, Gauge, Droplets, ParkingCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FleetStats } from '@/types/fleet';

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
    },
    {
      title: 'Lavagens Realizadas',
      value: stats.lavagensRealizadas,
      icon: Droplets,
      gradient: 'from-green-500/10 to-green-500/5',
      iconColor: 'text-green-500',
      description: 'Manutenção estética',
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
                ) : (
                  <p className="text-3xl font-black tracking-tight">
                    {card.value}
                  </p>
                )}
                <p className="text-[10px] font-medium text-muted-foreground mt-1">
                  {card.description}
                </p>
              </div>
              <div className={`rounded-xl bg-background/60 p-3 shadow-inner ${card.iconColor} shrink-0`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
