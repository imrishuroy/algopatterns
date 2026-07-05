"use client";

import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { SearchModal } from "./SearchModal";

export function GlobalSearchHandler() {
  // Register global keyboard shortcut
  useGlobalSearch();

  return <SearchModal />;
}
