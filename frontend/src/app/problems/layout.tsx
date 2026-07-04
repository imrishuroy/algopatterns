"use client";

import { useEffect } from "react";

// skipcq: JS-0067
export default function ProblemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) footer.style.display = "none";
    // Prevent the page from scrolling so problem content never slides
    // behind the sticky header. Both html and body must be locked —
    // locking only body is not sufficient in all browsers.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      if (footer) footer.style.display = "";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return <>{children}</>;
}
