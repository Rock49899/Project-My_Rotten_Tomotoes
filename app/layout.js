import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/auth/AuthProvider";
import ConditionalLayout from "./components/layout/conditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tomato Reviews - Découvrez et notez vos films",
  description: "La plateforme ultime pour découvrir, noter et commenter les meilleurs films du moment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}