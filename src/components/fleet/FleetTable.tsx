import { CheckCircle2, XCircle, Fuel, ParkingCircle, Ban, PlayCircle, Info, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FleetRecord } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FleetTableProps {
  records: FleetRecord[];
  onFinish: (id: string, veiculo: string) => void;
  onCancel: (id: string, veiculo: string) => void;
  onViewDetails: (record: FleetRecord) => void;
}

export function FleetTable({ records, onFinish, onCancel, onViewDetails }: FleetTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: FleetRecord['status']) => {
    switch (status) {
      case 'em_andamento':
        return (
          <Badge className="bg-primary/20 text-primary border-0 animate-pulse">
            <PlayCircle className="mr-1 h-3 w-3" />
            Em Uso
          </Badge>
        );
      case 'finalizado':
        return (
          <Badge className="bg-success/20 text-success border-0">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Finalizado
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-muted text-muted-foreground border-0">
            <Ban className="mr-1 h-3 w-3" />
            Cancelado
          </Badge>
        );
      case 'agendado':
        return (
          <Badge className="bg-amber-500/20 text-amber-600 border-0">
            <Clock className="mr-1 h-3 w-3" />
            Agendado
          </Badge>
        );
    }
  };

  const getLavagemBadge = (lavagem: FleetRecord['lavagem']) => {
    if (lavagem === 'realizada') {
      return (
        <Badge className="bg-success/20 text-success hover:bg-success/30 border-0 h-6">
          Realizada
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-warning/50 text-warning h-6">
        Pendente
      </Badge>
    );
  };

  const getTanqueBadge = (tanque: FleetRecord['tanque']) => {
    const variants = {
      cheio: { className: 'bg-success/20 text-success', label: 'Cheio' },
      necessario_abastecer: { className: 'bg-destructive/20 text-destructive', label: 'Abastecer' },
      meio_tanque: { className: 'bg-warning/20 text-warning', label: '1/2 Tanque' },
    };
    const variant = variants[tanque];
    return (
      <Badge className={`${variant.className} hover:opacity-80 border-0 h-6`}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
              <TableHead className="font-bold text-xs uppercase tracking-wider h-10">Status / Veículo</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider h-10">Responsável / Atividade</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider h-10">Período</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider h-10">KM (Ini → Fim)</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider h-10">Pendências</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider h-10">Local</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider h-10 text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow
                key={record.id}
                className={`animate-fade-in group border-b ${record.status === 'cancelado' ? 'opacity-60 bg-muted/10' : 'hover:bg-muted/20'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    {getStatusBadge(record.status)}
                    <span className="font-bold text-base leading-tight">{record.veiculo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{record.responsavel}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{record.atividade}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs space-y-0.5">
                    <span className="font-medium text-muted-foreground">Saída: {formatDate(record.dataInicial)} {record.horarioInicial}</span>
                    {record.status === 'finalizado' && (
                      <span className="font-medium text-primary-vibrant">Chegada: {formatDate(record.dataFinal)} {record.horarioFinal}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-muted-foreground">{record.kmInicial}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={record.status === 'finalizado' ? 'font-bold text-primary' : 'text-muted-foreground/50 italic'}>
                      {record.status === 'finalizado' ? record.kmFinal : '...'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getTanqueBadge(record.tanque)}
                    {getLavagemBadge(record.lavagem)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <ParkingCircle className="h-4 w-4 text-primary/60" />
                    <span>Andar {record.andarEstacionado}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => onViewDetails(record)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Detalhes da Viagem</TooltipContent>
                    </Tooltip>

                    {record.status === 'em_andamento' && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-success hover:text-success hover:bg-success/10"
                              onClick={() => onFinish(record.id, record.veiculo)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Finalizar Uso</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onCancel(record.id, record.veiculo)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancelar Viagem</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
}
