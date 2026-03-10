/* eslint-disable react-hooks/exhaustive-deps */
// app/components/routeGuard/index.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthService from "../../../app/shared/services/auth.service";
import LoginService from "../../../app/shared/services/login.service";

interface RouteGuardProps {
    children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Check auth on first mount and route changes
        authCheck(pathname);

        // Set up a route change handler for Next.js
        const handleRouteChange = () => {
            authCheck(pathname);
        };

        // Run auth check on route change
        handleRouteChange();

        return () => {
            // Cleanup when unmounting
        };
    }, [pathname]);

    function authCheck(url: string) {
        // Reset auth status
        setAuthorized(false);

        // Skip auth check for login page
        if (url === "/login") {
            setAuthorized(true);
            return;
        }

        // Check if user is authenticated
        const isAuthenticated = LoginService.isAuthenticated();
        if (!isAuthenticated) {
            // Redirect to login with callback to current page
            const callbackUrl = encodeURIComponent(url);
            router.push(`/login?callback=${callbackUrl}`);
            return;
        }

        // Check route permissions
        if (!AuthService.canAccessRoute(url)) {
            const redirectPath = AuthService.getRedirectPath(url);
            router.push(redirectPath);
            return;
        }

        // If we get here, the route is authorized
        setAuthorized(true);
    }

    return authorized ? <>{children}</> : (
        // Show loading indicator or nothing while checking authorization
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );
}