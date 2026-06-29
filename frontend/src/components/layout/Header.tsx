"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useFilter } from "@/contexts/FilterContext";
import { useTheme } from "@/contexts/ThemeContext";
import { questions } from "@/lib/questions";
import { useIsMobile } from "@/hooks/useMediaQuery";

const SunIcon = () => (
  <svg
    className="w-5 h-5 text-yellow-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="w-5 h-5 text-gray-700"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const ThemeToggle = ({ theme, onToggle }: { theme: string; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="p-2 rounded-md transition-colors hover:bg-white/10"
    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
  >
    {theme === "dark" ? <SunIcon /> : <MoonIcon />}
  </button>
);

const getInitials = (name: string | undefined, email: string | undefined): string => {
  const displayName = name || email?.split("@")[0] || "U";
  const parts = displayName.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return displayName[0].toUpperCase();
};

const UserDropdown = ({
  user,
  showDropdown,
  onToggle,
  onLogout,
  dropdownRef,
}: {
  user: { name?: string; email?: string } | null;
  showDropdown: boolean;
  onToggle: () => void;
  onLogout: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="relative" ref={dropdownRef}>
    <button
      onClick={onToggle}
      className="w-8 h-8 flex items-center justify-center text-white text-sm font-medium transition-opacity hover:opacity-90"
      style={{
        background: "var(--accent-gradient)",
        borderRadius: "var(--radius-full)",
      }}
    >
      {getInitials(user?.name, user?.email)}
    </button>
    {showDropdown && (
      <div
        className="absolute right-0 mt-2 w-40 py-1 z-50 animate-fade-in"
        style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-1)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          className="px-4 py-2 text-sm truncate border-b"
          style={{
            color: "var(--text-2)",
            borderColor: "var(--border-1)",
          }}
        >
          {user?.name || user?.email?.split("@")[0]}
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition"
        >
          Sign out
        </button>
      </div>
    )}
  </div>
);

const AuthSection = ({
  isLoading,
  isAuthenticated,
  user,
  showDropdown,
  onToggleDropdown,
  onLogout,
  dropdownRef,
}: {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: { name?: string; email?: string } | null;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onLogout: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) => {
  if (isLoading) {
    return (
      <div
        className="w-8 h-8 animate-pulse"
        style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-full)",
        }}
      />
    );
  }

  if (isAuthenticated) {
    return (
      <UserDropdown
        user={user}
        showDropdown={showDropdown}
        onToggle={onToggleDropdown}
        onLogout={onLogout}
        dropdownRef={dropdownRef}
      />
    );
  }

  return (
    <Link
      href="/login"
      className="px-3 py-1.5 text-sm font-medium text-white transition-all hover:opacity-90"
      style={{
        background: "var(--accent-gradient)",
        borderRadius: "var(--radius-md)",
      }}
    >
      Sign in
    </Link>
  );
};

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Header = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { completed } = useProgress();
  const { companyFilter } = useFilter();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const filteredQuestions = useMemo(() => {
    if (!companyFilter) return questions;
    return questions.filter((q) => q.companies.includes(companyFilter));
  }, [companyFilter]);

  const completedCount = filteredQuestions.filter((q) =>
    completed.has(q.id)
  ).length;
  const total = filteredQuestions.length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
  };

  const navLinks = [
    { href: "/dsa-fundamentals", label: "Fundamentals", free: true },
    { href: "/pattern-recognition", label: "Pattern Recognition", free: true },
    { href: "/interview-cheatsheet", label: "Interview Cheat Sheet", free: true },
    { href: "/articles", label: "Articles", free: true },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-all"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-1)",
      }}
    >
      <div className="w-full px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Algo Patterns"
              width={28}
              height={28}
              className="transition-all group-hover:scale-105"
              priority
            />
            <span
              className="text-lg bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--accent-gradient)",
                fontFamily: "var(--font-geist-mono), monospace",
                fontWeight: 500,
                wordSpacing: "-0.35em"
              }}
            >
              algo patterns
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--accent-1)" }}
              >
                {/* Free tag - temporarily disabled
                {link.free && (
                  <span className="absolute -top-2 left-full -ml-1">
                    <svg
                      className="w-6 h-6 drop-shadow-sm -rotate-12"
                      viewBox="0 0 64 64"
                      fill="none"
                    >
                      <path
                        d="M52 12H36c-2 0-4 1-5 2L10 35c-3 3-3 7 0 10l9 9c3 3 7 3 10 0l21-21c1-1 2-3 2-5V14c0-1-1-2-2-2z"
                        fill="#fcd34d"
                        stroke="#1f2937"
                        strokeWidth="2.5"
                      />
                      <circle cx="46" cy="20" r="4" fill="#1f2937" />
                      <path
                        d="M46 8c0 0 4-2 6 0s-4 8-4 8"
                        stroke="#374151"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <text
                        x="32"
                        y="36"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#1f2937"
                        fontFamily="Arial, sans-serif"
                        transform="rotate(-45 32 36)"
                      >
                        FREE
                      </text>
                    </svg>
                  </span>
                )}
                */}
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-2">
              {companyFilter && (
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--accent-2)" }}
                >
                  {companyFilter}
                </span>
              )}
              <div
                className="w-24 h-1.5 overflow-hidden"
                style={{
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    background: "var(--accent-gradient)",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                {completedCount}/{total}
              </span>
            </div>

            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <AuthSection
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
              user={user}
              showDropdown={showDropdown}
              onToggleDropdown={() => setShowDropdown(!showDropdown)}
              onLogout={handleLogout}
              dropdownRef={dropdownRef}
            />
          </div>

          {/* Mobile: Progress + Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-16 h-1.5 overflow-hidden"
                style={{
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    background: "var(--accent-gradient)",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                {completedCount}/{total}
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md transition-colors hover:bg-white/10"
              style={{ color: "var(--text-1)" }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobile && mobileMenuOpen && (
        <div
          className="md:hidden border-t animate-fade-in"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-1)",
          }}
        >
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: "var(--accent-1)" }}
              >
                {link.label}
                {/* Free tag - temporarily disabled
                {link.free && (
                  <svg
                    className="w-6 h-6 ml-1 drop-shadow-sm"
                    viewBox="0 0 64 64"
                    fill="none"
                  >
                    <path
                      d="M52 12H36c-2 0-4 1-5 2L10 35c-3 3-3 7 0 10l9 9c3 3 7 3 10 0l21-21c1-1 2-3 2-5V14c0-1-1-2-2-2z"
                      fill="#fcd34d"
                      stroke="#1f2937"
                      strokeWidth="2.5"
                    />
                    <circle cx="46" cy="20" r="4" fill="#1f2937" />
                    <path
                      d="M46 8c0 0 4-2 6 0s-4 8-4 8"
                      stroke="#374151"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <text
                      x="32"
                      y="36"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#1f2937"
                      fontFamily="Arial, sans-serif"
                      transform="rotate(-45 32 36)"
                    >
                      FREE
                    </text>
                  </svg>
                )}
                */}
              </Link>
            ))}

            <div
              className="my-3 border-t"
              style={{ borderColor: "var(--border-1)" }}
            />

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm" style={{ color: "var(--text-2)" }}>
                Theme
              </span>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>

            <div
              className="my-3 border-t"
              style={{ borderColor: "var(--border-1)" }}
            />

            <div className="px-4 py-2">
              <AuthSection
                isLoading={isLoading}
                isAuthenticated={isAuthenticated}
                user={user}
                showDropdown={showDropdown}
                onToggleDropdown={() => setShowDropdown(!showDropdown)}
                onLogout={handleLogout}
                dropdownRef={dropdownRef}
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
