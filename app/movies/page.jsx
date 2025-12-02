"use client";

import { Suspense } from "react";
import MoviesContent from "./movies-content";

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Chargement...</div>}>
      <MoviesContent />
    </Suspense>
  );
}
