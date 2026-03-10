"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginService from "../shared/services/login.service";

export default function Header({ title = "" }: { title?: string }) {
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        // Obtém os dados do usuário ao montar o componente
        const user = LoginService.getUser();
        if (user && user.nome) {
            setUserName(user.nome);
        }
    }, []);

    const handleLogout = () => {
        LoginService.logout();
    };

    return (
        <header className="bg-blue-600 py-4 px-2 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo_fabianamoveis-03.png"
                        alt="Fabiana Móveis Logo"
                        width={120}
                        height={120}
                        className="object-contain"
                    />
                    <div>
                        <h1
                            className="text-3xl font-bold text-white tracking-wide"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Fabiana Móveis
                        </h1>
                        {title && <p className="text-white font-medium opacity-90">{title}</p>}
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    {userName && (
                        <div className="bg-blue-700 px-4 py-2 rounded-lg mr-4 border border-blue-300">
                            <span className="text-white font-medium text-lg">
                                Olá, <strong>{userName}</strong>
                            </span>
                        </div>
                    )}
                    <Link
                        href="/home"
                        className="px-4 py-2 rounded-md bg-white text-blue-600 font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm">
                        Home
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-md bg-white text-blue-600 font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm">
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}