"use client";

import axios from 'axios';
import { API_URL } from '../consts/API';

interface UserForm {
    nome: string;
    email: string;
    password: string;
    cargo: string;
}

interface UserResponse {
    id: number;
    nome: string;
    email: string;
    cargo: string;
}

// Função para criar um novo usuário
const createUser = async (data: UserForm): Promise<UserResponse | undefined> => {
    try {
        const response = await axios.post<UserResponse>(`${API_URL}/users`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        throw error;
    }
};

// Função para obter todos os usuários
const getAllUsers = async (): Promise<UserResponse[]> => {
    try {
        const response = await axios.get<UserResponse[]>(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
    }
};

// Função para obter um usuário específico
const getUserById = async (id: number): Promise<UserResponse | undefined> => {
    try {
        // Obtém o token JWT do localStorage (requer autenticação)
        const token = localStorage.getItem('auth_token');

        if (!token) {
            throw new Error('Autenticação necessária');
        }

        const response = await axios.get<UserResponse>(`${API_URL}/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar usuário ${id}:`, error);
        return undefined;
    }
};

// Função para verificar se um email já está em uso
const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
        // Esta é uma implementação simulada, já que seu backend
        // não parece ter um endpoint específico para isso
        // Você pode implementar essa funcionalidade no backend depois
        const users = await getAllUsers();
        return users.some(user => user.email === email);
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        return false;
    }
};

// Função para atualizar um usuário
const updateUser = async (id: number, data: Partial<UserForm>): Promise<UserResponse | undefined> => {
    try {
        const response = await axios.patch<UserResponse>(`${API_URL}/users/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar usuário ${id}:`, error);
        return undefined;
    }
};

// Função para remover um usuário
const removeUser = async (id: number): Promise<boolean> => {
    try {
        await axios.delete(`${API_URL}/users/${id}`);
        return true;
    } catch (error) {
        console.error(`Erro ao remover usuário ${id}:`, error);
        return false;
    }
};

const UserService = {
    createUser,
    getAllUsers,
    getUserById,
    checkEmailExists,
    updateUser,
    removeUser
};

export default UserService;