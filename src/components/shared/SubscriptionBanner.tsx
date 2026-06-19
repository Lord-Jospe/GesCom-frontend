import { useEffect, useState } from 'react';
import { empresaService } from 'src/api/services/empresaService';
import { useAuth } from 'src/context/AuthContext';
import type { SuscripcionResponse } from 'src/types/empresa';
import { Icon } from '@iconify/react';
import { X } from 'lucide-react';

const SubscriptionBanner = () => {
  const { user } = useAuth();
  const [sub, setSub] = useState<SuscripcionResponse | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user?.rol === 'ADMIN') {
      empresaService.obtenerSuscripcion().then(setSub).catch(() => {});
    }
  }, [user]);

  if (!sub || dismissed || user?.rol !== 'ADMIN') return null;

  const hoy = new Date();
  const vence = new Date(sub.fechaVence + 'T23:59:59');
  const dias = Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired = sub.estado === 'VENCIDA' || dias < 0;
  const isWarning = !isExpired && dias <= 7;
  const isInfo = !isExpired && dias <= 15;

  const bg = isExpired ? 'bg-destructive/90' : isWarning ? 'bg-warning/90' : isInfo ? 'bg-info/90' : 'bg-success/80';
  const text = 'text-white';

  return (
    <div className={`${bg} ${text} px-4 py-2 text-sm flex items-center justify-center gap-2 relative`}>
      <Icon
        icon={isExpired ? 'solar:danger-triangle-bold' : isWarning ? 'solar:clock-circle-bold' : 'solar:crown-bold'}
        width={16}
      />
      <span className="font-medium">
        {isExpired
          ? `Tu suscripción venció. Renueva el plan ${sub.planNombre} para continuar.`
          : isWarning
          ? `Plan ${sub.planNombre} — vence en ${dias} día${dias !== 1 ? 's' : ''}.`
          : isInfo
          ? `Plan ${sub.planNombre} — ${dias} días restantes.`
          : `Plan ${sub.planNombre} activo — ${dias} día${dias !== 1 ? 's' : ''} restantes.`}
        {sub.maxTransaccionesMes > 0 && ` · ${sub.maxTransaccionesMes} transacciones/mes`}
        {sub.maxArchivosMes > 0 && ` · ${sub.maxArchivosMes} archivos/mes`}
        {!sub.tieneInventario && ' · Sin inventario'}
        {!sub.tieneContabilidad && ' · Sin contabilidad'}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 opacity-70 hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

export default SubscriptionBanner;
