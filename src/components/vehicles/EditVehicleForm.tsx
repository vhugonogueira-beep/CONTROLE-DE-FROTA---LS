import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
} from '@/components/ui/dialog';
import { Vehicle } from '@/types/vehicle';

interface EditVehicleFormProps {
    vehicle: Vehicle | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: string, updates: Partial<Vehicle>) => void;
}

export function EditVehicleForm({ vehicle, open, onOpenChange, onUpdate }: EditVehicleFormProps) {
    const [formData, setFormData] = useState({
        internalId: '',
        plate: '',
        renavam: '',
        chassis: '',
        brand: '',
        model: '',
        version: '',
        manufacturingYear: '',
        modelYear: '',
        vehicleType: '',
        color: '',
        category: '' as Vehicle['category'],
        status: 'disponivel' as Vehicle['status'],
        imageUrl: '',
        documentoUrl: '',
        boletoUrl: '',
        comprovanteUrl: '',
        vencimentoBoleto: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [documentoFile, setDocumentoFile] = useState<File | null>(null);
    const [boletoFile, setBoletoFile] = useState<File | null>(null);
    const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                internalId: vehicle.internalId || '',
                plate: vehicle.plate || '',
                renavam: vehicle.renavam || '',
                chassis: vehicle.chassis || '',
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                version: vehicle.version || '',
                manufacturingYear: vehicle.manufacturingYear?.toString() || '',
                modelYear: vehicle.modelYear?.toString() || '',
                vehicleType: vehicle.vehicleType || '',
                color: vehicle.color || '',
                category: (vehicle.category || 'Operacional') as Vehicle['category'],
                status: vehicle.status || 'disponivel',
                imageUrl: vehicle.imageUrl || '',
                documentoUrl: vehicle.documentoUrl || '',
                boletoUrl: vehicle.boletoUrl || '',
                comprovanteUrl: vehicle.comprovanteUrl || '',
                vencimentoBoleto: vehicle.vencimentoBoleto || '',
            });
        }
    }, [vehicle]);

    const uploadFile = async (file: File, prefix: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `vehicles/${fileName}`;

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
        if (!vehicle) return;

        try {
            setIsUploading(true);
            let imageUrl = formData.imageUrl;
            let documentoUrl = formData.documentoUrl;
            let boletoUrl = formData.boletoUrl;
            let comprovanteUrl = formData.comprovanteUrl;

            if (imageFile) imageUrl = await uploadFile(imageFile, 'vehicle');
            if (documentoFile) documentoUrl = await uploadFile(documentoFile, 'doc');
            if (boletoFile) boletoUrl = await uploadFile(boletoFile, 'boleto');
            if (comprovanteFile) comprovanteUrl = await uploadFile(comprovanteFile, 'comprovante');

            onUpdate(vehicle.id, {
                ...formData,
                manufacturingYear: formData.manufacturingYear ? parseInt(formData.manufacturingYear) : null,
                modelYear: formData.modelYear ? parseInt(formData.modelYear) : null,
                imageUrl,
                documentoUrl,
                boletoUrl,
                comprovanteUrl,
                vencimentoBoleto: formData.vencimentoBoleto || null,
            });
            onOpenChange(false);
            setImageFile(null);
            setDocumentoFile(null);
            setBoletoFile(null);
            setComprovanteFile(null);
        } catch (error) {
            console.error('Error updating vehicle:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Veículo: {vehicle?.plate}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-plate">Placa</Label>
                            <Input
                                id="edit-plate"
                                value={formData.plate}
                                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                                placeholder="ABC1D23"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-internalId">ID Interno</Label>
                            <Input
                                id="edit-internalId"
                                value={formData.internalId}
                                onChange={(e) => setFormData({ ...formData, internalId: e.target.value })}
                                placeholder="Ex: V001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-brand">Marca</Label>
                            <Input
                                id="edit-brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="Ex: Volkswagen"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-model">Modelo</Label>
                            <Input
                                id="edit-model"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder="Ex: Saveiro"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-version">Versão</Label>
                            <Input
                                id="edit-version"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                placeholder="Ex: Robust"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-color">Cor</Label>
                            <Input
                                id="edit-color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="Ex: Branco"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-manufacturingYear">Ano Fabricação</Label>
                            <Input
                                id="edit-manufacturingYear"
                                type="number"
                                value={formData.manufacturingYear}
                                onChange={(e) => setFormData({ ...formData, manufacturingYear: e.target.value })}
                                placeholder="Ex: 2023"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-modelYear">Ano Modelo</Label>
                            <Input
                                id="edit-modelYear"
                                type="number"
                                value={formData.modelYear}
                                onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                                placeholder="Ex: 2024"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-renavam">Renavam</Label>
                            <Input
                                id="edit-renavam"
                                value={formData.renavam}
                                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                                placeholder="00000000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-chassis">Chassi (VIN)</Label>
                            <Input
                                id="edit-chassis"
                                value={formData.chassis}
                                onChange={(e) => setFormData({ ...formData, chassis: e.target.value.toUpperCase() })}
                                placeholder="00000000000000000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-vehicleType">Tipo de Veículo</Label>
                            <Select
                                value={formData.vehicleType}
                                onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                            >
                                <SelectTrigger id="edit-vehicleType">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="passeio">Passeio</SelectItem>
                                    <SelectItem value="utilitário">Utilitário</SelectItem>
                                    <SelectItem value="caminhão leve">Caminhão Leve</SelectItem>
                                    <SelectItem value="moto">Moto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Categoria</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger id="edit-category">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operacional">Operacional</SelectItem>
                                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                                    <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                                    <SelectItem value="Alugado">Alugado</SelectItem>
                                    <SelectItem value="Frota Própria">Frota Própria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: Vehicle['status']) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger id="edit-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="disponivel">Disponível</SelectItem>
                                    <SelectItem value="em_uso">Em Uso</SelectItem>
                                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                                    <SelectItem value="agendado">Agendado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {formData.category === 'Alugado' && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <Label className="text-xs uppercase font-bold text-primary flex items-center gap-2">
                                Anexação de Documentos (Aluguel)
                            </Label>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/60 flex items-center gap-2">
                                        Boleto de Pagamento
                                        {formData.boletoUrl && <span className="text-[8px] bg-success/20 text-success px-1 rounded">Anexado</span>}
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={(e) => setBoletoFile(e.target.files?.[0] || null)}
                                        className="h-10 text-[10px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/60 flex items-center gap-2">
                                        Comprovante de Pagamento
                                        {formData.comprovanteUrl && <span className="text-[8px] bg-success/20 text-success px-1 rounded">Anexado</span>}
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={(e) => setComprovanteFile(e.target.files?.[0] || null)}
                                        className="h-10 text-[10px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground/60">Data Vencimento Boleto</Label>
                                <Input
                                    type="date"
                                    value={formData.vencimentoBoleto}
                                    onChange={(e) => setFormData({ ...formData, vencimentoBoleto: e.target.value })}
                                    className="h-10 text-[10px]"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                            <Camera className="h-3 w-3" /> Foto do Veículo (Opcional)
                            {formData.imageUrl && <span className="text-[8px] bg-success/20 text-success px-1.5 rounded tracking-normal">Anexado</span>}
                        </Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {imageFile && <p className="text-[10px] mt-1 text-emerald-500 font-bold">Arquivo selecionado: {imageFile.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                            <Camera className="h-3 w-3" /> Foto do Documento Digital (Opcional)
                            {formData.documentoUrl && <span className="text-[8px] bg-success/20 text-success px-1.5 rounded tracking-normal">Anexado</span>}
                        </Label>
                        <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setDocumentoFile(e.target.files?.[0] || null)}
                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                        />
                        {documentoFile && <p className="text-[10px] mt-1 text-blue-500 font-bold">Arquivo selecionado: {documentoFile.name}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Atualizar Veículo'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
