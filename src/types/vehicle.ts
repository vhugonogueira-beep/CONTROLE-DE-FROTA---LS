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
    category: 'Operacional' | 'Administrativo' | 'Terceirizado' | 'Alugado' | 'Frota Própria';
    status: 'disponivel' | 'em_uso' | 'bloqueado' | 'agendado';
    imageUrl?: string;
    documentoUrl?: string; // PDF or Image
    boletoUrl?: string; // Only for Alugado
    comprovanteUrl?: string; // Only for Alugado
    vencimentoBoleto?: string; // ISO date string
    valorAluguel?: number; // Monthly rental value
    createdAt: string;
    updatedAt: string;
}
