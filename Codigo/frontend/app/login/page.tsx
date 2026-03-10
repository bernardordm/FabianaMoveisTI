import Image from "next/image"
import type { Metadata } from "next"
import { Suspense } from "react"
import LoginForm from "../components/loginForm"

export const metadata: Metadata = {
  title: "Login - Fabiana Móveis",
  description: "Faça login na plataforma da Fabiana Móveis",
}

function LoginFormSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-10 bg-blue-200 rounded animate-pulse"></div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Logo and Text */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-blue-600 p-8">
        <div className="mb-6">
          <Image
            src="/logo_fabianamoveis-01.png"
            alt="Fabiana Móveis"
            width={400}
            height={400}
            priority
            className="object-contain"
          />
        </div>
        <h1
          className="mt-4 text-3xl font-bold text-white text-center tracking-wide"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Sistema de Gerenciamento de Entregas
        </h1>
        <p
          className="mt-3 text-white text-center max-w-md opacity-90 text-lg"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Gerencie suas entregas de forma eficiente
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="md:hidden mb-8">
          <Image
            src="/logo_fabianamoveis-01.png"
            alt="Fabiana Móveis"
            width={180}
            height={180}
            priority
            className="object-contain"
          />
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Entre na sua conta</h2>
          
          {/* Wrap the LoginForm in a Suspense boundary */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}