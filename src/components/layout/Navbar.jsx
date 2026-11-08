
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  UserRound,
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import CartCount from "../CartCount";

const navigation = [
  { label: "Products", href: "/products?sort=newest" },
  { label: "T-Shirts", href: "/products?category=t-shirts" },
  { label: "Hoodies", href: "/products?category=hoodies" },
  { label: "Fabrics", href: "/products?category=fabrics" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(user && token);
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  };

  const accountLinks = isAdmin
    ? [
        {
          label: "Admin Dashboard",
          href: "/admin/overview",
          icon: LayoutDashboard,
        },
      ]
    : [
        {
          label: "Order List",
          href: "/my-orders",
          icon: ClipboardList,
        },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0D3] bg-[#F7F3EB]/95 text-[#292821] backdrop-blur-md">
      <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center gap-2 px-3 sm:h-[76px] sm:gap-3 sm:px-6 lg:px-12">

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => {
            setMobileMenuOpen((open) => !open);
            setAccountOpen(false);
          }}
          className="shrink-0 rounded-full p-2 transition hover:bg-[#E8E0D3] lg:hidden"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand */}
        <Link
          to="/"
          aria-label="Flex Fashion home"
          className="min-w-0 shrink text-sm font-black tracking-[-0.08em] sm:text-xl lg:text-2xl"
        >
          FLEX Fashion BD<span className="text-[#8C8170]">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8">
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

        {/* Action Buttons */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">

          {/* Account Area */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                className="rounded-sm border px-2 py-2 text-[11px] font-medium transition hover:bg-[#E8E0D3] sm:px-4 sm:text-sm"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-sm bg-[#c1c0b8] px-2.5 py-2.5 text-[11px] font-medium text-[#F7F3EB] transition hover:bg-[#7e7b74] sm:px-4 sm:text-sm"
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
                }}
                className="flex max-w-[130px] items-center gap-1 rounded-full px-1.5 py-2 transition hover:bg-[#E8E0D3] sm:max-w-[220px] sm:gap-2 sm:px-3"
              >
                <UserRound
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0"
                />

                <span className="max-w-[65px] truncate text-[11px] font-medium sm:max-w-[140px] sm:text-sm">
                  {user.email}
                </span>

                <ChevronDown
                  size={15}
                  className={`shrink-0 transition-transform ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Desktop Account Dropdown */}
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
            className="relative shrink-0 rounded-full p-2 transition hover:bg-[#E8E0D3] sm:p-2.5"
          >
            <CartCount />
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="max-h-[calc(100vh-68px)] overflow-y-auto border-t border-[#E8E0D3] bg-[#F7F3EB] px-4 py-3 sm:px-6 lg:hidden">

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
            <div className="flex gap-3 py-4 hidden">
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
                className="flex-1 rounded-sm bg-[#9f9e99] py-3 text-center text-sm font-medium text-[#F7F3EB]"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="py-3">
              <div className="mb-2 flex items-center gap-3 border-b border-[#E8E0D3] px-1 py-3">
                <UserRound size={19} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.email}
                  </p>

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
