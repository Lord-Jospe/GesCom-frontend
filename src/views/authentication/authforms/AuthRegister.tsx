import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input }    from 'src/components/ui/input';
import { Label }    from 'src/components/ui/label';
import { Button }   from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import { useRegister } from 'src/context/RegisterContext';
import { useAuth }     from 'src/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';


const AuthRegister = () => {
    const navigate = useNavigate();
    const { form, actualizar, resetear } = useRegister();
    const { registro } = useAuth();
    const [paso, setPaso]       = useState(1);
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const [mostrarPassword, setMostrarPassword] = useState(false);

    const set = (campo: keyof typeof form, valor: string | boolean) => {
        actualizar(campo, valor);
        setError('');
    };

    const validarPaso1 = () => {
        if (!form.primerNombre.trim())         return 'El nombre es obligatorio';
        if (!form.primerApellido.trim())       return 'El apellido es obligatorio';
        if (!form.email.trim())                return 'El correo es obligatorio';
        if (!/\S+@\S+\.\S+/.test(form.email)) return 'El correo no es válido';
        if (!form.password)                    return 'La contraseña es obligatoria';
        if (form.password.length < 6)          return 'Mínimo 6 caracteres';
        if (!form.aceptaTerminos)              return 'Debes aceptar los términos y condiciones';
        return null;
    };

    const validarPaso2 = () => {
        if (!form.nombreEmpresa.trim()) return 'El nombre de la empresa es obligatorio';
        if (!form.rif.trim())           return 'El RIF es obligatorio';
        return null;
    };

    const handleContinuar = () => {
        const err = validarPaso1();
        if (err) { setError(err); return; }
        setError('');
        setPaso(2);
    };

    const handleSubmit = async () => {
        const err = validarPaso2();
        if (err) { setError(err); return; }

        setLoading(true);
        setError('');
        try {
            await registro(form);
            resetear();
            navigate('/admin');
        } catch (e: any) {
            setError(typeof e === 'string' ? e : 'Error al registrar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Indicador de pasos */}
            <div className="flex items-center gap-2 mb-6">
                {[1, 2].map((n) => (
                    <div key={n} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                            ${paso >= n
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                            {n}
                        </div>
                        {n < 2 && (
                            <div className={`h-0.5 w-10 transition-colors
                                ${paso > n ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                            />
                        )}
                    </div>
                ))}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {paso === 1 ? 'Datos personales' : 'Tu empresa'}
                </span>
            </div>

            {/* Error */}
            {error && (
                <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                    {error}
                </p>
            )}

            {/* ── PASO 1 ── */}
            {paso === 1 && (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="primerNombre" className="font-semibold">Nombre</Label>
                        <Input
                            id="primerNombre"
                            type="text"
                            placeholder="Ingresa tu nombre"
                            value={form.primerNombre}
                            onChange={e => set('primerNombre', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="primerApellido" className="font-semibold">Apellido</Label>
                        <Input
                            id="primerApellido"
                            type="text"
                            placeholder="Ingresa tu apellido"
                            value={form.primerApellido}
                            onChange={e => set('primerApellido', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email" className="font-semibold">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password" className="font-semibold">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={mostrarPassword ? 'text' : 'password'}
                                placeholder="Mínimo 6 caracteres"
                                value={form.password}
                                onChange={(e) => set('password', e.target.value)}
                                className="mt-1"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                tabIndex={-1}
                            >
                                {mostrarPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="terminos"
                            checked={form.aceptaTerminos}
                            onCheckedChange={val => set('aceptaTerminos', !!val)}
                        />
                        <Label htmlFor="terminos" className="font-normal opacity-90 cursor-pointer">
                            Acepto los términos y condiciones
                        </Label>
                    </div>

                    <Button className="w-full mt-2" onClick={handleContinuar}>
                        Continuar
                    </Button>
                </div>
            )}

            {/* ── PASO 2 ── */}
            {paso === 2 && (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nombreEmpresa" className="font-semibold">
                            Nombre de la empresa
                        </Label>
                        <Input
                            id="nombreEmpresa"
                            type="text"
                            placeholder="Ej: Mi Empresa C.A."
                            value={form.nombreEmpresa}
                            onChange={e => set('nombreEmpresa', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="rif" className="font-semibold">RIF</Label>
                        <Input
                            id="rif"
                            type="text"
                            placeholder="Ej: J-12345678-9"
                            value={form.rif}
                            onChange={e => set('rif', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="telefono" className="font-semibold">
                            Teléfono{' '}
                            <span className="text-gray-400 font-normal">(opcional)</span>
                        </Label>
                        <Input
                            id="telefono"
                            type="tel"
                            placeholder="Ej: 0414-1234567"
                            value={form.telefono}
                            onChange={e => set('telefono', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => { setPaso(1); setError(''); }}
                        >
                            Atrás
                        </Button>
                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Empezar ahora'}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthRegister;