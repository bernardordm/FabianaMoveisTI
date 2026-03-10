// app/components/loginForm/index.tsx
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login} = useAuth();
    useRouter();
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Por favor, preencha todos os campos.");
            setIsLoading(false);
            return;
        }

        if (!email.includes('@')) {
            setError("Por favor, insira um e-mail válido.");
            setIsLoading(false);
            return;
        }

        try {
            const success = await login(email.trim().toLowerCase(), password);

            if (!success) {
                setError("Credenciais inválidas. Por favor, verifique seu e-mail e senha.");
                setPassword("");
            }
        } catch (err) {
            console.error("Erro completo:", err);
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao fazer login. Tente novamente.";
            setError(errorMessage);
            setPassword("");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="email-address" className="block text-gray-700 font-medium mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Digite seu e-mail"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                        Senha
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Digite sua senha"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        disabled={isLoading}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Lembrar-me
                    </label>
                </div>

                <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                        Esqueceu sua senha?
                    </Link>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Entrando...
                        </>
                    ) : (
                        "Entrar"
                    )}
                </button>
            </div>
        </form>
    );
}