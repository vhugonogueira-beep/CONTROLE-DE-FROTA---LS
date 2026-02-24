import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Vehicle } from '@/types/vehicle';
import { Separator } from '@/components/ui/separator';

interface VehicleDetailsDialogProps {
    vehicle: Vehicle | null;
    onClose: () => void;
}

export function VehicleDetailsDialog({ vehicle, onClose }: VehicleDetailsDialogProps) {
    if (!vehicle) return null;

    return (
        <Dialog open={!!vehicle} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Informações do Veículo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {vehicle.imageUrl && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden border bg-muted mb-4">
                            <img src={vehicle.imageUrl} alt={vehicle.plate} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Placa</p>
                            <p className="font-bold text-lg">{vehicle.plate}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">ID Interno</p>
                            <p className="font-medium">{vehicle.internalId || '-'}</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Veículo</p>
                        <p className="font-semibold text-base">{vehicle.brand} {vehicle.model} {vehicle.version}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Ano Fab./Mod.</p>
                            <p>{vehicle.manufacturingYear}/{vehicle.modelYear}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Cor</p>
                            <p>{vehicle.color || '-'}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Renavam</p>
                            <p className="font-mono text-sm">{vehicle.renavam || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Chassi (VIN)</p>
                            <p className="font-mono text-xs break-all">{vehicle.chassis || '-'}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Tipo</p>
                            <p className="capitalize">{vehicle.vehicleType}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Categoria</p>
                            <p>{vehicle.category}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
