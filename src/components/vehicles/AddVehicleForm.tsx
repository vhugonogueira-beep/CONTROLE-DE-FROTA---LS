import { useState } from 'react';
import { Plus, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
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
} from '@/components/ui/dialog';
import { Vehicle } from '@/types/vehicle';

interface AddVehicleFormProps {
    onAdd: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { imageUrl?: string }) => void;
}

export function AddVehicleForm({ onAdd }: AddVehicleFormProps) {
    const [open, setOpen] = useState(false);
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
        category: 'Operacional',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsUploading(true);
            let imageUrl = '';

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `vehicle_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `vehicles/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('fleet_photos')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('fleet_photos')
                    .getPublicUrl(filePath);

                imageUrl = data.publicUrl;
            }

            onAdd({
                ...formData,
                manufacturingYear: formData.manufacturingYear ? parseInt(formData.manufacturingYear) : null,
                modelYear: formData.modelYear ? parseInt(formData.modelYear) : null,
                imageUrl: imageUrl || undefined,
            });

            setFormData({
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
                category: 'Operacional',
            });
            setImageFile(null);
            setOpen(false);
        } catch (error) {
            console.error('Error adding vehicle:', error);
            // We could add a toast here, but useVehicles probably handles it or we can rely on parent
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Veículo
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plate">Placa</Label>
                            <Input
                                id="plate"
                                value={formData.plate}
                                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                                placeholder="ABC1D23"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="internalId">ID Interno</Label>
                            <Input
                                id="internalId"
                                value={formData.internalId}
                                onChange={(e) => setFormData({ ...formData, internalId: e.target.value })}
                                placeholder="Ex: V001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Marca</Label>
                            <Input
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="Ex: Volkswagen"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Modelo</Label>
                            <Input
                                id="model"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder="Ex: Saveiro"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="version">Versão</Label>
                            <Input
                                id="version"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                placeholder="Ex: Robust"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Cor</Label>
                            <Input
                                id="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="Ex: Branco"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="manufacturingYear">Ano Fabricação</Label>
                            <Input
                                id="manufacturingYear"
                                type="number"
                                value={formData.manufacturingYear}
                                onChange={(e) => setFormData({ ...formData, manufacturingYear: e.target.value })}
                                placeholder="Ex: 2023"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modelYear">Ano Modelo</Label>
                            <Input
                                id="modelYear"
                                type="number"
                                value={formData.modelYear}
                                onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                                placeholder="Ex: 2024"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="renavam">Renavam</Label>
                            <Input
                                id="renavam"
                                value={formData.renavam}
                                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                                placeholder="00000000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chassis">Chassi (VIN)</Label>
                            <Input
                                id="chassis"
                                value={formData.chassis}
                                onChange={(e) => setFormData({ ...formData, chassis: e.target.value.toUpperCase() })}
                                placeholder="00000000000000000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                            <Select
                                value={formData.vehicleType}
                                onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
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
                            <Label htmlFor="category">Categoria de Uso</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operacional">Operacional</SelectItem>
                                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                                    <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                            <Camera className="h-3 w-3" /> Foto do Veículo (Opcional)
                        </Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {imageFile && <p className="text-[10px] mt-1 text-emerald-500 font-bold">Arquivo selecionado: {imageFile.name}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Veículo'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
