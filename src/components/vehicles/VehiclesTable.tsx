import { Car, Info, Edit, Trash2, CheckCircle2, AlertCircle, PlayCircle, FileText, CreditCard, Receipt, Paperclip, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface VehiclesTableProps {
    vehicles: Vehicle[];
    onViewDetails: (vehicle: Vehicle) => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<Vehicle>) => void;
}

export function VehiclesTable({ vehicles, onViewDetails, onEdit, onDelete, onUpdate }: VehiclesTableProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUpdate || !activeVehicleId) return;

        try {
            setUploadingId(activeVehicleId);
            const fileExt = file.name.split('.').pop();
            const fileName = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `vehicles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('fleet_photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('fleet_photos')
                .getPublicUrl(filePath);

            await onUpdate(activeVehicleId, { documentoUrl: data.publicUrl });
        } catch (error) {
            console.error('Error in quick upload:', error);
            toast({
                title: 'Erro no upload',
                description: 'Não foi possível salvar o documento.',
                variant: 'destructive',
            });
        } finally {
            setUploadingId(null);
            setActiveVehicleId(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getStatusBadge = (status: Vehicle['status']) => {
        switch (status) {
            case 'disponivel':
                return (
                    <Badge className="bg-success/20 text-success border-0 hover:bg-success/30 h-6">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Disponível
                    </Badge>
                );
            case 'em_uso':
                return (
                    <Badge className="bg-primary/20 text-primary border-0 hover:bg-primary/30 h-6">
                        <PlayCircle className="mr-1 h-3 w-3" />
                        Em Uso
                    </Badge>
                );
            case 'bloqueado':
                return (
                    <Badge className="bg-destructive/20 text-destructive border-0 hover:bg-destructive/30 h-6">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Bloqueado
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
            <TooltipProvider>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[80px] font-bold text-xs uppercase tracking-wider"></TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider">ID / Placa</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider">Veículo / Modelo</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider">Tipo / Categoria</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider">Status Atual</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles.map((vehicle, index) => (
                            <TableRow
                                key={vehicle.id}
                                className="animate-fade-in group hover:bg-muted/20 border-b last:border-0"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <TableCell>
                                    <div className="h-10 w-16 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                                        {vehicle.imageUrl ? (
                                            <img src={vehicle.imageUrl} alt={vehicle.plate} className="h-full w-full object-cover" />
                                        ) : (
                                            <Car className="h-5 w-5 text-muted-foreground/50" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-base">{vehicle.plate}</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">ID: {vehicle.internalId || '-'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm tracking-tight">{vehicle.brand} {vehicle.model}</span>
                                        <span className="text-xs text-muted-foreground font-medium italic">{vehicle.version || '-'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold capitalize">{vehicle.vehicleType}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">{vehicle.category}</span>
                                            <div className="flex items-center gap-1 ml-1">
                                                {vehicle.documentoUrl && (
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="w-3.5 h-3.5 rounded-full bg-success/20 flex items-center justify-center">
                                                                <FileText className="w-2 h-2 text-success" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-[10px]">Doc. Veículo Anexado</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {vehicle.category === 'Alugado' && (
                                                    <>
                                                        {vehicle.boletoUrl && (
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                        <CreditCard className="w-2 h-2 text-blue-500" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="text-[10px]">Boleto Anexado</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {vehicle.comprovanteUrl && (
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <div className="w-3.5 h-3.5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                                        <Receipt className="w-2 h-2 text-purple-500" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="text-[10px]">Comprovante Anexado</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(vehicle.status)}
                                </TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-success hover:bg-success/10"
                                                    onClick={() => {
                                                        setActiveVehicleId(vehicle.id);
                                                        fileInputRef.current?.click();
                                                    }}
                                                    disabled={uploadingId === vehicle.id}
                                                >
                                                    {uploadingId === vehicle.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Paperclip className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Anexar Foto do Documento</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={() => onEdit(vehicle)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Editar Veículo</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => onDelete(vehicle.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Excluir Veículo</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={() => onViewDetails(vehicle)}
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Ver Detalhes</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TooltipProvider>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,image/*"
                onChange={handleQuickUpload}
            />
        </div>
    );
}
