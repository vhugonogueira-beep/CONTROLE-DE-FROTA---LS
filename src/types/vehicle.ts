export interface Vehicle {
    id: string;
    internalId: string | null;
    plate: string;
    renavam: string | null;
    chassis: string | null;
    brand: string;
    model: string;
    version: string | null;
    manufacturingYear: number | null;
    modelYear: number | null;
    vehicleType: string;
    color: string | null;
    category: string;
    status: 'disponivel' | 'em_uso' | 'bloqueado';
    createdAt: string;
    updatedAt: string;
}
