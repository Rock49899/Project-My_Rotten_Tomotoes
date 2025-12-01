"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // rediriger vers login après 5s
      router.push("/login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50">
      <h1 className="text-2xl font-semibold text-blue-600 mb-2">
        Compte vérifié avec succès !
      </h1>
      <p className="text-gray-600">
        Vous allez être redirigé vers la page de connexion...
      </p>
    </div>
  );
}
