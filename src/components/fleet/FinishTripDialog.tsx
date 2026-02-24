import { useState } from 'react';
import { Camera, FileText, Loader2, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FinishTripDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recordId: string;
    veiculoPlate: string;
    kmInicial: number;
    onConfirm: (id: string, veiculo: string, finalKm: number, fotoPainel?: string, comprovante?: string) => Promise<void>;
}

export function FinishTripDialog({
    open,
    onOpenChange,
    recordId,
    veiculoPlate,
    kmInicial,
    onConfirm
}: FinishTripDialogProps) {
    const [finalKm, setFinalKm] = useState<string>('');
    const [fotoPainel, setFotoPainel] = useState<File | null>(null);
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const uploadFile = async (file: File, prefix: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${prefix}_${recordId}_${Math.random().toString(36).substring(7)}.${fileExt}`;
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
        const km = parseFloat(finalKm);

        if (isNaN(km) || km < kmInicial) {
            toast({
                title: 'Erro de validação',
                description: `O KM final deve ser maior ou igual ao inicial (${kmInicial}).`,
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsUploading(true);

            let fotoPainelUrl = '';
            let comprovanteUrl = '';

            if (fotoPainel) {
                fotoPainelUrl = await uploadFile(fotoPainel, 'painel');
            }

            if (comprovante) {
                comprovanteUrl = await uploadFile(comprovante, 'comprovante');
            }

            await onConfirm(recordId, veiculoPlate, km, fotoPainelUrl, comprovanteUrl);
            onOpenChange(false);
            setFinalKm('');
            setFotoPainel(null);
            setComprovante(null);
        } catch (error) {
            console.error('Error finishing trip:', error);
            toast({
                title: 'Erro ao finalizar',
                description: error instanceof Error ? error.message : 'Não foi possível salvar as fotos ou finalizar a viagem.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase">Finalizar Viagem</DialogTitle>
                    <DialogDescription>
                        Veículo {veiculoPlate} • KM Inicial: {kmInicial}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="finalKm" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                            <Gauge className="h-3 w-3" /> KM Final
                        </Label>
                        <Input
                            id="finalKm"
                            type="number"
                            step="0.1"
                            value={finalKm}
                            onChange={(e) => setFinalKm(e.target.value)}
                            placeholder="Digite o KM atual do veículo"
                            className="h-11 font-bold"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                <Camera className="h-3 w-3" /> Foto do Painel Final (Retorno)
                            </Label>
                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFotoPainel(e.target.files?.[0] || null)}
                                    className="h-11 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                                {fotoPainel && <p className="text-[10px] mt-1 text-emerald-500 font-bold">Arquivo selecionado: {fotoPainel.name}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Comprovante de Abastecimento
                            </Label>
                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setComprovante(e.target.files?.[0] || null)}
                                    className="h-11 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                                {comprovante && <p className="text-[10px] mt-1 text-emerald-500 font-bold">Arquivo selecionado: {comprovante.name}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isUploading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUploading}
                            className="font-bold uppercase tracking-widest"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Finalizar Agora'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
