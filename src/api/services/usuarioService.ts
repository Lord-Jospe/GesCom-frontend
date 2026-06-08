import api from "src/api/axios";
import { UsuarioResponse, CrearUsuarioRequest, EditarUsuarioRequest } from "src/types/usuario";

export const usuariosServices = {

    getAllUsuarios: async (): Promise<UsuarioResponse[]> => {
        try {
            const response = await api.get<UsuarioResponse[]>('/users');
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.message || 'Error al obtener usuarios';
        }

    },

    crearUsuario: async (usuarioData: CrearUsuarioRequest): Promise<UsuarioResponse> => {
        try {
            const response = await api.post<UsuarioResponse>('/users', usuarioData);
            return response.data;
        } catch (error: any) {
            const backendMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data;
            const msg = typeof backendMsg === 'string'
                ? backendMsg
                : (error.response?.data?.message || error.response?.data?.error || 'Error al crear usuario');
            console.error('[crearUsuario]', error.response?.status, msg, error.response?.data);
            throw new Error(msg);
        }
    },

    editarUsuario: async (usuarioId: number, usuarioData: EditarUsuarioRequest): Promise<UsuarioResponse> => {
        try {
            const response = await api.put<UsuarioResponse>(`/users/${usuarioId}`, usuarioData);
            return response.data;
        } catch (error: any) {
            const backendMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data;
            const msg = typeof backendMsg === 'string'
                ? backendMsg
                : (error.response?.data?.message || error.response?.data?.error || 'Error al editar usuario');
            console.error('[editarUsuario]', error.response?.status, msg, error.response?.data);
            throw new Error(msg);
        }
    },

    //desactivar usuario
    desactivarUsuario: async (usuarioId: number): Promise<string> => {
        try {
            const {data} = await api.delete(`/users/${usuarioId}`);
            return data;
        } catch (error: any) {
            const backendMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data;
            const msg = typeof backendMsg === 'string'
                ? backendMsg
                : (error.response?.data?.message || error.response?.data?.error || 'Error al desactivar usuario');
            console.error('[desactivarUsuario]', error.response?.status, msg, error.response?.data);
            throw new Error(msg);
        }
    },

    //activar usuario
    activarUsuario: async (usuarioId: number): Promise<string> => {
        try {
            const {data} = await api.patch(`/users/${usuarioId}/activate`);
            return data;
        } catch (error: any) {
            const backendMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data;
            const msg = typeof backendMsg === 'string'
                ? backendMsg
                : (error.response?.data?.message || error.response?.data?.error || 'Error al activar usuario');
            console.error('[activarUsuario]', error.response?.status, msg, error.response?.data);
            throw new Error(msg);
        }
    },

    //buscar por id 
    getUsuarioById: async (usuarioId: number): Promise<UsuarioResponse> => {
        try {
            const response = await api.get<UsuarioResponse>(`/users/${usuarioId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.message || 'Error al obtener usuario por ID';
        }
    }
}