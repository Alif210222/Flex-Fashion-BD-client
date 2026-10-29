
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const formatPrice = (amount) =>
  `৳${(Number(amount) || 0).toLocaleString("en-BD")}`;

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getOrderItems = (order) =>
  order?.items ?? order?.orderItems ?? [];

const getProduct = (item) =>
  typeof item?.product === "object" ? item.product : item?.productSnapshot ?? {};

const getItemImage = (item) => {
  const product = getProduct(item);
  const firstImage = product?.images?.[0];

  return (
    (typeof firstImage === "string" ? firstImage : firstImage?.url) ??
    item?.image ??
    item?.productImage ??
    ""
  );
};

const getOrderTotal = (order) =>
  order?.totalAmount ??
  order?.totalPrice ??
  order?.grandTotal ??
  order?.total ??
  0;

const getStatus = (order) =>
  String(order?.orderStatus  ?? "pending").toLowerCase();

const statusStyles = {
  pending: "bg-[#f5eddb] text-[#85692d]",
  confirmed: "bg-[#e4eee3] text-[#416846]",
  processing: "bg-[#e9e7f3] text-[#5e5588]",
  shipped: "bg-[#e3edf5] text-[#426b8c]",
  delivered: "bg-[#e1eee7] text-[#356e53]",
  returned: "bg-[#f4e5e2] text-[#9b5147]",
  cancelled: "bg-[#eeeae4] text-[#777064]",
};

