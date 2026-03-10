// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RouteGuard from './components/routeGuard';
import Footer from './components/footer';
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sistema de Entregas - Fabiana Móveis",
    icons: {
        icon: "/logo_fabianamoveis-03.png",
        apple: "/logo_fabianamoveis-03.png",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <RouteGuard>
            <div className="flex flex-col flex-grow">
                {children}
            </div>
        </RouteGuard>
        <Footer />
        </body>
        </html>
    );
}