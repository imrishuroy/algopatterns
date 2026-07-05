"use client";

import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { SearchModal } from "./SearchModal";

export function GlobalSearchHandler() { // skipcq: JS-0067
  // Register global keyboard shortcut
  useGlobalSearch();

  return <SearchModal />;
}
