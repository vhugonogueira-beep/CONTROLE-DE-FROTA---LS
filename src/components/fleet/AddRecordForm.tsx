import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Car, User, MapPin, Gauge, ParkingCircle, AlertCircle, Fuel, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { FleetRecord } from '@/types/fleet';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';
import { useFleetRecords } from '@/hooks/useFleetRecords';

export function AddRecordForm() {
  const [open, setOpen] = useState(false);
  const { vehicles, loading: loadingVehicles } = useVehicles();
  const { addRecord } = useFleetRecords();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [fotoPainel, setFotoPainel] = useState<File | null>(null);

  const initialFormData = {
    veiculo: '',
    dataInicial: new Date().toISOString().split('T')[0],
    horarioInicial: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    destino: '',
    kmInicial: '',
    responsavel: '',
    atividade: '',
    lavagem: 'pendente' as FleetRecord['lavagem'],
    tanque: 'cheio' as FleetRecord['tanque'],
    andarEstacionado: '',
    dataFinal: '',
    horarioFinal: '',
    status: 'em_andamento' as FleetRecord['status'],
    area: 'Aquisição',
  };

  const [formData, setFormData] = useState(initialFormData);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `inicial_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `trips/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('fleet_photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('fleet_photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.andarEstacionado) {
        toast({
          title: 'Campo obrigatório',
          description: 'Por favor, selecione onde o veículo está estacionado.',
          variant: 'destructive',
        });
        return;
      }
      setIsUploading(true);
      let fotoPainelUrl = '';

      if (fotoPainel) {
        fotoPainelUrl = await uploadFile(fotoPainel);
      }

      await addRecord({
        veiculo: formData.veiculo,
        dataInicial: formData.dataInicial,
        horarioInicial: formData.horarioInicial,
        dataFinal: formData.dataFinal,
        horarioFinal: formData.horarioFinal,
        destino: formData.destino,
        kmInicial: parseFloat(formData.kmInicial),
        kmFinal: 0, // Will be set on finish
        responsavel: formData.responsavel,
        atividade: formData.atividade,
        lavagem: formData.lavagem,
        tanque: formData.tanque,
        andarEstacionado: formData.andarEstacionado,
        status: formData.status,
        area: formData.area,
        fotoPainelInicialUrl: fotoPainelUrl,
      });

      toast({
        title: formData.status === 'agendado' ? 'Viagem agendada!' : 'Registro iniciado!',
        description: `O veículo ${formData.veiculo} foi ${formData.status === 'agendado' ? 'reservado' : 'registrado'} com sucesso.`,
      });

      setFormData(initialFormData);
      setFotoPainel(null);
      setOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao registrar',
        description: err instanceof Error ? err.message : 'Não foi possível salvar o registro.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-bold uppercase tracking-wider h-11 shadow-lg active:scale-95 transition-all">
          <Plus className="h-5 w-5" />
          Nova Saída
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl p-0">
        <div className="bg-primary p-6 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Registrar Saída de Veículo</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 font-medium">
              LS OFFICE • Controle Operacional de Frota
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="veiculo" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                <Car className="h-3 w-3" /> Veículo Disponível
              </Label>
              <Select
                value={formData.veiculo}
                onValueChange={(value) => {
                  const vehicle = vehicles.find(v => v.plate === value);
                  // Could potentially auto-fill some fields here if needed
                  setFormData({ ...formData, veiculo: value });
                }}
                disabled={loadingVehicles}
                required
              >
                <SelectTrigger className="h-11 border-border/50 bg-muted/30 font-bold">
                  <SelectValue placeholder={loadingVehicles ? "Carregando..." : "Selecione o veículo"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhum veículo cadastrado.
                    </div>
                  ) : (
                    vehicles.map(v => (
                      <SelectItem key={v.id} value={v.plate}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-bold">{v.plate}</span>
                          <span className="text-muted-foreground text-[10px]">- {v.brand} {v.model}</span>
                          {v.status !== 'disponivel' && (
                            <span className={`ml-auto text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${v.status === 'em_uso' ? 'bg-primary/20 text-primary' :
                              v.status === 'agendado' ? 'bg-amber-500/20 text-amber-600' :
                                'bg-destructive/20 text-destructive'
                              }`}>
                              {v.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Responsável
              </Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                placeholder="Nome do motorista"
                className="h-11 border-border/50 font-semibold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                Área Solicitante
              </Label>
              <Select
                value={formData.area}
                onValueChange={(value) => setFormData({ ...formData, area: value })}
                required
              >
                <SelectTrigger className="h-11 border-border/50 bg-muted/30 font-bold">
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Licenciamento">Licenciamento</SelectItem>
                  <SelectItem value="Aquisição">Aquisição</SelectItem>
                  <SelectItem value="Engenharia">Engenharia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dataInicial" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Data Saída</Label>
              <Input
                id="dataInicial"
                type="date"
                value={formData.dataInicial}
                onChange={(e) => setFormData({ ...formData, dataInicial: e.target.value })}
                className="h-11 font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horarioInicial" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Horário</Label>
              <Input
                id="horarioInicial"
                type="time"
                value={formData.horarioInicial}
                onChange={(e) => setFormData({ ...formData, horarioInicial: e.target.value })}
                className="h-11 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="space-y-2">
              <Label htmlFor="dataFinal" className="text-[10px] uppercase font-bold text-primary tracking-widest">Previsão Data Final</Label>
              <Input
                id="dataFinal"
                type="date"
                value={formData.dataFinal}
                onChange={(e) => setFormData({ ...formData, dataFinal: e.target.value })}
                className="h-11 font-mono border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horarioFinal" className="text-[10px] uppercase font-bold text-primary tracking-widest">Previsão Horário Final</Label>
              <Input
                id="horarioFinal"
                type="time"
                value={formData.horarioFinal}
                onChange={(e) => setFormData({ ...formData, horarioFinal: e.target.value })}
                className="h-11 font-mono border-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="destino" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Destino
              </Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                placeholder="Ex: Obra XPTO"
                className="h-11 border-border/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmInicial" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                <Gauge className="h-3 w-3" /> KM Inicial
              </Label>
              <Input
                id="kmInicial"
                type="number"
                step="1"
                value={formData.kmInicial}
                onChange={(e) => setFormData({ ...formData, kmInicial: e.target.value })}
                className="h-11 font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="atividade" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Atividade</Label>
              <Input
                id="atividade"
                value={formData.atividade}
                onChange={(e) => setFormData({ ...formData, atividade: e.target.value })}
                placeholder="Finalidade da viagem"
                className="h-11 border-border/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Tipo de Registro</Label>
              <Select
                value={formData.status}
                onValueChange={(value: FleetRecord['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-11 border-border/50 font-bold bg-primary/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_andamento" className="font-bold text-primary">▶️ Iniciar Agora (Em Uso)</SelectItem>
                  <SelectItem value="agendado" className="font-bold text-amber-600">📅 Agendar para Depois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                <Camera className="h-3 w-3" /> Foto do Painel Inicial (Saída)
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoPainel(e.target.files?.[0] || null)}
                disabled={isUploading}
                className="h-11 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {fotoPainel && <p className="text-[10px] mt-1 text-emerald-500 font-bold">Arquivo selecionado: {fotoPainel.name}</p>}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-dashed border-border/50">
            <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest mb-2">Checklist de Saída</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tanque" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                  <Fuel className="h-3 w-3" /> Tanque
                </Label>
                <Select
                  value={formData.tanque}
                  onValueChange={(value: FleetRecord['tanque']) =>
                    setFormData({ ...formData, tanque: value })
                  }
                >
                  <SelectTrigger className="h-10 text-xs font-bold border-none bg-background shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheio">Cheio ⛽</SelectItem>
                    <SelectItem value="3/4">3/4</SelectItem>
                    <SelectItem value="meio_tanque">1/2 Tanque</SelectItem>
                    <SelectItem value="1/4">1/4</SelectItem>
                    <SelectItem value="reserva">Reserva ⚠</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lavagem" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                  Limpeza
                </Label>
                <Select
                  value={formData.lavagem}
                  onValueChange={(value: FleetRecord['lavagem']) =>
                    setFormData({ ...formData, lavagem: value })
                  }
                >
                  <SelectTrigger className="h-10 text-xs font-bold border-none bg-background shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realizada">Limpo ✅</SelectItem>
                    <SelectItem value="pendente">Sujo ⏳</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="andarEstacionado" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                  <ParkingCircle className="h-3 w-3" /> Estacionamento
                </Label>
                <Select
                  value={formData.andarEstacionado}
                  onValueChange={(value) =>
                    setFormData({ ...formData, andarEstacionado: value })
                  }
                  required
                >
                  <SelectTrigger className="h-10 text-xs font-bold border-none bg-background shadow-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P">P</SelectItem>
                    <SelectItem value="-1">-1</SelectItem>
                    <SelectItem value="-2">-2</SelectItem>
                    <SelectItem value="RUA 7">RUA 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" className="font-bold uppercase tracking-wider" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button type="submit" className="h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar Saída'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
