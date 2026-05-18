import { Icon } from '@iconify/react/dist/iconify.js';
import { useState, useEffect } from 'react';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import {
    Dialog, DialogContent,
    DialogFooter, DialogHeader, DialogTitle,
} from 'src/components/ui/dialog';
import { Label }  from 'src/components/ui/label';
import { Input }  from 'src/components/ui/input';
import { useAuth } from 'src/context/AuthContext';
import perfilService from 'src/api/services/perfilService';
import {
    EditarPerfilRequest,
    EmpresaPerfilResponse,
    UsuarioPerfilResponse,
} from 'src/types/auth/auth.types';
import { toast } from 'sonner';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Mi Perfil' },
];

const UserProfile = () => {
    const { user } = useAuth();

    const [usuario, setUsuario] = useState<UsuarioPerfilResponse | null>(null);
    const [empresa, setEmpresa] = useState<EmpresaPerfilResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [saving, setSaving] = useState(false);

    const [formError, setFormError] = useState('');


    // FORMULARIO INLINE
    const [formData, setFormData] = useState<EditarPerfilRequest>({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        email: '',
    });


    // MODAL CONTRASEÑA
    const [openModal, setOpenModal] = useState(false);

    const [tempForm, setTempForm] = useState({
        password: '',
        confirmarPassword: '',
    });


    // ─────────────────────────────────────────────
    // CARGAR PERFIL
    // ─────────────────────────────────────────────
    useEffect(() => {
        const cargar = async () => {
            try {
                const [u, e] = await Promise.all([
                    perfilService.obtenerUsuario(),
                    perfilService.obtenerEmpresa(),
                ]);

                setUsuario(u);
                setEmpresa(e);

                // cargar datos al formulario
                setFormData({
                    primerNombre: u.primerNombre || '',
                    segundoNombre: u.segundoNombre || '',
                    primerApellido: u.primerApellido || '',
                    segundoApellido: u.segundoApellido || '',
                    email: u.email || '',
                });

            } catch (error) {
                setError('Error al cargar los datos del perfil');
            } finally {
                setLoading(false);
            }
        };

        cargar();
    }, []);


    // ─────────────────────────────────────────────
    // GUARDAR CAMBIOS INLINE
    // ─────────────────────────────────────────────
    const guardarCambios = async () => {
        try {
            setSaving(true);
            setFormError('');

            const actualizado = await perfilService.editarPerfil(formData);

            // refresca la UI
            setUsuario(actualizado);
            toast.success('Perfil actualizado correctamente');

        } catch (error: any) {
            toast.error(
                typeof error === 'string'
                    ? error
                    : 'Error al actualizar el perfil'
            );

        } finally {
            setSaving(false);
        }
    };


    // ─────────────────────────────────────────────
    // MODAL CAMBIAR CONTRASEÑA
    // ─────────────────────────────────────────────
    const abrirModalPassword = () => {
        setTempForm({
            password: '',
            confirmarPassword: '',
        });

        setFormError('');
        setOpenModal(true);
    };


    // ─────────────────────────────────────────────
    // GUARDAR NUEVA CONTRASEÑA
    // ─────────────────────────────────────────────
    const handleGuardarPassword = async () => {

        if (!tempForm.password || !tempForm.confirmarPassword) {
            setFormError('Debes completar todos los campos');
            return;
        }
       
        if (tempForm.password !== tempForm.confirmarPassword) {
            setFormError('Las contraseñas no coinciden');
            return;
        }

        if (tempForm.password.length < 6) {
            setFormError('La contraseña debe tener mínimo 6 caracteres');
            return;
        }

        try {
            setSaving(true);
            setFormError('');

            await perfilService.editarPerfil({
                password: tempForm.password,
            });

            toast.success('Contraseña actualizada correctamente');

            setOpenModal(false);
           
            setTempForm({
                password: '',
                confirmarPassword: '',
            });

        } catch (error: any) {
            toast.error(
                typeof error === 'string'
                    ? error
                    : 'Error al cambiar la contraseña'
            );
        } finally {
            setSaving(false);
        }
    };

    const iniciales = usuario
        ? `${usuario.primerNombre[0]}${usuario.primerApellido[0]}`.toUpperCase()
        : user?.nombre?.[0]?.toUpperCase() ?? '?';

    if (loading) return <p className="text-center py-10 text-gray-400">Cargando perfil...</p>;
    if (error)   return <p className="text-center py-10 text-red-500">{error}</p>;

    return (
        <>
            <BreadcrumbComp title="Mi Perfil" items={BCrumb} />

            <div className="flex flex-col gap-6">

                {/* Header */}
                <CardBox className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

                        {/* Info izquierda */}
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                {iniciales}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <h5 className="card-title">
                                    {usuario?.primerNombre} {usuario?.primerApellido}
                                </h5>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                                        {usuario?.rol}
                                    </span>

                                    <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 xl:block" />

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {empresa?.nombre}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botón derecha */}
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 self-center"
                        >
                            <Icon icon="solar:camera-linear" width="18" height="18" />
                            Subir foto
                        </Button>

                    </div>
                </CardBox>
                

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* Datos personales */}
                    <CardBox className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h5 className="card-title">Información personal</h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Actualiza tu información personal
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={guardarCambios}
                                    className="flex items-center gap-1.5 rounded-md"
                                >
                                    <Icon icon="solar:diskette-linear" width="18" height="18" />
                                    Guardar
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* Primer nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="primerNombre">Primer nombre</Label>
                                <Input
                                    id="primerNombre"
                                    value={formData.primerNombre}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            primerNombre: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Segundo nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="segundoNombre">Segundo nombre</Label>
                                <Input
                                    id="segundoNombre"
                                    value={formData.segundoNombre}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            segundoNombre: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Primer apellido */}
                            <div className="space-y-2">
                                <Label htmlFor="primerApellido">Primer apellido</Label>
                                <Input
                                    id="primerApellido"
                                    value={formData.primerApellido}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            primerApellido: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Segundo apellido */}
                            <div className="space-y-2">
                                <Label htmlFor="segundoApellido">Segundo apellido</Label>
                                <Input
                                    id="segundoApellido"
                                    value={formData.segundoApellido}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            segundoApellido: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Rol */}
                            <div className="space-y-2">
                                <Label>Rol</Label>

                                <div className="h-10 px-3 rounded-md border border-border bg-muted flex items-center">
                                    <span className="text-sm font-medium">
                                        {usuario?.rol}
                                    </span>
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label>Estado</Label>

                                <div className="h-10 px-3 rounded-md border border-border bg-muted flex items-center">
                                    <span
                                        className={`text-sm font-medium ${
                                            usuario?.activo
                                                ? 'text-green-600'
                                                : 'text-red-500'
                                        }`}
                                    >
                                        {usuario?.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end w-full mt-6">
                            <Button
                                variant="outline"
                                onClick={abrirModalPassword}
                                className="flex items-center gap-1.5 rounded-md"
                            >
                                <Icon icon="mdi:lock-reset" width="18" height="18" />
                                Cambiar contraseña
                            </Button>
                        </div>
                    </CardBox>
                    

                    {/* Datos de empresa */}
                    <CardBox className="p-6">
                        <h5 className="card-title mb-6">Datos de la empresa</h5>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 mb-6">
                            <div>
                                <p className="text-xs text-gray-500">Nombre</p>
                                <p>{empresa?.nombre}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">RIF</p>
                                <p>{empresa?.rif}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Correo</p>
                                <p>{empresa?.correo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Teléfono</p>
                                <p>{empresa?.telefono ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Dirección</p>
                                <p>{empresa?.direccion ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Moneda base</p>
                                <p>{empresa?.monedaBase}</p>
                            </div>
                        </div>
                    </CardBox>
                </div>
            </div>

            {/* MODAL CAMBIAR CONTRASEÑA */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="max-w-md">

                    <DialogHeader>
                        <DialogTitle>
                            Cambiar contraseña
                        </DialogTitle>
                    </DialogHeader>

                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">
                            {formError}
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-2">

                        {/* Nueva contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Nueva contraseña
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="Nueva contraseña"
                                value={tempForm.password}
                                onChange={(e) =>
                                    setTempForm({
                                        ...tempForm,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Confirmar */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirmar contraseña
                            </Label>

                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={tempForm.confirmarPassword}
                                onChange={(e) =>
                                    setTempForm({
                                        ...tempForm,
                                        confirmarPassword: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenModal(false)}
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={handleGuardarPassword}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Actualizar contraseña'}
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>                                    
            
        </>
    );
};

export default UserProfile;