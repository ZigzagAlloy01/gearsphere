"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { type Category } from "./data";

const CatalogContext = createContext<{
  category: Category;
  setCategory: (category: Category) => void;
} | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<Category>("All equipment");
  return (
    <CatalogContext.Provider value={{ category, setCategory }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context)
    throw new Error("Catalog components must be inside CatalogProvider.");
  return context;
}
