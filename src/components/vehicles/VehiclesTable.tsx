import { Car, Info, Edit, Trash2, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
}

export function VehiclesTable({ vehicles, onViewDetails, onEdit, onDelete }: VehiclesTableProps) {
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
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{vehicle.category}</span>
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
        </div>
    );
}
