import { Icon } from '@iconify/react';
import CardBox from 'src/components/shared/CardBox';

export interface ResumenCardData {
  key: string;
  titulo: string;
  valor: string;
  icono: string;
  moneda?: string;
  color: string;      // clase Tailwind ej: 'text-primary'
  bgColor: string;     // clase Tailwind ej: 'bg-primary/10'
}

interface ResumenCardsProps {
  data: ResumenCardData[];
  columns?: number;    // default 4
}

export const ResumenCards = ({ data, columns = 4 }: ResumenCardsProps) => {
  const colClass = columns === 2 ? 'lg:col-span-6' : columns === 3 ? 'lg:col-span-4' : 'lg:col-span-3';

  return (
    <div className="grid grid-cols-12 gap-6">
      {data.map((card) => (
        <div key={card.key} className={`col-span-12 sm:col-span-6 ${colClass}`}>
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">{card.titulo}</p>
                <div className="flex items-baseline gap-1 min-w-0">
                  {card.moneda && (
                    <span className="text-xs font-medium text-muted-foreground shrink-0">{card.moneda}</span>
                  )}
                  <h3 className={`font-bold truncate ${card.valor.length > 12 ? 'text-lg' : card.valor.length > 9 ? 'text-xl' : 'text-2xl'} ${card.color}`}>{card.valor}</h3>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon icon={card.icono} height={28} width={28} className={card.color} />
              </div>
            </div>
          </CardBox>
        </div>
      ))}
    </div>
  );
};
