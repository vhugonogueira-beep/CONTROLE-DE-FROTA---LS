import { CheckCircle2, XCircle, Fuel, ParkingCircle, Ban, PlayCircle, Info, Clock, Sparkles, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types/vehicle';
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
  vehicles: Vehicle[];
  onFinish: (id: string, veiculo: string) => void;
  onCancel: (id: string, veiculo: string) => void;
  onStart: (id: string, veiculo: string) => void;
  onViewDetails: (record: FleetRecord) => void;
  onDelete: (id: string, veiculo: string) => void;
  onEdit: (record: FleetRecord) => void;
}

export function FleetTable({ records, vehicles, onFinish, onCancel, onStart, onViewDetails, onDelete, onEdit }: FleetTableProps) {
  const formatDate = (date: string) => {
    // Parse as local date to avoid timezone conversion issues
    // Input format: YYYY-MM-DD
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: FleetRecord['status']) => {
    const variants = {
      em_andamento: { icon: PlayCircle, className: 'bg-primary/20 text-primary animate-pulse', label: 'Em Uso' },
      finalizado: { icon: CheckCircle2, className: 'bg-success/20 text-success', label: 'Finalizado' },
      cancelado: { icon: Ban, className: 'bg-muted text-muted-foreground', label: 'Cancelado' },
      agendado: { icon: Clock, className: 'bg-amber-500/20 text-amber-600', label: 'Agendado' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`h-6 w-6 p-0 flex items-center justify-center rounded-full border-0 ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Status: {config.label}</TooltipContent>
      </Tooltip>
    );
  };

  const getLavagemBadge = (lavagem: FleetRecord['lavagem']) => {
    const isPendente = lavagem === 'pendente';
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`h-6 w-6 p-0 flex items-center justify-center rounded-full border-0 ${isPendente ? 'bg-amber-500/20 text-amber-600' : 'bg-success/20 text-success'}`}>
            <Sparkles className="h-3 w-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{lavagem === 'pendente' ? 'Lavagem Pendente' : 'Lavagem Realizada'}</TooltipContent>
      </Tooltip>
    );
  };

  const getTanqueBadge = (tanque: FleetRecord['tanque']) => {
    const variants = {
      cheio: { className: 'bg-success/20 text-success', label: 'Tanque: Cheio' },
      necessario_abastecer: { className: 'bg-destructive/20 text-destructive', label: 'Necessário Abastecer' },
      meio_tanque: { className: 'bg-warning/20 text-warning', label: '1/2 Tanque' },
    };
    const variant = variants[tanque];
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`h-6 w-6 p-0 flex items-center justify-center rounded-full border-0 ${variant.className}`}>
            <Fuel className="h-3 w-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{variant.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">STATUS</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">VEÍCULO</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">RESPONSÁVEL</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">ATIVIDADE</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">PERÍODO</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">KM</span>
                </TooltipTrigger>
                <TooltipContent>Quilometragem (Inicial / Final)</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">PEND.</span>
                </TooltipTrigger>
                <TooltipContent>Pendências de Abastecimento e Limpeza</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">ESTAC.</span>
                </TooltipTrigger>
                <TooltipContent>Estacionamento</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider h-9 text-center">AÇÕES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow
              key={record.id}
              className="animate-fade-in group border-b hover:bg-muted/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="py-1.5 text-center">
                <div className="flex justify-center">
                  {getStatusBadge(record.status)}
                </div>
              </TableCell>
              <TableCell className="py-1.5 text-center">
                <div className="flex flex-col items-center justify-center">
                  {(() => {
                    const recVeiculo = record.veiculo?.toUpperCase().trim() || "";
                    const vehicle = vehicles.find(v => {
                      const vPlate = v.plate?.toUpperCase().trim();
                      const vModel = v.model?.toUpperCase().trim();
                      const vBrandModel = `${v.brand} ${v.model}`.toUpperCase().trim();
                      return vPlate === recVeiculo || vModel === recVeiculo || vBrandModel === recVeiculo;
                    });

                    if (vehicle) {
                      return (
                        <div className="flex flex-col items-center leading-tight">
                          <span className="font-bold text-[11px] uppercase tracking-tighter">
                            {vehicle.model}
                          </span>
                          <span className="text-[9px] italic text-primary/60 font-semibold">
                            {vehicle.plate}
                          </span>
                        </div>
                      );
                    }
                    return <span className="font-bold text-[11px] uppercase tracking-tighter">{record.veiculo}</span>;
                  })()}
                </div>
              </TableCell>
              <TableCell className="py-1.5 text-center">
                <span className="font-semibold text-[11px]">{record.responsavel}</span>
              </TableCell>
              <TableCell className="max-w-[150px] py-1.5 text-center px-2">
                <span className="text-[10px] leading-snug text-muted-foreground break-words block line-clamp-2">{record.atividade}</span>
              </TableCell>
              <TableCell className="py-1.5 text-center">
                <div className="flex flex-col items-center text-[9px] leading-tight space-y-0.5 whitespace-nowrap">
                  <div className="flex items-center gap-1 font-bold text-muted-foreground/80 uppercase">
                    <span className="text-[8px] opacity-50">SAÍDA:</span>
                    <span>{formatDate(record.dataInicial)}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{record.horarioInicial}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-primary uppercase border-t border-border/30 pt-1 mt-1">
                    <span className="text-[8px] opacity-70">RETORNO:</span>
                    <span>{record.dataFinal ? formatDate(record.dataFinal) : '--/--'}</span>
                    <span className="text-primary/40">•</span>
                    <span>{record.horarioFinal || '--:--'}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-1.5 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center justify-center font-mono text-[11px] leading-tight cursor-help">
                      <span className="text-muted-foreground/70">{record.kmInicial}</span>
                      <span className="text-muted-foreground/40 leading-[0.5]">↓</span>
                      <span className={record.status === 'finalizado' ? 'font-bold text-primary' : 'text-muted-foreground/30 italic'}>
                        {record.status === 'finalizado' ? record.kmFinal : '---'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>KM Inicial: {record.kmInicial} {record.status === 'finalizado' ? `| KM Final: ${record.kmFinal}` : ''}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="py-1.5">
                <div className="flex items-center gap-1.5 justify-center">
                  {getTanqueBadge(record.tanque)}
                  {getLavagemBadge(record.lavagem)}
                </div>
              </TableCell>
              <TableCell className="py-1.5 px-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold cursor-help bg-primary/5 py-1 px-2 rounded-lg border border-primary/10">
                      <ParkingCircle className="h-3.5 w-3.5 text-primary" />
                      <span>{record.andarEstacionado}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Local de Estacionamento: {record.andarEstacionado}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="py-1.5 px-1 text-center">
                <div className="flex justify-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500 bg-blue-500/5 hover:text-blue-600 hover:bg-blue-500/20 border border-blue-500/10"
                        onClick={() => onViewDetails(record)}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Detalhes da Viagem</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-amber-600 bg-amber-500/5 hover:text-amber-700 hover:bg-amber-500/20 border border-amber-500/10"
                        onClick={() => onEdit(record)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar Registro</TooltipContent>
                  </Tooltip>

                  {record.status === 'agendado' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-amber-500 bg-amber-500/5 hover:text-amber-600 hover:bg-amber-500/20 border border-amber-500/10"
                          onClick={() => onStart(record.id, record.veiculo)}
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Iniciar Viagem</TooltipContent>
                    </Tooltip>
                  )}

                  {record.status === 'em_andamento' && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-success bg-success/5 hover:text-success/80 hover:bg-success/20 border border-success/10"
                            onClick={() => onFinish(record.id, record.veiculo)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Finalizar Uso</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive bg-destructive/5 hover:text-destructive/80 hover:bg-destructive/20 border border-destructive/10"
                            onClick={() => onCancel(record.id, record.veiculo)}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancelar Viagem</TooltipContent>
                      </Tooltip>
                    </>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground bg-muted/20 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/10"
                        onClick={() => onDelete(record.id, record.veiculo)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir Registro</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

