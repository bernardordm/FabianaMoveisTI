"use client";

import axios from 'axios';
import { API_URL } from '../consts/API';

export type EmployeeRole = "driver" | "manager";

export interface Employee {
    id: number;
    nome: string;
    email: string;
    cargo: string;
}

export interface EmployeeForm {
    nome: string;
    email: string;
    password: string;
    cargo: string;
}

// Função para obter todos os funcionários
export const getAllEmployees = async (): Promise<Employee[]> => {
    try {
        const response = await axios.get<Employee[]>(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        return [];
    }
};

// Função para obter um funcionário específico
export const getEmployeeById = async (id: number): Promise<Employee | undefined> => {
    try {
        const response = await axios.get<Employee>(`${API_URL}/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar funcionário ${id}:`, error);
        return undefined;
    }
};

// Função para criar um novo funcionário
export const createEmployee = async (data: EmployeeForm): Promise<Employee | undefined> => {
    try {
        const response = await axios.post<Employee>(`${API_URL}/users`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
        throw error;
    }
};

// Função para atualizar um funcionário
export const updateEmployee = async (id: number, data: Partial<EmployeeForm>): Promise<Employee | undefined> => {
    try {
        const response = await axios.patch<Employee>(`${API_URL}/users/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar funcionário ${id}:`, error);
        return undefined;
    }
};

// Função para remover um funcionário
export const deleteEmployee = async (id: number): Promise<boolean> => {
    try {
        await axios.delete(`${API_URL}/users/${id}`);
        return true;
    } catch (error) {
        console.error(`Erro ao remover funcionário ${id}:`, error);
        return false;
    }
};

const EmployeeService = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};

export default EmployeeService;