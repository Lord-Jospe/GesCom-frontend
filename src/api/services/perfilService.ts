import api from 'src/api/axios';
import {
    EditarPerfilRequest,
    EmpresaPerfilResponse,
    UsuarioPerfilResponse,
} from 'src/types/auth/auth.types';

const perfilService = {

    obtenerUsuario: async (): Promise<UsuarioPerfilResponse> => {
        const { data } = await api.get('/users/me');
        return data;
    },

    obtenerEmpresa: async (): Promise<EmpresaPerfilResponse> => {
        const { data } = await api.get('/company');
        return data;
    },

    editarPerfil: async (payload: EditarPerfilRequest): Promise<UsuarioPerfilResponse> => {
        const { data } = await api.put('/users/me', payload);
        return data;
    },
};

export default perfilService;
