import { useEffect, useState } from 'react';
import { empresaService } from 'src/api/services/empresaService';
import type { SuscripcionResponse } from 'src/types/empresa';

export const useSubscription = () => {
  const [sub, setSub] = useState<SuscripcionResponse | null>(null);

  useEffect(() => {
    empresaService.obtenerSuscripcion().then(setSub).catch(() => {});
  }, []);

  return sub;
};
