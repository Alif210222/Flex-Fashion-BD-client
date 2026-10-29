
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Package,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  UserRound,
  CalendarDays,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
 import api from "../../services/api";

const ORDER_STATUSES = [
 
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const formatPrice = (amount) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderStatus = (order) =>
  String(order?.orderStatus ?? order?.orderStatus ?? "pending").toLowerCase();

const getOrderNumber = (order) =>
  order?.orderNumber ?? order?.orderNo ?? order?._id ?? "—";

const getCustomer = (order) => {
  const address = order?.shippingAddress ?? {};
  const customer = order?.customer ?? order?.user ?? {};

  return {
    name:
      address.fullName ??
      customer.name ??
      order?.customerName ??
      "Customer",
    phone:
      address.phone ??
      customer.phone ??
      order?.phone ??
      "—",
    address: [
      address.addressLine,
      address.area,
      address.district,
      address.division,
    ]
      .filter(Boolean)
      .join(", "),
  };
};

const getItems = (order) =>
  Array.isArray(order?.items) ? order.items : [];

const getItemProduct = (item) =>
  typeof item?.product === "object" && item.product
    ? item.product
    : typeof item?.productId === "object" && item.productId
      ? item.productId
      : {};

const getItemName = (item) => {
  const product = getItemProduct(item);

  return (
    item?.productName ??
    item?.name ??
    product?.name ??
    "Product"
  );
};

const getItemPrice = (item) => {
  const product = getItemProduct(item);

  return Number(
    item?.price ??
      item?.unitPrice ??
      product?.price ??
      0
  );
};

const getItemSubtotal = (item) => {
  const quantity = Number(item?.quantity ?? 1);

  if (item?.subtotal != null) return Number(item.subtotal);
  if (item?.totalPrice != null) return Number(item.totalPrice);

  return getItemPrice(item) * quantity;
};

const getOrderTotal = (order) => {
  const total =
    order?.totalAmount ??
    order?.totalPrice ??
    order?.grandTotal ??
    order?.total;

  if (total != null) return Number(total);

  return getItems(order).reduce(
    (sum, item) => sum + getItemSubtotal(item),
    0
  );
};

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-blue-50 text-blue-800 border-blue-200",
  processing: "bg-violet-50 text-violet-800 border-violet-200",
  shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${
        statusStyles[status] ??
        "border-stone-200 bg-stone-50 text-stone-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function getResponseOrders(response) {
  const body = response?.data;

  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.orders)) return body.data.orders;
  if (Array.isArray(body?.orders)) return body.orders;
  if (Array.isArray(body?.data?.results)) return body.data.results;
  if (Array.isArray(body?.results)) return body.results;

  return [];
}

