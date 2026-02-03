import { useState } from 'react';
import { Plus, Car, User, MapPin, Gauge, ParkingCircle, AlertCircle, Fuel } from 'lucide-react';
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
    status: 'em_andamento' as FleetRecord['status'],
  };

  const [formData, setFormData] = useState(initialFormData);

  const availableVehicles = vehicles.filter(v => v.status === 'disponivel');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addRecord({
        veiculo: formData.veiculo,
        dataInicial: formData.dataInicial,
        horarioInicial: formData.horarioInicial,
        dataFinal: '', // Will be set on finish
        horarioFinal: '', // Will be set on finish
        destino: formData.destino,
        kmInicial: parseFloat(formData.kmInicial),
        kmFinal: 0, // Will be set on finish
        responsavel: formData.responsavel,
        atividade: formData.atividade,
        lavagem: formData.lavagem,
        tanque: formData.tanque,
        andarEstacionado: formData.andarEstacionado,
        status: formData.status,
      });

      toast({
        title: formData.status === 'agendado' ? 'Viagem agendada!' : 'Registro iniciado!',
        description: `O veículo ${formData.veiculo} foi ${formData.status === 'agendado' ? 'reservado' : 'registrado'} com sucesso.`,
      });

      setFormData(initialFormData);
      setOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao registrar',
        description: err instanceof Error ? err.message : 'Não foi possível salvar o registro.',
        variant: 'destructive',
      });
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
                  {availableVehicles.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhum veículo disponível no momento.
                    </div>
                  ) : (
                    availableVehicles.map(v => (
                      <SelectItem key={v.id} value={v.plate}>
                        <span className="font-bold">{v.plate}</span> - {v.model}
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
            <div className="space-y-2 col-span-2 md:col-span-1">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <SelectItem value="meio_tanque">Meio Tanque</SelectItem>
                    <SelectItem value="necessario_abastecer">Abastecer</SelectItem>
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
                  <ParkingCircle className="h-3 w-3" /> Andar
                </Label>
                <Input
                  id="andarEstacionado"
                  value={formData.andarEstacionado}
                  onChange={(e) => setFormData({ ...formData, andarEstacionado: e.target.value })}
                  className="h-10 border-none bg-background shadow-sm text-center font-black"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" className="font-bold uppercase tracking-wider" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button type="submit" className="h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              Confirmar Saída
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
