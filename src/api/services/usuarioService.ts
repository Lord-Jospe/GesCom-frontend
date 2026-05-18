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
            const response = await api.post<UsuarioResponse>('/users/', usuarioData);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.message || 'Error al crear usuario';
        }
    },

    editarUsuario: async (usuarioId: number, usuarioData: EditarUsuarioRequest): Promise<UsuarioResponse> => {
        try {
            const response = await api.put<UsuarioResponse>(`/users/${usuarioId}`, usuarioData);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.message || 'Error al editar usuario';
        }
    },

    //desactivar usuario
    desactivarUsuario: async (usuarioId: number): Promise<string> => {
        try {
            const {data} = await api.delete(`/users/${usuarioId}`);
            return data;
        } catch (error: any) {
            throw error.response?.data?.message || 'Error al desactivar usuario';
        }
    },

    //activar usuario
    activarUsuario: async (usuarioId: number): Promise<string> => {
        try {
            const {data} = await api.post(`/users/${usuarioId}/activate`);
            return data;
        } catch (error: any) {
            throw error.response?.data?.message || 'Error al activar usuario';
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