import { useState } from 'react';
import { Car, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVehicles } from '@/hooks/useVehicles';
import { AddVehicleForm } from '@/components/vehicles/AddVehicleForm';
import { EditVehicleForm } from '@/components/vehicles/EditVehicleForm';
import { VehiclesTable } from '@/components/vehicles/VehiclesTable';
import { VehicleDetailsDialog } from '@/components/vehicles/VehicleDetailsDialog';
import { Vehicle } from '@/types/vehicle';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Vehicles = () => {
    const { vehicles, loading, error, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleAddVehicle = async (newVehicle: Parameters<typeof addVehicle>[0]) => {
        try {
            await addVehicle(newVehicle);
            toast({
                title: 'Veículo cadastrado!',
                description: 'O veículo foi salvo com sucesso.',
            });
        } catch (err) {
            toast({
                title: 'Erro ao cadastrar',
                description: 'Não foi possível salvar o veículo.',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateVehicle = async (id: string, updates: Partial<Vehicle>) => {
        try {
            await updateVehicle(id, updates);
            toast({
                title: 'Veículo atualizado!',
                description: 'As informações foram salvas com sucesso.',
            });
        } catch (err) {
            toast({
                title: 'Erro ao atualizar',
                description: 'Não foi possível salvar as alterações.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteVehicle = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) return;

        try {
            await deleteVehicle(id);
            toast({
                title: 'Veículo excluído',
                description: 'O veículo foi removido com sucesso.',
            });
        } catch (err) {
            toast({
                title: 'Erro ao excluir',
                description: 'Não foi possível remover o veículo.',
                variant: 'destructive',
            });
        }
    };

    const handleEditClick = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsEditOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header with LS Office Branding - Centered for Premium Look */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container relative flex h-20 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white border border-border shadow-sm cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/logo.jpg" alt="LS Office Logo" className="h-full w-full object-contain" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-black leading-none tracking-tight uppercase">Garagem</h1>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">LS OFFICE • Frota</p>
                        </div>
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
                        <h2 className="text-2xl font-black tracking-tighter text-primary leading-none uppercase">LS OFFICE</h2>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] mt-1 hidden md:block">
                            Serviços de Telecom e Construções
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hidden sm:flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
                            Início
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container py-8 space-y-8">
                {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive font-medium">
                        {error}
                    </div>
                )}

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight uppercase">Gestão da Frota</h2>
                            <p className="text-sm text-muted-foreground font-medium italic">Gerencie os veículos e seus estados operacionais.</p>
                        </div>
                        <AddVehicleForm onAdd={handleAddVehicle} />
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="all" className="font-bold text-xs uppercase">Todos ({vehicles.length})</TabsTrigger>
                            <TabsTrigger value="propria" className="font-bold text-xs uppercase">Frota Própria ({vehicles.filter(v => v.category === 'Frota Própria').length})</TabsTrigger>
                            <TabsTrigger value="alugado" className="font-bold text-xs uppercase">Alugados ({vehicles.filter(v => v.category === 'Alugado').length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-0">
                            {vehicles.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-16 text-center bg-muted/20">
                                    <Car className="mx-auto h-12 w-12 text-muted-foreground/30" />
                                    <h3 className="mt-4 text-xl font-bold uppercase tracking-tight">Nenhum veículo encontrado</h3>
                                    <p className="mt-2 text-sm text-muted-foreground font-medium">
                                        Cadastre novos veículos para iniciar o monitoramento profissional.
                                    </p>
                                </div>
                            ) : (
                                <VehiclesTable
                                    vehicles={vehicles}
                                    onViewDetails={setSelectedVehicle}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteVehicle}
                                    onUpdate={handleUpdateVehicle}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="propria" className="mt-0">
                            <VehiclesTable
                                vehicles={vehicles.filter(v => v.category === 'Frota Própria')}
                                onViewDetails={setSelectedVehicle}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteVehicle}
                                onUpdate={handleUpdateVehicle}
                            />
                        </TabsContent>

                        <TabsContent value="alugado" className="mt-0">
                            <VehiclesTable
                                vehicles={vehicles.filter(v => v.category === 'Alugado')}
                                onViewDetails={setSelectedVehicle}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteVehicle}
                                onUpdate={handleUpdateVehicle}
                            />
                        </TabsContent>
                    </Tabs>
                </section>
            </main>

            <VehicleDetailsDialog
                vehicle={selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
            />

            <EditVehicleForm
                vehicle={editingVehicle}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onUpdate={handleUpdateVehicle}
            />
        </div>
    );
};

export default Vehicles;
