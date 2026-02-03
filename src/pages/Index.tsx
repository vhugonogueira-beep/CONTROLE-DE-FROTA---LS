import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Loader2, MessageSquare, Copy, CheckCheck } from 'lucide-react';
import { StatsCards } from '@/components/fleet/StatsCards';
import { FleetTable } from '@/components/fleet/FleetTable';
import { AddRecordForm } from '@/components/fleet/AddRecordForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useFleetRecords } from '@/hooks/useFleetRecords';
import { useVehicles } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FleetRecord, FleetStats } from '@/types/fleet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { records, loading, error, finishRecord, cancelRecord } = useFleetRecords();
  const { vehicles } = useVehicles();
  const { toast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<FleetRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const stats: FleetStats = {
    totalViagens: records.filter(r => r.status !== 'cancelado').length,
    totalKm: records
      .filter(r => r.status === 'finalizado')
      .reduce((acc, r) => acc + Math.max(0, r.kmFinal - r.kmInicial), 0),
    veiculosAtivos: vehicles.filter(v => v.status !== 'bloqueado').length,
    lavagensRealizadas: records.filter(r => r.lavagem === 'realizada').length,
  };

  const handleFinishRecord = async (id: string, veiculo: string) => {
    const finalKmStr = window.prompt(`Finalizar uso do veículo ${veiculo}.\nInforme o KM final:`);
    if (finalKmStr === null) return;

    const finalKm = parseFloat(finalKmStr);
    if (isNaN(finalKm)) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, informe um número válido para o KM.',
        variant: 'destructive',
      });
      return;
    }

    const trip = records.find(r => r.id === id);
    if (trip && finalKm < trip.kmInicial) {
      toast({
        title: 'Erro de validação',
        description: `O KM final (${finalKm}) não pode ser menor que o inicial (${trip.kmInicial}).`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await finishRecord(id, veiculo, finalKm);
      toast({
        title: 'Uso finalizado!',
        description: `O veículo ${veiculo} foi liberado com sucesso.`,
      });
    } catch (err) {
      toast({
        title: 'Erro ao finalizar',
        description: err instanceof Error ? err.message : 'Não foi possível encerrar a viagem.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelRecord = async (id: string, veiculo: string) => {
    if (!window.confirm(`Deseja realmente CANCELAR a viagem do veículo ${veiculo}?`)) return;

    try {
      await cancelRecord(id, veiculo);
      toast({
        title: 'Viagem cancelada',
        description: 'O registro foi invalidado e o veículo liberado.',
      });
    } catch (err) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar a viagem.',
        variant: 'destructive',
      });
    }
  };

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast({
        title: 'URL copiada!',
        description: 'A URL do webhook foi copiada para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar a URL.',
        variant: 'destructive',
      });
    }
  };

  const activeRecords = records.filter(r => r.status !== 'cancelado');
  const cancelledRecords = records.filter(r => r.status === 'cancelado');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with LS Office Branding */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container relative flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white border border-border shadow-sm">
              <img src="/logo.jpg" alt="LS Office Logo" className="h-full w-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black leading-none tracking-tight">CONTROLE DE FROTA</h1>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">LS OFFICE • Operações</p>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
            <h2 className="text-2xl font-black tracking-tighter text-primary leading-none uppercase">LS OFFICE</h2>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] mt-1 hidden md:block">
              Serviços de Telecom e Construções
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/vehicles')} className="hidden sm:flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Car className="h-4 w-4" />
              Garagem
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10 font-bold text-xs uppercase tracking-tighter">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase italic">Integração WhatsApp</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">URL do Webhook</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-primary font-bold"
                        onClick={handleCopyWebhook}
                      >
                        {copied ? (
                          <CheckCheck className="mr-2 h-3 w-3" />
                        ) : (
                          <Copy className="mr-2 h-3 w-3" />
                        )}
                        {copied ? 'Copiado' : 'Copiar'}
                      </Button>
                    </div>
                    <pre className="rounded-lg bg-muted p-4 text-[10px] font-mono whitespace-pre-wrap break-all border border-border/50">
                      {webhookUrl}
                    </pre>
                  </div>

                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <h3 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Exemplo de Mensagem:
                    </h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
                      Cole este formato no WhatsApp para registro automático:
                    </p>
                    <pre className="rounded bg-muted px-3 py-2 text-[10px] font-mono whitespace-pre-wrap leading-tight text-foreground/80">
                      {`*Saveiro Robust*
Data inicial: 27/01/2026
Horario inicial: 16h
Destino: Baião 
Km inicial: 146.7
Responsável: Marcio Amaral
Atividade: Acquisition sites
Lavagem: pendente⏳
Tanque: cheio⛽
Andar estacionado: -1`}
                    </pre>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-12">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive font-medium animate-in fade-in slide-in-from-top-2">
            Erro ao carregar dados: {error}
          </div>
        )}

        <StatsCards stats={stats} />

        {/* Panel 1: Operational Panel (Active Trips) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight uppercase">Painel Operacional</h2>
              <p className="text-sm text-muted-foreground font-medium italic">Viagens Ativas e Histórico de Sucesso.</p>
            </div>
            <AddRecordForm />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeRecords.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center bg-muted/10">
                  <Car className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-bold uppercase tracking-tight">Nenhuma operação ativa</h3>
                </div>
              ) : (
                <FleetTable
                  records={activeRecords}
                  onFinish={handleFinishRecord}
                  onCancel={handleCancelRecord}
                  onViewDetails={setSelectedRecord}
                />
              )}
            </div>
          )}
        </section>

        {/* Panel 2: Cancelled Demands */}
        {cancelledRecords.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b pb-4 border-destructive/20">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight uppercase text-destructive/80">Demandas Canceladas</h2>
                <p className="text-sm text-muted-foreground font-medium italic text-destructive/60">Registros invalidados e históricos de cancelamento.</p>
              </div>
            </div>

            <div className="overflow-x-auto opacity-80 grayscale-[0.5] hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <FleetTable
                records={cancelledRecords}
                onFinish={handleFinishRecord}
                onCancel={handleCancelRecord}
                onViewDetails={setSelectedRecord}
              />
            </div>
          </section>
        )}
      </main>

      {/* Basic Trip Details Dialog */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-card p-6 rounded-2xl border shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase">{selectedRecord.veiculo}</h3>
                <Badge variant="outline" className="mt-1 capitalize px-2 py-0 h-5 text-[10px] font-bold">
                  {selectedRecord.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Responsável</p>
                  <p className="font-bold text-lg">{selectedRecord.responsavel}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Destino</p>
                  <p className="font-semibold">{selectedRecord.destino}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">KM Rodado</p>
                  <p className="font-mono font-bold text-lg">
                    {selectedRecord.kmInicial} → {selectedRecord.status === 'finalizado' ? selectedRecord.kmFinal : '...'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Atividade</p>
                  <p className="font-medium text-muted-foreground italic line-clamp-2">{selectedRecord.atividade}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex gap-3">
              <Button variant="outline" className="flex-1 font-bold h-11 uppercase" onClick={() => setSelectedRecord(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
