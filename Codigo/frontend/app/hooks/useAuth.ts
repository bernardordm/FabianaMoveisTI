"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import LoginService from '../shared/services/login.service';
import AuthService from '../shared/services/auth.service';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface LoggedUserData {
    id: string;
    email: string;
    nome: string;
    cargo: string;
}

export function useAuth() {
    const [user, setUser] = useState<LoggedUserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Ref para evitar múltiplas execuções simultâneas
    const isUpdatingRef = useRef(false);

    const updateAuthState = useCallback(() => {
        if (isUpdatingRef.current) return { currentUser: user, authStatus: isAuthenticated };

        isUpdatingRef.current = true;

        try {
            const currentUser = LoginService.getUser();
            const authStatus = LoginService.isAuthenticated();

            setUser(currentUser);
            setIsAuthenticated(authStatus);
            setUserRole(currentUser?.cargo?.toLowerCase() || "");

            return { currentUser, authStatus };
        } finally {
            isUpdatingRef.current = false;
        }
    }, []);

    useEffect(() => {
        const handleAuthStateChange = (event: CustomEvent<{ isAuthenticated: boolean; user: LoggedUserData | null }>) => {
            const { isAuthenticated: newAuthState, user: newUser } = event.detail;
            setIsAuthenticated(newAuthState);
            setUser(newUser);
            setUserRole(newUser?.cargo?.toLowerCase() || "");
        };

        window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);

        return () => {
            window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
        };
    }, []);


    useEffect(() => {
        updateAuthState();
    }, [updateAuthState]);

    useEffect(() => {
        const { authStatus, currentUser } = updateAuthState();

        if (pathname === "/login" && authStatus && currentUser) {
            if (currentUser.cargo?.toLowerCase() === "motorista") {
                router.push('/mobile');
            } else {
                router.push('/home');
            }
            return;
        }

        if (authStatus && pathname !== "/login") {
            if (!AuthService.canAccessRoute(pathname)) {
                const redirectPath = AuthService.getRedirectPath(pathname);
                router.push(redirectPath);
            }
        }
    }, [pathname, router, updateAuthState]);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);

            const response = await LoginService.login({ email, password });

            if (response) {
                await new Promise(resolve => setTimeout(resolve, 100));

                setUser(response.user);
                setIsAuthenticated(true);
                setUserRole(response.user.cargo?.toLowerCase() || "");

                const callback = searchParams.get('callback');

                if (response.user.cargo?.toLowerCase() === "motorista") {
                    router.push('/mobile');
                } else {
                    router.push(callback ? decodeURIComponent(callback) : '/home');
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await LoginService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setUserRole("");
        } catch (error) {
            console.error('Erro durante logout:', error);
        }
    };

    const canAccessRoute = (route: string) => {
        return AuthService.canAccessRoute(route);
    };

    return {
        user,
        isAuthenticated,
        userRole,
        isLoading,
        login,
        logout,
        canAccessRoute
    };
}