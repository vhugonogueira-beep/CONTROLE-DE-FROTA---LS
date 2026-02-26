import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Vehicle } from '@/types/vehicle';
import { Separator } from '@/components/ui/separator';
import { FileText, CreditCard, Receipt, Download, Calendar } from 'lucide-react';

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
                        <div className="w-full aspect-video rounded-xl overflow-hidden border bg-muted mb-2">
                            <img src={vehicle.imageUrl} alt={vehicle.plate} className="w-full h-full object-cover" />
                            <p className="text-[9px] text-center text-muted-foreground uppercase font-bold mt-1">Foto do Veículo</p>
                        </div>
                    )}
                    {vehicle.documentoUrl && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden border bg-muted mb-4">
                            <img src={vehicle.documentoUrl} alt={`Documento ${vehicle.plate}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="h-full flex flex-col items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><a href="' + vehicle.documentoUrl + '" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-blue-500 underline">Abrir Documento</a></div>'; }} />
                            <p className="text-[9px] text-center text-muted-foreground uppercase font-bold mt-1">Foto do Documento Digital</p>
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
                            <p className="font-bold text-primary">{vehicle.category}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground uppercase font-black flex items-center gap-2">
                            Documentos e Anexos
                        </p>

                        <div className="space-y-2">
                            {vehicle.documentoUrl ? (
                                <a
                                    href={vehicle.documentoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-success" />
                                        <span className="text-xs font-bold uppercase">Foto do Documento Digital</span>
                                    </div>
                                    <Download className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                </a>
                            ) : (
                                <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed text-muted-foreground">
                                    <FileText className="h-4 w-4 opacity-50" />
                                    <span className="text-[10px] font-bold uppercase italic">Sem foto do documento</span>
                                </div>
                            )}

                            {vehicle.category === 'Alugado' && (
                                <>
                                    <div className="pt-2">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black mb-2">Controle Financeiro (Aluguel)</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {vehicle.vencimentoBoleto && (
                                                <div className="flex items-center justify-between p-2 rounded-lg border bg-blue-500/5">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                        <span className="text-xs font-bold uppercase">Vencimento</span>
                                                    </div>
                                                    <span className="text-xs font-black text-blue-600">
                                                        {new Date(vehicle.vencimentoBoleto).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            )}

                                            {vehicle.boletoUrl ? (
                                                <a
                                                    href={vehicle.boletoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4 text-primary" />
                                                        <span className="text-xs font-bold uppercase">Boleto de Pagamento</span>
                                                    </div>
                                                    <Download className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed text-muted-foreground">
                                                    <CreditCard className="h-4 w-4 opacity-50" />
                                                    <span className="text-[10px] font-bold uppercase italic">Boleto não anexado</span>
                                                </div>
                                            )}

                                            {vehicle.comprovanteUrl ? (
                                                <a
                                                    href={vehicle.comprovanteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Receipt className="h-4 w-4 text-purple-500" />
                                                        <span className="text-xs font-bold uppercase">Comprovante</span>
                                                    </div>
                                                    <Download className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed text-muted-foreground">
                                                    <Receipt className="h-4 w-4 opacity-50" />
                                                    <span className="text-[10px] font-bold uppercase italic">Sem comprovante</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
