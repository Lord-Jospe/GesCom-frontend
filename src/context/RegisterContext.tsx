import { createContext, useContext, useState, ReactNode } from 'react';
import { RegisterFormData } from 'src/types/auth/auth.types';

const INITIAL_DATA: RegisterFormData = {
    primerNombre:   '',
    primerApellido: '',
    email:          '',
    password:       '',
    aceptaTerminos: false,
    nombreEmpresa:  '',
    rif:            '',
    telefono:       '',
};

interface RegisterContextType {
    form:      RegisterFormData;
    actualizar: (campo: keyof RegisterFormData, valor: string | boolean) => void;
    resetear:  () => void;
}

const RegisterContext = createContext<RegisterContextType | null>(null);

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
    const [form, setForm] = useState<RegisterFormData>(INITIAL_DATA);

    const actualizar = (campo: keyof RegisterFormData, valor: string | boolean) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const resetear = () => setForm(INITIAL_DATA);

    return (
        <RegisterContext.Provider value={{ form, actualizar, resetear }}>
            {children}
        </RegisterContext.Provider>
    );
};

export const useRegister = () => {
    const ctx = useContext(RegisterContext);
    if (!ctx) throw new Error('useRegister debe usarse dentro de RegisterProvider');
    return ctx;
};