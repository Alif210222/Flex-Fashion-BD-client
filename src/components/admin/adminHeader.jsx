import { Menu,  ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e8e0d3] bg-[#f7f3eb]/95 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-[#292821] hover:bg-[#e8e0d3] lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm font-semibold text-[#292821]">
            Admin workspace
          </p>
          <p className="hidden text-xs text-[#817665] sm:block">
            Manage your Flex-Fashion store
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <Link
          to="/"
          aria-label="View storefront"
          className="rounded-full p-2 text-[#817665] transition hover:bg-[#e8e0d3] hover:text-[#292821]"
        >
          <ExternalLink size={19} />
        </Link>

        {/* <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="rounded-full p-2 text-[#817665] transition hover:bg-[#e8e0d3] hover:text-[#292821]"
        >
          <Bell size={19} />
        </button> */}

        <div className="flex items-center gap-3 border-l border-[#e8e0d3] pl-3 sm:pl-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#292821] text-sm font-semibold uppercase text-[#f7f3eb]">
            {(user?.name || user?.email || "A").charAt(0)}
          </div>

          <div className="hidden sm:block">
            <p className="max-w-40 truncate text-sm font-medium text-[#292821]">
              {user?.name || "Administrator"}
            </p>
            <p className="max-w-40 truncate text-xs text-[#817665]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}