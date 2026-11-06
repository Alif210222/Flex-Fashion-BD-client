
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "../hooks/useCart";
import { useAuth } from "@/context/AuthContext";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoaderCircle className="animate-spin" size={32} />
      <span className="ml-3 text-sm text-neutral-500">
        Loading your cart...
      </span>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  // const isLoggedIn = Boolean(
  //   sessionStorage.getItem("accessToken")
  // );
  const { token } = useAuth();
const isLoggedIn = Boolean(token);

  const { data: cart, isLoading, isError, refetch } =
    useCart(isLoggedIn);

  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const clearMutation = useClearCart();

  const [pendingSku, setPendingSku] = useState(null);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const itemCount = cart?.itemCount ?? 0;
  const canCheckout = cart?.canCheckout ?? false;

  const isChanging =
    updateMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending;

  const changeQuantity = async (item, quantity) => {
    if (quantity < 1 || quantity > 20) return;

    if (quantity > (item.stock ?? 0)) {
      toast.error(
        `Only ${item.stock ?? 0} item(s) are currently available.`
      );
      return;
    }

    setPendingSku(item.variantSku);

    try {
      await updateMutation.mutateAsync({
        sku: item.variantSku,
        quantity,
      });
    } finally {
      setPendingSku(null);
    }
  };

  const removeItem = async (item) => {
    setPendingSku(item.variantSku);

    try {
      await removeMutation.mutateAsync(item.variantSku);
    } finally {
      setPendingSku(null);
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) return;

    if (!window.confirm("Remove all items from your cart?")) {
      return;
    }

    await clearMutation.mutateAsync();
  };

  // if (!isLoggedIn) {
  //   return (
  //     <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
  //       <ShoppingBag size={42} strokeWidth={1.3} />
  //       <h1 className="mt-5 text-2xl font-semibold text-neutral-900">
  //         Your shopping cart
  //       </h1>
  //       <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
  //         Log in to view your cart and continue shopping.
  //       </p>

  //       <button
  //         onClick={() =>
  //           navigate("/login", {
  //             state: { from: "/cart" },
  //           })
  //         }
  //         className="mt-6 bg-neutral-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
  //       >
  //         Log in to continue
  //       </button>
  //     </main>
  //   );
  // }

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-xl font-semibold">
          We couldn't load your cart
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Please check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4f0e8]">
          <ShoppingBag size={34} strokeWidth={1.3} />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-neutral-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Discover something you'll love.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 bg-neutral-900 px-7 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Explore products
          <ArrowRight size={16} />
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfbf8]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <Link
              to="/products"
              className="mb-4 inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900"
            >
              <ArrowLeft size={14} />
              Continue shopping
            </Link>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              Shopping Cart
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <button
            onClick={handleClearCart}
            disabled={isChanging}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={15} />
            Clear cart
          </button>
        </div>

        {cart?.unavailableItems > 0 && (
          <div
            role="alert"
            className="mb-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            Some products or variants are unavailable or have insufficient
            stock. Remove them or adjust their quantities before checkout.
          </div>
        )}

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_350px]">
          <section className="min-w-0">
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_100px] gap-4 border-b border-neutral-200 pb-3 text-xs uppercase tracking-wider text-neutral-500 sm:grid">
              <span>Product</span>
              <span>Quantity</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-neutral-200">
              {items.map((item) => {
                const busy =
                  isChanging && pendingSku === item.variantSku;

                const maxQuantity = Math.min(
                  20,
                  item.stock ?? 0
                );

                return (
                  <article
                    key={item.variantSku}
                    className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_100px_100px] sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 gap-4">
                      <Link
                        to={
                          item.slug
                            ? `/products/${item.slug}`
                            : "/products"
                        }
                        className="h-28 w-24 shrink-0 overflow-hidden bg-[#f1eee8] sm:h-32 sm:w-28"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName ?? "Cart product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag
                              size={24}
                              className="text-neutral-400"
                            />
                          </div>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-col items-start">
                        <Link
                          to={
                            item.slug
                              ? `/products/${item.slug}`
                              : "/products"
                          }
                          className="line-clamp-2 font-medium text-neutral-900 hover:text-neutral-600"
                        >
                          {item.productName ?? "Unavailable product"}
                        </Link>

                        <p className="mt-2 text-xs text-neutral-500">
                          Size: {item.size ?? "—"}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                          {item.colorHex && (
                            <span
                              className="h-3 w-3 rounded-full border border-neutral-300"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          )}
                          Color: {item.color ?? "—"}
                        </div>

                        <p className="mt-2 text-sm font-medium text-neutral-800">
                          {item.unitPrice == null
                            ? "Price unavailable"
                            : formatPrice(item.unitPrice)}
                        </p>

                        {!item.available && (
                          <p className="mt-2 max-w-xs text-xs text-red-600">
                            {item.message ??
                              `Only ${item.stock ?? 0} item(s) are available.`}
                          </p>
                        )}

                        <button
                          onClick={() => removeItem(item)}
                          disabled={isChanging}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:block">
                      <span className="text-xs text-neutral-500 sm:hidden">
                        Quantity
                      </span>

                      <div className="flex h-9 w-fit items-center border border-neutral-300">
                        <button
                          aria-label="Decrease quantity"
                          disabled={
                            busy ||
                            isChanging ||
                            item.quantity <= 1 ||
                            !item.available
                          }
                          onClick={() =>
                            changeQuantity(item, item.quantity - 1)
                          }
                          className="h-full px-2.5 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-8 text-center text-sm tabular-nums">
                          {busy ? "…" : item.quantity}
                        </span>

                        <button
                          aria-label="Increase quantity"
                          disabled={
                            busy ||
                            isChanging ||
                            !item.available ||
                            item.quantity >= maxQuantity
                          }
                          onClick={() =>
                            changeQuantity(item, item.quantity + 1)
                          }
                          className="h-full px-2.5 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:block sm:text-right">
                      <span className="text-xs text-neutral-500 sm:hidden">
                        Item total
                      </span>

                      <span className="text-sm font-semibold text-neutral-900">
                        {item.lineTotal == null
                          ? "—"
                          : formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="border border-neutral-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-neutral-900">
              Order summary
            </h2>

            <div className="mt-6 space-y-4 border-b border-neutral-200 pb-5">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-neutral-500">Items</span>
                <span className="font-medium">{itemCount}</span>
              </div>

              <div className="flex justify-between gap-3 text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-sm">
                <span className="text-neutral-500">Delivery</span>
                <span className="text-neutral-500">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 py-5">
              <span className="font-medium">Estimated total</span>
              <span className="text-xl font-semibold">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mb-4 text-xs leading-5 text-neutral-500">
              Delivery charges, if applicable, will be confirmed during
              checkout.
            </p>

            {/* <button
              onClick={() => navigate("/checkout",  {
  state: {
    source: "cart",
    checkoutItems: items.map((item) => ({
      productId: item.productId,
      variantSku: item.variantSku,
      quantity: item.quantity,
    })),
  },
})}
              disabled={!canCheckout || isChanging}
              className="flex w-full items-center justify-center gap-2 bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              Proceed to checkout
              <ArrowRight size={16} />
            </button> */}

            <button
  onClick={() =>
    navigate("/checkout", {
      state: {
        source: "cart",
        checkoutItems: items.map((item) => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,

          // Display information for checkout
          productName: item.productName,
          image: item.image,
          slug: item.slug,
          size: item.size,
          color: item.color,
          colorHex: item.colorHex,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      },
    })
  }
  disabled={!canCheckout || isChanging}
  className="flex w-full items-center justify-center gap-2 bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
>
  Proceed to checkout
  <ArrowRight size={16} />
</button>

            {!canCheckout && (
              <p className="mt-3 text-xs leading-5 text-red-600">
                Checkout is unavailable until all cart items are valid
                and available.
              </p>
            )}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <ShieldCheck size={15} />
              Secure customer checkout
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
