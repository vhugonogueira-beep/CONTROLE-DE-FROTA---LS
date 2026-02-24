import { useState, useEffect } from 'react';
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
    DialogDescription,
} from '@/components/ui/dialog';
import { FleetRecord } from '@/types/fleet';
import { useVehicles } from '@/hooks/useVehicles';

interface EditRecordFormProps {
    record: FleetRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: string, updates: Partial<FleetRecord>) => Promise<void>;
}

export function EditRecordForm({ record, open, onOpenChange, onUpdate }: EditRecordFormProps) {
    const { vehicles, loading: loadingVehicles } = useVehicles();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<FleetRecord>>({});

    useEffect(() => {
        if (record) {
            setFormData({
                veiculo: record.veiculo,
                dataInicial: record.dataInicial,
                horarioInicial: record.horarioInicial,
                dataFinal: record.dataFinal,
                horarioFinal: record.horarioFinal,
                destino: record.destino,
                kmInicial: record.kmInicial,
                responsavel: record.responsavel,
                atividade: record.atividade,
                lavagem: record.lavagem,
                tanque: record.tanque,
                andarEstacionado: record.andarEstacionado,
                status: record.status,
                area: record.area,
            });
        }
    }, [record]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!record) return;

        try {
            setLoading(true);
            await onUpdate(record.id, formData);
            onOpenChange(false);
        } catch (err) {
            // Error handled by parent with toast
        } finally {
            setLoading(false);
        }
    };

    if (!record) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl p-0">
                <div className="bg-amber-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">Editar Viagem</DialogTitle>
                        <DialogDescription className="text-white/80 font-medium">
                            Corrija as informações do registro selecionado.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="veiculo" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                <Car className="h-3 w-3" /> Veículo
                            </Label>
                            <Select
                                value={formData.veiculo}
                                onValueChange={(value) => setFormData({ ...formData, veiculo: value })}
                                disabled={loadingVehicles || loading}
                                required
                            >
                                <SelectTrigger className="h-11 border-border/50 bg-muted/30 font-bold">
                                    <SelectValue placeholder={loadingVehicles ? "Carregando..." : "Selecione o veículo"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map(v => (
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
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="responsavel" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                <User className="h-3 w-3" /> Responsável
                            </Label>
                            <Input
                                id="responsavel"
                                value={formData.responsavel || ''}
                                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                placeholder="Nome do motorista"
                                className="h-11 border-border/50 font-semibold"
                                required
                                disabled={loading}
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
                                disabled={loading}
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
                                value={formData.dataInicial || ''}
                                onChange={(e) => setFormData({ ...formData, dataInicial: e.target.value })}
                                className="h-11 font-mono"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="horarioInicial" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Horário</Label>
                            <Input
                                id="horarioInicial"
                                type="time"
                                value={formData.horarioInicial || ''}
                                onChange={(e) => setFormData({ ...formData, horarioInicial: e.target.value })}
                                className="h-11 font-mono"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-6 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                        <div className="space-y-2">
                            <Label htmlFor="dataFinal" className="text-[10px] uppercase font-bold text-amber-600 tracking-widest">Previsão Data Final</Label>
                            <Input
                                id="dataFinal"
                                type="date"
                                value={formData.dataFinal || ''}
                                onChange={(e) => setFormData({ ...formData, dataFinal: e.target.value })}
                                className="h-11 font-mono border-amber-500/20"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="horarioFinal" className="text-[10px] uppercase font-bold text-amber-600 tracking-widest">Previsão Horário Final</Label>
                            <Input
                                id="horarioFinal"
                                type="time"
                                value={formData.horarioFinal || ''}
                                onChange={(e) => setFormData({ ...formData, horarioFinal: e.target.value })}
                                className="h-11 font-mono border-amber-500/20"
                                disabled={loading}
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
                                value={formData.destino || ''}
                                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                                placeholder="Ex: Obra XPTO"
                                className="h-11 border-border/50"
                                required
                                disabled={loading}
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
                                value={formData.kmInicial || ''}
                                onChange={(e) => setFormData({ ...formData, kmInicial: parseFloat(e.target.value) })}
                                className="h-11 font-bold"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="atividade" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Atividade</Label>
                            <Input
                                id="atividade"
                                value={formData.atividade || ''}
                                onChange={(e) => setFormData({ ...formData, atividade: e.target.value })}
                                placeholder="Finalidade da viagem"
                                className="h-11 border-border/50"
                                required
                                disabled={loading}
                            />
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                        <Button type="button" variant="ghost" className="font-bold uppercase tracking-wider" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
