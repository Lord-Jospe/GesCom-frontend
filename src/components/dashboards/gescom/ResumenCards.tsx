import { Icon } from '@iconify/react';
import CardBox from 'src/components/shared/CardBox';
import { Tooltip, TooltipContent, TooltipTrigger } from 'src/components/ui/tooltip';

export interface ResumenCardData {
  key: string;
  titulo: string;
  valor: string;
  icono: string;
  moneda?: string;
  color: string;
  bgColor: string;
}

interface ResumenCardsProps {
  data: ResumenCardData[];
  columns?: number;
}

export const ResumenCards = ({ data, columns = 4 }: ResumenCardsProps) => {
  const colClass = columns === 2 ? 'lg:col-span-6' : columns === 3 ? 'lg:col-span-4' : 'lg:col-span-3';

  return (
    <div className="grid grid-cols-12 gap-6">
      {data.map((card) => (
        <div key={card.key} className={`col-span-12 sm:col-span-6 ${colClass}`}>
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">{card.titulo}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-baseline gap-1 min-w-0 cursor-default">
                      {card.moneda && <span className="text-[10px] font-medium text-muted-foreground shrink-0">{card.moneda}</span>}
                      <h3 className={`font-bold truncate text-lg ${card.color}`}>{card.valor}</h3>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-sm font-mono">
                    {card.valor}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className={`p-2.5 rounded-lg shrink-0 ${card.bgColor}`}>
                <Icon icon={card.icono} height={24} width={24} className={card.color} />
              </div>
            </div>
          </CardBox>
        </div>
      ))}
    </div>
  );
};
