"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";

export default function ConditionalLayout({ children }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/dashboard');

    if (isAdminRoute) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-black">
        <Header />
        <main className="grow">
            {children}
        </main>
        <Footer />
        </div>
    );
}