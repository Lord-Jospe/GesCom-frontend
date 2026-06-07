import { useCallback, useEffect, useMemo, useState } from 'react';
import { usuariosServices } from 'src/api/services/usuarioService';
import type { UsuarioResponse } from 'src/types/usuario';
import { UsuariosTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select';
import { Icon } from '@iconify/react';
import CrearUsuarioDialog from './CrearUsuarioDialog';
import EditarUsuarioDialog from './EditarUsuarioDialog';
import ConfirmarToggleDialog from './ConfirmarToggleDialog';

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

const EmpleadosPage = () => {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');

  // diálogos
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioResponse | null>(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usuariosServices.getAllUsuarios();
      setUsuarios(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const usuariosFiltrados = useMemo(() => {
    if (filtroEstado === 'todos') return usuarios;
    return usuarios.filter((u) => filtroEstado === 'activos' ? u.activo : !u.activo);
  }, [usuarios, filtroEstado]);

  const handleEditar = (usuario: UsuarioResponse) => {
    setUsuarioSeleccionado(usuario);
    setOpenEditar(true);
  };

  const handleToggle = (usuario: UsuarioResponse) => {
    setUsuarioSeleccionado(usuario);
    setOpenToggle(true);
  };

  const handleUsuarioCreado = () => {
    cargarUsuarios();
  };

  const handleUsuarioEditado = () => {
    cargarUsuarios();
  };

  const handleUsuarioToggleado = () => {
    cargarUsuarios();
  };

  if (error && usuarios.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">Gestiona los empleados de tu empresa</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
          {error}
          <button
            className="ml-4 underline hover:no-underline"
            onClick={cargarUsuarios}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">Gestiona los empleados y usuarios de tu empresa</p>
        </div>
        <Button onClick={() => setOpenCrear(true)} className="flex items-center gap-2">
          <Icon icon="solar:user-plus-linear" height={18} width={18} />
          Nuevo empleado
        </Button>
      </div>

      {/* Filtro de estado */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Mostrar:</span>
        <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as FiltroEstado)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon icon="svg-spinners:180-ring" height={32} width={32} className="text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Cargando empleados...</span>
        </div>
      ) : (
        <UsuariosTable
          data={usuariosFiltrados}
          onEditar={handleEditar}
          onToggleEstado={handleToggle}
        />
      )}

      {/* Diálogos */}
      <CrearUsuarioDialog
        open={openCrear}
        onOpenChange={setOpenCrear}
        onCreado={handleUsuarioCreado}
      />
      <EditarUsuarioDialog
        open={openEditar}
        onOpenChange={setOpenEditar}
        onEditado={handleUsuarioEditado}
        usuario={usuarioSeleccionado}
      />
      <ConfirmarToggleDialog
        open={openToggle}
        onOpenChange={setOpenToggle}
        onToggleado={handleUsuarioToggleado}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
};

export default EmpleadosPage;
