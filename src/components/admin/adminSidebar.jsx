
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  Settings,
  Store,
  X,
} from "lucide-react";

const menuItems = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-[#e8e0d3] bg-[#f7f3eb]
          transition-transform duration-300 lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#e8e0d3] px-6">
          <NavLink
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292821] text-sm font-bold text-[#f7f3eb]">
              FF
            </span>

            <span>
              <span className="block font-semibold tracking-tight text-[#292821]">
                FLEX FASHION
              </span>
              <span className="text-xs text-[#817665]">
                Admin workspace
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[#817665] hover:bg-[#e8e0d3] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#817665]">
            Store management
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      isActive
                        ? "bg-[#292821] font-medium text-[#f7f3eb]"
                        : "text-[#625d52] hover:bg-[#e8e0d3]"
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-xl border border-[#e8e0d3] px-3 py-3 text-sm text-[#625d52] transition hover:bg-[#e8e0d3]"
          >
            <Store size={18} />
            View storefront
          </NavLink>
        </div>
      </aside>
    </>
  );
}
