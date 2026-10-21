
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  UserRound,
  ShoppingBag,
  Bell,
  Sun,
  Moon,
  ArrowUpRight,
} from "lucide-react";

const navigation = [
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "T-Shirts", href: "/products?category=t-shirts" },
  { label: "Hoodies", href: "/products?category=hoodies" },
  { label: "Fabrics", href: "/products?category=fabrics" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);
    document.documentElement.dataset.theme = nextDarkMode
      ? "dark"
      : "light";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0D3] bg-[#F7F3EB]/95 text-[#292821] backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full p-2 transition hover:bg-[#E8E0D3] lg:hidden"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand logo */}
        <a
          href="/"
          aria-label="Flex Fashion home"
          className="text-2xl font-black tracking-[-0.08em] sm:text-3xl"
        >
          FLEX<span className="text-[#8C8170]">.</span>
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[11px] font-medium uppercase tracking-[0.13em] transition-colors hover:text-[#8C8170]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Search products"
            onClick={() => (window.location.href = "/products")}
            className="rounded-full p-2.5 transition hover:bg-[#E8E0D3]"
          >
            <Search size={19} strokeWidth={1.7} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-full p-2.5 transition hover:bg-[#E8E0D3]"
            >
              <Bell size={19} strokeWidth={1.7} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#8C8170] ring-2 ring-[#F7F3EB]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-[280px] rounded-xl border border-[#E8E0D3] bg-[#F7F3EB] p-4 shadow-xl sm:w-[320px]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="rounded-full p-1 hover:bg-[#E8E0D3]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="border-t border-[#E8E0D3] py-4">
                  <p className="text-sm font-medium">Welcome to FLEX.</p>
                  <p className="mt-1 text-xs leading-5 text-[#777064]">
                    Explore everyday essentials designed for comfort and
                    simplicity.
                  </p>
                </div>

                <p className="text-[10px] uppercase tracking-widest text-[#8C8170]">
                  Store updates will appear here
                </p>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            title={darkMode ? "Light theme" : "Dark theme"}
            onClick={toggleTheme}
            className="rounded-full p-2.5 transition hover:bg-[#E8E0D3]"
          >
            {darkMode ? (
              <Sun size={19} strokeWidth={1.7} />
            ) : (
              <Moon size={19} strokeWidth={1.7} />
            )}
          </button>

          <a
            href="/login"
            aria-label="My account"
            className="hidden rounded-full p-2.5 transition hover:bg-[#E8E0D3] sm:inline-flex"
          >
            <UserRound size={19} strokeWidth={1.7} />
          </a>

          <a
            href="/cart"
            aria-label="Shopping bag"
            className="relative rounded-full p-2.5 transition hover:bg-[#E8E0D3]"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#292821] px-1 text-[9px] text-[#F7F3EB]">
              0
            </span>
          </a>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav className="border-t border-[#E8E0D3] bg-[#F7F3EB] px-5 py-4 lg:hidden">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-[#E8E0D3] py-4 text-sm font-medium"
            >
              {item.label}
              <ArrowUpRight size={16} />
            </a>
          ))}

          <a
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-4 text-sm font-medium"
          >
            My Account
            <UserRound size={17} />
          </a>
        </nav>
      )}
    </header>
  );
}
