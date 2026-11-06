import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";

export default function CartCount() {
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);

  const { data: cart } = useCart(isLoggedIn);

  const count = cart?.itemCount ?? 0;

  return (
    <Link
      to="/cart"
      aria-label={`Shopping cart, ${count} items`}
      className="relative inline-flex items-center justify-center p-2 text-neutral-800 hover:text-neutral-500"
    >
      <ShoppingBag size={21} strokeWidth={1.6} />

      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}