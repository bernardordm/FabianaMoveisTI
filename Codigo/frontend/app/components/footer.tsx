import Link from "next/link"
import Image from "next/image"

export default function Footer() {
    return (
        <footer className="bg-gray-100 py-6 mt-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <div className="bg-white p-1 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden">
                            <Image
                                src="/logo_fabianamoveis-01.png"
                                alt="Fabiana Móveis Logo"
                                width={32}
                                height={32}
                                className="h-8 w-8 object-contain"
                            />
                        </div>
                        <span className="text-sm text-gray-600">© 2025 Fabiana Móveis</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/home" className="text-sm text-gray-600 hover:text-blue-600">
                            Termos
                        </Link>
                        <Link href="/home" className="text-sm text-gray-600 hover:text-blue-600">
                            Privacidade
                        </Link>
                        <Link href="/home" className="text-sm text-gray-600 hover:text-blue-600">
                            Contato
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}