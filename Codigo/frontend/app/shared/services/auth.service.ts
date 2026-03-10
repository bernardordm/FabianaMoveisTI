// app/shared/services/auth.service.ts
"use client";

import LoginService from "./login.service";

type UserRole = "motorista" | "gerente" | string;

interface RoutePermissions {
    allowedRoles: UserRole[];
    redirectTo: string;
}

// Map of routes and their permission settings
const routePermissions: Record<string, RoutePermissions> = {
    "/mobile": {
        allowedRoles: ["motorista"],
        redirectTo: "/home",
    },
    "/home": {
        allowedRoles: ["gerente", "admin"],
        redirectTo: "/mobile",
    },
    "/deliveries": {
        allowedRoles: ["gerente", "admin"],
        redirectTo: "/mobile",
    },
    "/dashboard": {
        allowedRoles: ["gerente", "admin", "motorista"],
        redirectTo: "/home",
    },
    "/reports": {
        allowedRoles: ["gerente", "admin"],
        redirectTo: "/mobile",
    },
    "/routes": {
        allowedRoles: ["gerente", "admin"],
        redirectTo: "/mobile",
    },
    "/recent": {
        allowedRoles: ["gerente", "admin", "motorista"],
        redirectTo: "/home",
    },
    "/users": {
        allowedRoles: ["gerente", "admin"],
        redirectTo: "/mobile",
    },
    "/employees": {
        allowedRoles: ["gerente", "admin"],
        redirectTo: "/mobile",
    },
};

const getUserRole = (): UserRole => {
    const user = LoginService.getUser();
    return user?.cargo?.toLowerCase() || "";
};

const canAccessRoute = (pathname: string): boolean => {
    const userRole = getUserRole();

    if (pathname === "/login") {
        return true;
    }

    const basePath = `/${pathname.split('/')[1]}`;

    const routeConfig = routePermissions[basePath];

    if (!routeConfig) {
        return userRole !== "motorista";
    }

    return routeConfig.allowedRoles.includes(userRole);
};

const getRedirectPath = (pathname: string): string => {
    const userRole = getUserRole();

    const basePath = `/${pathname.split('/')[1]}`;

    const routeConfig = routePermissions[basePath];

    if (!routeConfig) {
        return userRole === "motorista" ? "/mobile" : "/home";
    }

    return routeConfig.redirectTo;
};

const AuthService = {
    getUserRole,
    canAccessRoute,
    getRedirectPath,
};

export default AuthService;