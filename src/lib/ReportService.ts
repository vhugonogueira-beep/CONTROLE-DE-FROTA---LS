import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FleetRecord } from '@/types/fleet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Extend jsPDF with autotable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    try {
        const response = await fetch(imageUrl);
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
        `${format(new Date(record.dataInicial), 'dd/MM/yy')} ${record.horarioInicial}`,
        record.status === 'finalizado' && record.dataFinal
            ? `${format(new Date(record.dataFinal), 'dd/MM/yy')} ${record.horarioFinal}`
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

    if (currentY > 150) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(11, 15, 26);
    doc.text('GALERIA DE FOTOS (Últimos Registros)', 14, currentY);
    currentY += 10;

    // Only show photos for the last 5 records to avoid huge PDF size
    const recordsWithPhotos = records
        .filter(r => r.fotoPainelInicialUrl || r.fotoPainelFinalUrl)
        .slice(0, 5);

    for (const record of recordsWithPhotos) {
        if (currentY > 180) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${record.veiculo} - ${record.responsavel} (${format(new Date(record.dataInicial), 'dd/MM/yy')})`, 14, currentY);
        currentY += 5;

        let initialBase64 = null;
        let finalBase64 = null;

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
    }

    doc.save(`relatorio-frota-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
};
