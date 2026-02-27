import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FleetRecord } from '@/types/fleet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

// Extend jsPDF with autotable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

// Safely parse dates that may be in dd/MM/yyyy or ISO format
const safeParseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    // If it looks like dd/MM/yyyy
    const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
        return new Date(parseInt(brMatch[3]), parseInt(brMatch[2]) - 1, parseInt(brMatch[1]));
    }
    // Try ISO or other standard format
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
};

const safeFormatDate = (dateStr: string, fmt: string): string => {
    try {
        const d = safeParseDate(dateStr);
        return format(d, fmt, { locale: ptBR });
    } catch {
        return dateStr || '-';
    }
};

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return null;
    }
};

export const generateFleetReport = async (records: FleetRecord[]) => {
    try {
        const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(234, 56, 76); // Brand Color (Primary)
        doc.setFont('helvetica', 'bold');
        doc.text('LSI FLEET - RELATÓRIO DE VIAGENS', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth - 60, 20);

        doc.setDrawColor(234, 56, 76);
        doc.setLineWidth(0.5);
        doc.line(14, 25, pageWidth - 14, 25);

        const tableData = records.map(record => [
            record.veiculo,
            `${safeFormatDate(record.dataInicial, 'dd/MM/yy')} ${record.horarioInicial}`,
            record.status === 'finalizado' && record.dataFinal
                ? `${safeFormatDate(record.dataFinal, 'dd/MM/yy')} ${record.horarioFinal}`
                : 'Pendente',
            record.destino,
            record.responsavel,
            record.kmInicial,
            record.kmFinal || '-',
            record.status.toUpperCase()
        ]);

        doc.autoTable({
            startY: 35,
            head: [['Veículo', 'Saída', 'Retorno', 'Destino', 'Responsável', 'KM Ini', 'KM Fim', 'Status']],
            body: tableData,
            headStyles: { fillColor: [11, 15, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 35 },
            styles: { fontSize: 8, cellPadding: 3 },
        });

        // Photos Section (on a new page or after table)
        let currentY = (doc as any).lastAutoTable.finalY + 15;

        // Only show photos for the last 5 records to avoid huge PDF size
        const recordsWithPhotos = records
            .filter(r => r.fotoPainelInicialUrl || r.fotoPainelFinalUrl)
            .slice(0, 5);

        if (recordsWithPhotos.length > 0) {
            if (currentY > 150) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(16);
            doc.setTextColor(11, 15, 26);
            doc.text('GALERIA DE FOTOS (Últimos Registros)', 14, currentY);
            currentY += 10;

            for (const record of recordsWithPhotos) {
                if (currentY > 180) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(`${record.veiculo} - ${record.responsavel} (${safeFormatDate(record.dataInicial, 'dd/MM/yy')})`, 14, currentY);
                currentY += 5;

                let initialBase64 = null;
                let finalBase64 = null;

                try {
                    if (record.fotoPainelInicialUrl) {
                        initialBase64 = await getBase64ImageFromUrl(record.fotoPainelInicialUrl);
                    }
                    if (record.fotoPainelFinalUrl) {
                        finalBase64 = await getBase64ImageFromUrl(record.fotoPainelFinalUrl);
                    }

                    if (initialBase64) {
                        doc.addImage(initialBase64, 'JPEG', 14, currentY, 40, 30);
                        doc.setFontSize(8);
                        doc.text('Painel Inicial', 14, currentY + 35);
                    }

                    if (finalBase64) {
                        doc.addImage(finalBase64, 'JPEG', 60, currentY, 40, 30);
                        doc.setFontSize(8);
                        doc.text('Painel Final', 60, currentY + 35);
                    }

                    if (initialBase64 || finalBase64) {
                        currentY += 45;
                    } else {
                        currentY += 5;
                    }
                } catch (imgError) {
                    console.error('Error adding image to PDF:', imgError);
                    doc.setFontSize(8);
                    doc.setTextColor(150, 0, 0);
                    doc.text('Erro ao carregar fotos deste registro', 14, currentY);
                    currentY += 10;
                    doc.setTextColor(11, 15, 26);
                }
            }
        }

        doc.save(`relatorio-frota-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

export const generateExcelReport = (records: FleetRecord[]) => {
    try {
        const data = records.map(record => ({
            'Veículo': record.veiculo,
            'Responsável': record.responsavel,
            'Data Saída': safeFormatDate(record.dataInicial, 'dd/MM/yyyy'),
            'Hora Saída': record.horarioInicial,
            'Data Retorno': record.status === 'finalizado' && record.dataFinal ? safeFormatDate(record.dataFinal, 'dd/MM/yyyy') : 'Pendente',
            'Hora Retorno': record.horarioFinal || '-',
            'Destino': record.destino,
            'KM Inicial': record.kmInicial,
            'KM Final': record.kmFinal || '-',
            'KM Rodado': record.kmFinal ? record.kmFinal - record.kmInicial : 0,
            'Atividade': record.atividade,
            'Área': (record as any).area || '-',
            'Status': record.status.toUpperCase(),
            'Tanque': record.tanque || '-',
            'Lavagem': record.lavagem || '-',
            'Estacionamento': record.andarEstacionado || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Frota');

        // Adjust column widths
        const wscols = [
            { wch: 20 }, // Veículo
            { wch: 20 }, // Responsável
            { wch: 15 }, // Data Saída
            { wch: 10 }, // Hora Saída
            { wch: 15 }, // Data Retorno
            { wch: 10 }, // Hora Retorno
            { wch: 20 }, // Destino
            { wch: 10 }, // KM Inicial
            { wch: 10 }, // KM Final
            { wch: 10 }, // KM Rodado
            { wch: 30 }, // Atividade
            { wch: 15 }, // Área
            { wch: 12 }, // Status
            { wch: 10 }, // Tanque
            { wch: 10 }, // Lavagem
            { wch: 15 }, // Estacionamento
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `relatorio-frota-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    } catch (error) {
        console.error('Error generating Excel:', error);
        throw error;
    }
};
