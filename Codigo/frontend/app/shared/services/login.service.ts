"use client";

import axios, { AxiosResponse } from "axios";
import { API_URL } from "../consts/API";

interface LoginForm {
    email: string;
    password: string;
}

interface LoggedUserData {
    id: string;
    email: string;
    nome: string;
    cargo: string;
}

interface AuthResponse {
    access_token: string;
    user: LoggedUserData;
}

let interceptorsConfigured = false;

const setupInterceptors = () => {

    if (interceptorsConfigured) return;

    axios.interceptors.request.clear();
    axios.interceptors.response.clear();

    axios.interceptors.request.use(
        (config) => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("auth_token");
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            if (error.response && error.response.status === 401) {
                if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
                    await clearAuthData();
                    window.location.href = "/login";
                }
            }
            return Promise.reject(error);
        }
    );

    interceptorsConfigured = true;
};

const clearAuthData = async (): Promise<void> => {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

        if (axios.defaults.headers.common['Authorization']) {
            delete axios.defaults.headers.common['Authorization'];
        }
    } catch (error) {
        console.error("Erro ao limpar dados de autenticação:", error);
    }
};

const validateTokenOnServer = async (token: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.status === 200;
    } catch {
        return false;
    }
};

const login = async (data: LoginForm): Promise<AuthResponse | undefined> => {
    try {
        await clearAuthData();

        const response: AxiosResponse<AuthResponse> = await axios.post(
            `${API_URL}/auth/login`,
            data
        );

        if (response.data && response.data.access_token) {
            if (typeof window !== "undefined") {
                localStorage.setItem("auth_token", response.data.access_token);
                localStorage.setItem("user_data", JSON.stringify(response.data.user));

                document.cookie = `auth_token=${response.data.access_token}; path=/; max-age=86400; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;

                window.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { isAuthenticated: true, user: response.data.user }
                }));
            }
        }

        return response.data;
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        await clearAuthData();
        return undefined;
    }
};

const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") {
        return false;
    }

    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (!token || !userData) {
        return false;
    }

    try {
        const parsedUser = JSON.parse(userData);
        return !!(token && parsedUser && parsedUser.id);
    } catch {
        return false;
    }
};

const getUser = (): LoggedUserData | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const userData = localStorage.getItem("user_data");
    const token = localStorage.getItem("auth_token");

    if (userData && token) {
        try {
            return JSON.parse(userData);
        } catch {
            return null;
        }
    }
    return null;
};

const getToken = (): string | null => {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem("auth_token");
};

const storeAuthData = (data: AuthResponse): void => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("user_data", JSON.stringify(data.user));

    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: true, user: data.user }
    }));
};

const logout = async (): Promise<void> => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        const token = localStorage.getItem("auth_token");
        if (token) {
            try {
                await axios.post(`${API_URL}/auth/logout`, null, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000
                });
            } catch (logoutError) {
                console.warn("Erro ao fazer logout no servidor (ignorado):", logoutError);
            }
        }
    } catch (error) {
        console.error("Erro durante processo de logout:", error);
    } finally {
        await clearAuthData();

        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: false, user: null }
        }));

        setTimeout(() => {
            window.location.href = "/login";
        }, 100);
    }
};

const refreshToken = async (): Promise<boolean> => {
    try {
        const token = localStorage.getItem("auth_token");
        if (!token) return false;

        const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
            refresh_token: token,
        });

        if (response.data && response.data.access_token) {
            storeAuthData(response.data);
            return true;
        }

        return false;
    } catch (error) {
        console.error("Erro ao atualizar token:", error);
        await logout();
        return false;
    }
};

if (typeof window !== "undefined") {
    setupInterceptors();
}

const LoginService = {
    login,
    getToken,
    storeAuthData,
    isAuthenticated,
    refreshToken,
    getUser,
    logout,
    clearAuthData,
    validateTokenOnServer
};

export default LoginService;