
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  UserCircle,
  LogOut,
  History,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "T-Shirts", href: "/products?category=t-shirts" },
  { label: "Hoodies", href: "/products?category=hoodies" },
  { label: "Fabrics", href: "/products?category=fabrics" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(user && token);
  const isAdmin = user?.role === "admin";

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);

    document.documentElement.dataset.theme = nextDarkMode
      ? "dark"
      : "light";
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    navigate("/", { replace: true });
  };

  const accountLinks = isAdmin
    ? [
        {
          label: "Admin Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
      ]
    : [
        {
          label: "My Profile",
          href: "/profile",
          icon: UserCircle,
        },
        {
          label: "Order List",
          href: "/orders",
          icon: ClipboardList,
        },
        {
          label: "Checkout Records",
          href: "/checkout-records",
          icon: History,
        },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0D3] bg-[#F7F3EB]/95 text-[#292821] backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => {
            setMobileMenuOpen((open) => !open);
            setAccountOpen(false);
          }}
          className="rounded-full p-2 transition hover:bg-[#E8E0D3] lg:hidden"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand */}
        <Link
          to="/"
          aria-label="Flex Fashion home"
          className="shrink-0 text-2xl font-black tracking-[-0.08em] sm:text-3xl"
        >
          FLEX<span className="text-[#8C8170]">.</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 lg:flex xl:gap-7">
          {navigation.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.13em] transition-colors hover:text-[#8C8170]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <Link
            to="/products"
            aria-label="Search products"
            className="rounded-full p-2.5 transition hover:bg-[#E8E0D3]"
          >
            <Search size={19} strokeWidth={1.7} />
          </Link>

          {/* Notifications */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setAccountOpen(false);
              }}
              className="relative rounded-full p-2.5 transition hover:bg-[#E8E0D3]"
            >
              <Bell size={19} strokeWidth={1.7} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#8C8170] ring-2 ring-[#F7F3EB]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[280px] rounded-lg border border-[#E8E0D3] bg-[#F7F3EB] p-4 shadow-xl sm:w-[320px]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setNotificationsOpen(false)}
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
            aria-label={
              darkMode ? "Switch to light theme" : "Switch to dark theme"
            }
            title={darkMode ? "Light theme" : "Dark theme"}
            onClick={toggleTheme}
            className="hidden rounded-full p-2.5 transition hover:bg-[#E8E0D3] sm:inline-flex"
          >
            {darkMode ? (
              <Sun size={19} strokeWidth={1.7} />
            ) : (
              <Moon size={19} strokeWidth={1.7} />
            )}
          </button>

          {/* Account area */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                className="rounded-sm px-2.5 py-2 text-xs font-medium transition hover:bg-[#E8E0D3] sm:px-4 sm:text-sm"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-sm bg-[#292821] px-3 py-2.5 text-xs font-medium text-[#F7F3EB] transition hover:bg-[#514B3F] sm:px-4 sm:text-sm"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                onClick={() => {
                  setAccountOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
                className="flex max-w-[190px] items-center gap-2 rounded-full px-2 py-2 transition hover:bg-[#E8E0D3] sm:max-w-[260px] sm:px-3"
              >
                <UserRound
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0"
                />

                <span className="max-w-[100px] truncate text-xs font-medium sm:max-w-[170px] sm:text-sm">
                  {user.email}
                </span>

                <ChevronDown
                  size={15}
                  className={`shrink-0 transition-transform ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-12 z-50 w-[240px] overflow-hidden rounded-lg border border-[#E8E0D3] bg-[#F7F3EB] shadow-xl">
                  <div className="border-b border-[#E8E0D3] px-4 py-4">
                    <p className="truncate text-sm font-medium">
                      {user.name || user.email}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#817665]">
                      {user.email}
                    </p>

                    <span className="mt-3 inline-flex rounded-full bg-[#E8E0D3] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#514B3F]">
                      {isAdmin ? "Administrator" : "Customer"}
                    </span>
                  </div>

                  <div className="p-2">
                    {accountLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition hover:bg-[#E8E0D3]"
                        >
                          <Icon size={17} strokeWidth={1.7} />
                          {item.label}
                          <ArrowUpRight
                            size={14}
                            className="ml-auto text-[#817665]"
                          />
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-red-800 transition hover:bg-[#EEE2D9]"
                    >
                      <LogOut size={17} strokeWidth={1.7} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Shopping bag"
            className="relative rounded-full p-2.5 transition hover:bg-[#E8E0D3]"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#292821] px-1 text-[9px] text-[#F7F3EB]">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav className="border-t border-[#E8E0D3] bg-[#F7F3EB] px-5 py-3 lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-[#E8E0D3] py-4 text-sm font-medium"
            >
              {item.label}
              <ArrowUpRight size={16} />
            </Link>
          ))}

          {!isLoggedIn ? (
            <div className="flex gap-3 py-4">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 rounded-sm border border-[#D8D0C2] py-3 text-center text-sm font-medium"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 rounded-sm bg-[#292821] py-3 text-center text-sm font-medium text-[#F7F3EB]"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="py-3">
              <div className="mb-2 flex items-center gap-3 border-b border-[#E8E0D3] px-1 py-3">
                <UserRound size={19} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.email}</p>
                  <p className="mt-1 text-xs text-[#817665]">
                    {isAdmin ? "Administrator" : "Customer"}
                  </p>
                </div>
              </div>

              {accountLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 text-sm"
                  >
                    <Icon size={17} />
                    {item.label}
                    <ArrowUpRight size={14} className="ml-auto" />
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 py-3 text-sm text-red-800"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
