import { useEffect, useState } from "react";
import { usuariosServices } from "src/api/services/usuarioService";
import { UsuarioResponse } from "src/types/usuario";
import { UsuariosTable } from "src/components/utilities/table/DataTable";

const EmpleadosPage = () => {

  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosServices.getAllUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona los usuarios de tu empresa</p>
      </div>

      <UsuariosTable
        data={usuarios}
        onEditar={(u) => console.log('editar', u)}
        onToggleEstado={(u) => console.log('toggle', u)}
      />

    </div>
  );
};

export default EmpleadosPage;