function getResponseOrder(response) {
  const body = response?.data;

  return (
    body?.data?.order ??
    body?.data ??
    body?.order ??
    body
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  isUpdating,
}) {
  const [newStatus, setNewStatus] = useState(getOrderStatus(order));

  if (!order) return null;

  const customer = getCustomer(order);
  const items = getItems(order);
  const status = getOrderStatus(order);

  const subtotal = items.reduce(
    (sum, item) => sum + getItemSubtotal(item),
    0
  );

  const deliveryCharge = Number(
    order.deliveryCharge ?? order.shippingCost ?? 90
    // eslint-disable-next-line no-undef
    

  );

  const discount = Number(order.discount ?? 0);

  const total = getOrderTotal(order);

  const canChangeStatus = status !== "cancelled" && status !== "delivered";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#e8e0d3] bg-[#fffefa] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e8e0d3] bg-[#fffefa] p-5 sm:p-6">
          <div>
            <p className="text-sm text-stone-500">Order details</p>
            <h2
              id="order-details-title"
              className="mt-1 break-all text-xl font-semibold text-[#292821]"
            >
              #{getOrderNumber(order)}
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-full p-2 text-stone-600 transition hover:bg-[#f2eee6]"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-stone-500">Current status</p>
              <div className="mt-2">
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-stone-500">Order total</p>
              <p className="mt-1 text-2xl font-semibold text-[#292821]">
                {formatPrice(total)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-[#292821]">
              Ordered products ({items.length})
            </h3>

            <div className="divide-y divide-[#eee7dc] rounded-xl border border-[#eee7dc]">
              {items.map((item, index) => {
                const product = getItemProduct(item);

                const image =
                  item?.image ??
                  item?.productImage ??
                  product?.images?.[0]?.url ??
                  product?.images?.[0] ??
                  product?.image;

                return (
                  <div
                    key={item._id ?? item.productId ?? index}
                    className="flex gap-3 p-4"
                  >
                    {typeof image === "string" ? (
                      <img
                        src={image}
                        alt={getItemName(item)}
                        className="h-20 w-16 shrink-0 rounded-lg border border-[#eee7dc] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-[#f4f0e8]">
                        <Package size={23} className="text-stone-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#292821]">
                        {getItemName(item)}
                      </p>

                      <div className="mt-1 space-y-1 text-sm text-stone-500">
                        <p>
                          Size: {item.size ?? item.variant?.size ?? "—"}
                          {" · "}
                          Color: {item.color ?? item.variant?.color ?? "—"}
                        </p>
                        <p>Quantity: {item.quantity ?? 1}</p>
                        <p>Unit price: {formatPrice(getItemPrice(item))}</p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-[#292821]">
                      {formatPrice(getItemSubtotal(item))}
                    </p>
                  </div>
                );
              })}

              {items.length === 0 && (
                <p className="p-5 text-sm text-stone-500">
                  No product items were returned for this order.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f6f2ea] p-4">
              <h3 className="mb-4 font-semibold text-[#292821]">
                Customer & delivery
              </h3>

              <div className="space-y-3 text-sm text-stone-600">
                <p className="flex gap-2">
                  <UserRound size={17} className="shrink-0" />
                  <span>{customer.name}</span>
                </p>

                <p className="flex gap-2">
                  <Phone size={17} className="shrink-0" />
                  <span>{customer.phone}</span>
                </p>

                <p className="flex gap-2">
                  <MapPin size={17} className="shrink-0" />
                  <span>
                    {customer.address || "No delivery address available"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#f6f2ea] p-4">
              <h3 className="mb-4 font-semibold text-[#292821]">
                Payment & summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Payment method</span>
                  <span className="text-right font-medium capitalize text-[#292821]">
                    {(order.paymentMethod ?? "cash_on_delivery")
                      .replaceAll("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Payment status</span>
                  <span className="text-right capitalize text-[#292821]">
                    {order.paymentStatus ?? "pending"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Items subtotal</span>
                  <span className="text-[#292821]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Delivery charge</span>
                  <span className="text-[#292821]">
                    {formatPrice(deliveryCharge)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-500">Discount</span>
                    <span className="text-[#292821]">
                      −{formatPrice(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3 border-t border-[#e5dccd] pt-3 font-semibold">
                  <span className="text-[#292821]">Order total</span>
                  <span className="text-[#292821]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e8e0d3] p-4">
            <h3 className="font-semibold text-[#292821]">
              Update order status
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              Choose the new status and save your changes.
            </p>

            {canChangeStatus ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <select
                    value={newStatus}
                    onChange={(event) => setNewStatus(event.target.value)}
                    disabled={isUpdating}
                    className="w-full appearance-none rounded-xl border border-[#e5dccd] bg-white px-4 py-3 pr-10 text-sm capitalize outline-none focus:border-[#817665]"
                  >
                    {ORDER_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                </div>

                <button
                  type="button"
                  disabled={isUpdating || newStatus === status}
                  onClick={() => onStatusChange(order._id, newStatus)}
                  className="rounded-xl bg-[#292821] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#454338] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save status"}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                This order is {status}. Status changes are disabled here.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await api.get("/orders/admin/all");
      return getResponseOrders(response);
    },
  });

  const {
    data: selectedOrder,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useQuery({
    queryKey: ["admin-order-details", selectedOrderId],
    queryFn: async () => {
      const response = await api.get(
        `/orders/admin/${selectedOrderId}`
      );

      return getResponseOrder(response);
    },
    enabled: Boolean(selectedOrderId),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      return api.patch(`/orders/admin/${orderId}/status`, {
        orderStatus: status,
      });
    },

    onSuccess: async (_, variables) => {
      toast.success("Order status updated successfully");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-orders"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-order-details", variables.orderId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-orders"],
        }),
      ]);
    },

    onError: (mutationError) => {
      toast.error(
        mutationError?.response?.data?.message ??
          "Failed to update order status"
      );
    },
  });

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = getCustomer(order);
      const orderNumber = String(getOrderNumber(order)).toLowerCase();

      const matchesSearch =
        !term ||
        orderNumber.includes(term) ||
        customer.name.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        getOrderStatus(order) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (order) => getOrderStatus(order) === "pending"
      ).length,
      processing: orders.filter((order) =>
        ["confirmed", "processing", "shipped"].includes(
          getOrderStatus(order)
        )
      ).length,
      delivered: orders.filter(
        (order) => getOrderStatus(order) === "delivered"
      ).length,
    };
  }, [orders]);

  const handleStatusChange = (orderId, status) => {
    if (!orderId) {
      toast.error("Order ID is missing");
      return;
    }

    statusMutation.mutate({ orderId, status });
  };

  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4 py-8 text-[#292821] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#817665]">
              Flex-Fashion BD
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Order management
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Manage customer orders and delivery progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#e5dccd] bg-white px-4 py-3 text-sm font-medium transition hover:bg-[#f9f6f0] disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh orders
          </button>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total orders",
              value: stats.total,
              icon: ShoppingBag,
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock3,
            },
            {
              label: "In progress",
              value: stats.processing,
              icon: Truck,
            },
            {
              label: "Delivered",
              value: stats.delivered,
              icon: CheckCircle2,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#e8e0d3] bg-white p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-stone-500">{label}</p>
                <Icon size={19} className="text-[#817665]" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#e8e0d3] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#eee7dc] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-semibold">All orders</h2>
              <p className="mt-1 text-sm text-stone-500">
                {filteredOrders.length} order
                {filteredOrders.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-64">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order or customer..."
                  className="w-full rounded-xl border border-[#e5dccd] py-3 pl-9 pr-3 text-sm outline-none transition focus:border-[#817665]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-[#e5dccd] bg-white px-3 py-3 text-sm capitalize outline-none focus:border-[#817665]"
              >
                <option value="all">All statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5dccd] border-t-[#292821]" />
              <p className="text-sm text-stone-500">
                Loading orders...
              </p>
            </div>
          ) : isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <AlertCircle size={32} className="text-red-500" />
              <p className="mt-3 font-medium">
                Could not load orders
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {error?.response?.data?.message ??
                  "Check your admin login and API endpoint."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl bg-[#292821] px-4 py-2.5 text-sm text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <ShoppingBag size={34} className="text-stone-400" />
              <h3 className="mt-3 font-medium">No orders found</h3>
              <p className="mt-1 text-sm text-stone-500">
                Try another search term or status filter.
              </p>
            </div>
          ) : (
            <>
             {/* // Desktop table  */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-[#faf8f3] text-xs uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-5 py-4 font-medium">Order</th>
                      <th className="px-5 py-4 font-medium">Customer</th>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Items</th>
                      <th className="px-5 py-4 font-medium">Total</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eee7dc]">
                    {filteredOrders.map((order) => {
                      const customer = getCustomer(order);
                      const status = getOrderStatus(order);

                      return (
                        <tr
                          key={order._id}
                          className="transition hover:bg-[#fdfbf7]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold">
                              #{getOrderNumber(order)}
                            </p>
                            <p className="mt-1 text-xs text-stone-400">
                              {String(order._id ?? "").slice(-8)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium">
                              {customer.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-500">
                              {customer.phone}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-stone-500">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={15} />
                              {formatDate(order.createdAt)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {getItems(order).reduce(
                              (sum, item) =>
                                sum + Number(item.quantity ?? 1),
                              0
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold">
                            {formatPrice(getOrderTotal(order))}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={status} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrderId(order._id)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-[#e5dccd] px-3 py-2 text-sm font-medium transition hover:bg-[#f4f0e8]"
                            >
                              <Eye size={15} />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* // Mobile and tablet cards */}
              <div className="divide-y divide-[#eee7dc] lg:hidden">
                {filteredOrders.map((order) => {
                  const customer = getCustomer(order);
                  const status = getOrderStatus(order);

                  return (
                    <article key={order._id} className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-all font-semibold">
                            #{getOrderNumber(order)}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          {customer.phone}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-stone-500">
                            {getItems(order).reduce(
                              (sum, item) =>
                                sum + Number(item.quantity ?? 1),
                              0
                            )}{" "}
                            item(s)
                          </p>
                          <p className="mt-1 font-semibold">
                            {formatPrice(getOrderTotal(order))}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrderId(order._id)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-[#292821] px-4 py-2.5 text-sm text-white"
                        >
                          <Eye size={15} />
                          Details
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-stone-400">
          Flex-Fashion BD · Admin order management
        </p>
      </div>

      {selectedOrderId && (
        isDetailsLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="rounded-xl bg-white px-6 py-5 text-sm">
              Loading order details...
            </div>
          </div>
        ) : isDetailsError || !selectedOrder ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Unable to load order</h2>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  aria-label="Close"
                  className="rounded-full p-2 hover:bg-stone-100"
                >
                  <X size={19} />
                </button>
              </div>
              <p className="mt-3 text-sm text-stone-500">
                Check the individual order endpoint and try again.
              </p>
              <button
                type="button"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["admin-order-details", selectedOrderId],
                  })
                }
                className="mt-4 rounded-xl bg-[#292821] px-4 py-2.5 text-sm text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrderId(null)}
            onStatusChange={handleStatusChange}
            isUpdating={statusMutation.isPending}
          />
        )
      )}
    </main>
  );
}
