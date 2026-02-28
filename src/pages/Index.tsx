import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Loader2, MessageSquare, Copy, CheckCheck, ParkingCircle, RefreshCw } from 'lucide-react';
import { StatsCards } from '@/components/fleet/StatsCards';
import { FleetTable } from '@/components/fleet/FleetTable';
import { AddRecordForm } from '@/components/fleet/AddRecordForm';
import { EditRecordForm } from '@/components/fleet/EditRecordForm';
import { FinishTripDialog } from '@/components/fleet/FinishTripDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';
import { useFleetRecords } from '@/hooks/useFleetRecords';
import { useVehicles } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { LogOut, User as UserIcon, FileDown, Image as ImageIcon, KeyRound } from 'lucide-react';
import { generateFleetReport, generateExcelReport } from '@/lib/ReportService';
import { FleetRecord, FleetStats } from '@/types/fleet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const { records, loading, error, refetch, addRecord, updateRecord, finishRecord, cancelRecord, startRecord, deleteRecord } = useFleetRecords();
  const { vehicles } = useVehicles();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<FleetRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [recordToFinish, setRecordToFinish] = useState<{ id: string; plate: string; kmInicial: number } | null>(null);
  const [editingRecord, setEditingRecord] = useState<FleetRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const navigate = useNavigate();

  const stats: FleetStats = {
    totalViagens: records.filter(r => r.status !== 'cancelado').length,
    totalKm: records
      .filter(r => r.status === 'finalizado')
      .reduce((acc, r) => acc + Math.max(0, (r.kmFinal || 0) - r.kmInicial), 0),
    veiculosAtivos: vehicles.filter(v => v.status === 'em_uso').length,
    garagem: vehicles.filter(v => v.status === 'disponivel').length,
    kmPorVeiculo: records
      .filter(r => r.status === 'finalizado')
      .reduce((acc, r) => {
        const km = Math.max(0, (r.kmFinal || 0) - r.kmInicial);
        acc[r.veiculo] = (acc[r.veiculo] || 0) + km;
        return acc;
      }, {} as Record<string, number>),
    carrosAlugados: vehicles.filter(v => v.category === 'Alugado' || v.category === 'Terceirizado').length,
    veiculosAlugadosLista: vehicles
      .filter(v => v.category === 'Alugado' || v.category === 'Terceirizado')
      .map(v => ({ modelo: v.model, placa: v.plate, vencimento: v.vencimentoBoleto })),
    utilizacaoPorArea: {
      licenciamento: records.filter(r => r.area === 'Licenciamento' && r.status !== 'cancelado').length,
      aquisicao: records.filter(r => r.area === 'Aquisição' && r.status !== 'cancelado').length,
      engenharia: records.filter(r => r.area === 'Engenharia' && r.status !== 'cancelado').length,
    }
  };

  const handleUpdateRecord = async (id: string, updates: Partial<FleetRecord>) => {
    try {
      await updateRecord(id, updates);
      toast({
        title: 'Registro atualizado!',
        description: 'As informações da viagem foram salvas.',
      });
    } catch (err) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const handleManualSync = async () => {
    try {
      await refetch();
      toast({
        title: 'Dados sincronizados!',
        description: 'As informações da frota foram atualizadas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao sincronizar',
        description: 'Não foi possível atualizar os dados da frota.',
        variant: 'destructive',
      });
    }
  };

  const handleFinishRecord = async (id: string, veiculo: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;
    setRecordToFinish({ id, plate: veiculo, kmInicial: record.kmInicial });
    setFinishDialogOpen(true);
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

  const handleStartRecord = async (id: string, veiculo: string) => {
    try {
      await startRecord(id, veiculo);
      toast({
        title: 'Viagem iniciada!',
        description: `O veículo ${veiculo} está agora em uso.`,
      });
    } catch (err) {
      toast({
        title: 'Erro ao iniciar',
        description: 'Não foi possível iniciar a viagem.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRecord = async (id: string, veiculo: string) => {
    if (!window.confirm(`ATENÇÃO: Deseja realmente EXCLUIR o registro do veículo ${veiculo}?\nEssa ação não pode ser desfeita.`)) return;

    try {
      await deleteRecord(id, veiculo);
      toast({
        title: 'Registro excluído',
        description: 'O registro foi removido do sistema.',
      });
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o registro.',
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

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateFleetReport(records);
      toast({
        title: 'PDF Gerado!',
        description: 'O relatório foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um problema ao processar o relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateExcel = async () => {
    try {
      setIsGeneratingExcel(true);
      await generateExcelReport(records);
      toast({
        title: 'Excel Gerado!',
        description: 'O relatório foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar Excel',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingExcel(false);
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


          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 mr-2 pr-2 border-r border-border/50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Car className="h-5 w-5" />
                      <span className="text-xs font-black leading-none">{stats.veiculosAtivos}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Veículos em Operação</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
                      <span className="h-5 w-5 flex items-center justify-center text-xs font-black rounded-full border border-current">G</span>
                      <span className="text-xs font-black leading-none">{stats.garagem}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Veículos na Garagem (Disponíveis)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={handleManualSync}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Atualizar dados</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

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
Status: agendamento (ou em uso)
Data inicial: 27/01/2026
Horario inicial: 16:00
Data final: 27/01/2026
Horario final: 18:00
Destino: Baião 
Km inicial: 146.7
Responsável: Marcio Amaral
Atividade: Acquisition sites
Área: Aquisição
Lavagem: pendente⏳
Tanque: cheio⛽
Andar estacionado: P (ou -1 ou -2)`}
                    </pre>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-3 pl-2 border-l border-border/50">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">
                  Agente Conectado
                </span>
                <span className="text-[9px] font-bold text-muted-foreground/60 truncate max-w-[120px]">
                  {user?.email}
                </span>
              </div>

              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                <UserIcon className="h-5 w-5" />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPasswordDialogOpen(true)}
                className="h-10 w-10 rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors group"
                title="Alterar Senha"
              >
                <KeyRound className="h-5 w-5 transition-transform group-hover:rotate-12" />
              </Button>

              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-10 w-10 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-colors group"
                title="Sair do sistema"
              >
                <LogOut className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
              </Button>
            </div>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="h-11 px-4 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-bold text-xs uppercase tracking-tighter rounded-xl"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                Relatório PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateExcel}
                disabled={isGeneratingExcel}
                className="h-11 px-4 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 font-bold text-xs uppercase tracking-tighter rounded-xl"
              >
                {isGeneratingExcel ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                Relatório Excel
              </Button>
              <AddRecordForm />
            </div>
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
                  vehicles={vehicles}
                  onFinish={handleFinishRecord}
                  onCancel={handleCancelRecord}
                  onStart={handleStartRecord}
                  onViewDetails={setSelectedRecord}
                  onDelete={handleDeleteRecord}
                  onEdit={(record) => {
                    setEditingRecord(record);
                    setEditDialogOpen(true);
                  }}
                />
              )}
            </div>
          )}
        </section>

        {/* Panel 2: Cancelled Demands */}
        {cancelledRecords.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight uppercase">Demandas Canceladas</h2>
                <p className="text-sm text-muted-foreground font-medium italic">Registros invalidados e históricos de cancelamento.</p>
              </div>
              <div className="h-10 w-[140px] hidden sm:block" /> {/* Placeholder to match AddRecordForm space */}
            </div>

            <div className="overflow-x-auto">
              <FleetTable
                records={cancelledRecords}
                vehicles={vehicles}
                onFinish={handleFinishRecord}
                onCancel={handleCancelRecord}
                onStart={handleStartRecord}
                onViewDetails={setSelectedRecord}
                onDelete={handleDeleteRecord}
                onEdit={(record) => {
                  setEditingRecord(record);
                  setEditDialogOpen(true);
                }}
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

            {(selectedRecord.fotoPainelInicialUrl || selectedRecord.fotoPainelFinalUrl || selectedRecord.comprovanteAbastecimentoUrl) && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedRecord.fotoPainelInicialUrl && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Painel Inicial (Saída)</p>
                    <a href={selectedRecord.fotoPainelInicialUrl} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border aspect-video bg-muted">
                      <img src={selectedRecord.fotoPainelInicialUrl} alt="Painel Inicial" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Ver Zoom</span>
                      </div>
                    </a>
                  </div>
                )}
                {selectedRecord.fotoPainelFinalUrl && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Painel Final (Retorno)</p>
                    <a href={selectedRecord.fotoPainelFinalUrl} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border aspect-video bg-muted">
                      <img src={selectedRecord.fotoPainelFinalUrl} alt="Painel Final" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Ver Zoom</span>
                      </div>
                    </a>
                  </div>
                )}
                {selectedRecord.comprovanteAbastecimentoUrl && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Comprovante</p>
                    <a href={selectedRecord.comprovanteAbastecimentoUrl} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border aspect-video bg-muted">
                      <img src={selectedRecord.comprovanteAbastecimentoUrl} alt="Comprovante" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Ver Zoom</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedRecord.rawMessage && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare className="h-3 w-3" />
                Mensagem Original (WhatsApp)
              </p>
              <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                <p className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {selectedRecord.rawMessage}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t flex gap-3">
            <Button variant="outline" className="flex-1 font-bold h-11 uppercase" onClick={() => setSelectedRecord(null)}>
              Fechar
            </Button>
          </div>
        </div>
      )}

      {recordToFinish && (
        <FinishTripDialog
          open={finishDialogOpen}
          onOpenChange={setFinishDialogOpen}
          recordId={recordToFinish?.id || ''}
          veiculoPlate={recordToFinish?.plate || ''}
          kmInicial={recordToFinish?.kmInicial || 0}
          onConfirm={finishRecord}
        />
      )}

      {editingRecord && (
        <EditRecordForm
          record={editingRecord}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUpdate={handleUpdateRecord}
        />
      )}

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
};

export default Index;