const MyOrders = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await api.get("/orders/my-orders");
      const payload = response.data?.data;

      const list = Array.isArray(payload)
        ? payload
        : payload?.orders ?? response.data?.orders ?? [];

      if (!Array.isArray(list)) {
        throw new Error("Unexpected orders response format.");
      }

      return list;
    },
  });

  console.log(orders);

  const handleCancel = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      await api.patch(`/orders/my-orders/${orderId}/cancel`);

      toast.success("Order cancelled successfully.");

      await queryClient.invalidateQueries({
        queryKey: ["my-orders"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-order", orderId],
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ?? "Unable to cancel this order."
      );
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f3eb]">
        <div className="flex items-center gap-3 text-sm text-[#817665]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading your orders...
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-[60vh] bg-[#f7f3eb] px-5 py-20 text-[#292821]">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#e8e0d3] bg-white p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-[#817665]" />
          <h1 className="mt-4 text-xl font-semibold">
            Couldn't load your orders
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#817665]">
            Please sign in if required, then try loading your orders again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 rounded-full bg-[#292821] px-6 py-3 text-sm text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4 py-10 text-[#292821] sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#817665] transition hover:text-[#292821]"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#817665]">
              Your account
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              My orders
            </h1>
            <p className="mt-3 text-sm text-[#817665]">
              Track your purchases and check order details.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-full border border-[#dcd3c6] bg-white px-4 py-2.5 text-sm transition hover:bg-[#f1ece3] disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#e8e0d3] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f3eb]">
            <PackageCheck size={21} />
          </div>
          <div>
            <p className="font-medium">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
            <p className="mt-1 text-sm text-[#817665]">
              All your orders in one place.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#e8e0d3] bg-white px-6 py-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#b6aa98]" />
            <h2 className="mt-5 text-xl font-semibold">
              No orders yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#817665]">
              Your confirmed orders will appear here. Find something you love
              and place your first order.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-[#292821] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#49463d]"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => {
              const orderId = order._id ?? order.id;
              const items = getOrderItems(order);
              const status = getStatus(order);
              const expanded = expandedId === orderId;

              return (
                <article
                  key={orderId}
                  className="overflow-hidden rounded-2xl border border-[#e8e0d3] bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eee8df] px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-xs text-[#817665]">Order number</p>
                      <p className="mt-1 font-semibold">
                        #{String(orderId ?? "").slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-[#817665]">
                        Placed {formatDate(order.createdAt ?? order.orderDate)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                      getStatus ?? statusStyles.pending
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f7f3eb]">
                          {getItemImage(items[0]) ? (
                            <img
                              src={getItemImage(items[0])}
                              alt={getProduct(items[0])?.name ?? "Ordered product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={25} className="text-[#a69a88]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="font-medium">
                            {getProduct(items[0])?.name ??
                              items[0]?.productName ??
                              "Your order"}
                          </h2>
                          <p className="mt-1 text-sm text-[#817665]">
                            {items.length} {items.length === 1 ? "item" : "items"}
                          </p>
                          {items.length > 1 && (
                            <p className="mt-1 text-xs text-[#817665]">
                              Includes multiple products
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs text-[#817665]">Order total</p>
                        <p className="mt-1 text-xl font-semibold">
                          {formatPrice(getOrderTotal(order))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3 border-t border-[#eee8df] pt-5">
                      <button
                        onClick={() =>
                          setExpandedId(expanded ? null : orderId)
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-[#292821] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#49463d]"
                      >
                        {expanded ? "Hide details" : "View details"}
                        {expanded ? (
                          <ChevronUp size={15} />
                        ) : (
                          <ChevronDown size={15} />
                        )}
                      </button>

                      {status === "pending" && (
                        <button
                          onClick={() => handleCancel(orderId)}
                          className="rounded-full border border-[#e8e0d3] px-5 py-2.5 text-sm transition hover:bg-[#f7f3eb]"
                        >
                          Cancel order
                        </button>
                      )}
                    </div>

                    {expanded && (
                      <div className="mt-6 space-y-5 border-t border-[#eee8df] pt-5">
                        <h3 className="font-semibold">Order details</h3>

                        {items.map((item, index) => {
                          const product = getProduct(item);
                          const slug = product?.slug ?? item?.productSlug;

                          return (
                            <div
                              key={item._id ?? item.sku ?? index}
                              className="flex items-center gap-3"
                            >
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f7f3eb]">
                                {getItemImage(item) ? (
                                  <img
                                    src={getItemImage(item)}
                                    alt={product?.name ?? "Product"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>

                              <div className="min-w-0 flex-1">
                                {slug ? (
                                  <Link
                                    to={`/products/${slug}`}
                                    className="text-sm font-medium hover:underline"
                                  >
                                    {product?.name ?? item?.productName ?? "View product"}
                                    <ArrowUpRight
                                      className="ml-1 inline"
                                      size={13}
                                    />
                                  </Link>
                                ) : (
                                  <p className="text-sm font-medium">
                                    {product?.name ?? item?.productName ?? "Product"}
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-[#817665]">
                                  Size: {item.size ?? item.variant?.size ?? "—"}
                                  {" · "}
                                  Color: {item.color ?? item.variant?.color ?? "—"}
                                  {" · "}
                                  Qty: {item.quantity ?? 1}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-medium">
                                {/* {formatPrice(
                                  item.subtotal ??
                                    (Number(item.price ?? product?.price) || 0) *
                                      (Number(item.quantity) || 1)
                                )} */}

                                 {formatPrice(getOrderTotal(order))}
                              </p>
                            </div>
                          );
                        })}

                        <div className="grid gap-4 rounded-xl bg-[#f7f3eb] p-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-[#817665]">
                              Delivery address
                            </p>
                            <p className="mt-2 text-sm font-medium">
                              {order.shippingAddress?.fullName ??
                                order.shippingAddress?.name ??
                                order.customer?.name ??
                                "—"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#817665]">
                              {[
                                order.shippingAddress?.addressLine,
                                order.shippingAddress?.area,
                                order.shippingAddress?.district,
                                order.shippingAddress?.division,
                              ]
                                .filter(Boolean)
                                .join(", ") || "Address unavailable"}
                            </p>
                            <p className="mt-1 text-sm text-[#817665]">
                              {order.shippingAddress?.phone ??
                                order.customer?.phone ??
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[#817665]">
                              Payment method
                            </p>
                            <p className="mt-2 text-sm font-medium">
                              {order.paymentMethod === "cod" ||
                              order.paymentMethod === "cash_on_delivery"
                                ? "Cash on Delivery"
                                : order.paymentMethod ?? "Cash on Delivery"}
                            </p>
                            <p className="mt-4 text-xs text-[#817665]">
                              Last updated
                            </p>
                            <p className="mt-1 text-sm">
                              {formatDate(order.updatedAt ?? order.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOrders;
