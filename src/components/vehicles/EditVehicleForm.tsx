import { useState, useEffect } from 'react';
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
        category: '',
        status: 'active' as 'active' | 'inactive',
    });

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
                category: vehicle.category || '',
                status: vehicle.status || 'active',
            });
        }
    }, [vehicle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicle) return;

        onUpdate(vehicle.id, {
            ...formData,
            manufacturingYear: formData.manufacturingYear ? parseInt(formData.manufacturingYear) : null,
            modelYear: formData.modelYear ? parseInt(formData.modelYear) : null,
        });
        onOpenChange(false);
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
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger id="edit-category">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operacional">Operacional</SelectItem>
                                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                                    <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger id="edit-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Atualizar Veículo</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
