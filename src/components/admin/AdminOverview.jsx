
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
//   ArrowDownRight,
//   ArrowUpRight,
  Banknote,
//   CalendarDays,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const money = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;

const dateLabel = (date, options = {}) => {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...options,
  });
};

const orderStatus = (order) =>
  String(order?.orderStatus ?? order?.status ?? "pending").toLowerCase();

const orderTotal = (order) => {
  const total =
    order?.totalAmount ??
    order?.totalPrice ??
    order?.grandTotal ??
    order?.total;

  if (total != null) return Number(total) || 0;

  return (order?.items ?? []).reduce((sum, item) => {
    const price = Number(
      item?.price ??
      item?.unitPrice ??
      item?.product?.price ??
      item?.productId?.price ??
      0
    );

    const quantity = Number(item?.quantity ?? 1);

    return sum + Number(item?.subtotal ?? price * quantity);
  }, 0);
};

const extractOrders = (response) => {
  const body = response?.data;

  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.orders)) return body.data.orders;
  if (Array.isArray(body?.orders)) return body.orders;
  if (Array.isArray(body?.data?.results)) return body.data.results;
  if (Array.isArray(body?.results)) return body.results;

  return [];
};

const extractProducts = (response) => {
  const body = response?.data;

  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.products)) return body.data.products;
  if (Array.isArray(body?.products)) return body.products;
  if (Array.isArray(body?.data?.results)) return body.data.results;
  if (Array.isArray(body?.results)) return body.results;

  return [];
};

const statusColors = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-blue-50 text-blue-800",
  processing: "bg-violet-50 text-violet-800",
  shipped: "bg-indigo-50 text-indigo-800",
  delivered: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-red-50 text-red-800",
  returned: "bg-orange-50 text-orange-800",
};

function MetricCard({ title, value, description, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-[#e8e0d3] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">{title}</p>
        <span className="rounded-xl bg-[#f6f2ea] p-2.5">
          <Icon size={19} className="text-[#817665]" />
        </span>
      </div>

      <p className="mt-5 break-words text-2xl font-semibold tracking-tight text-[#292821] sm:text-3xl">
        {value}
      </p>

      <p className="mt-2 text-xs text-stone-500">{description}</p>
    </article>
  );
}

function SalesChart({ orders, period }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

    const buckets = Array.from({ length: days }, (_, index) => {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (days - 1 - index));

      return {
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        date,
        label:
          days === 7
            ? date.toLocaleDateString("en-US", { weekday: "short" })
            : date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              }),
        sales: 0,
        orders: 0,
      };
    });

    const bucketMap = new Map(
      buckets.map((bucket) => [bucket.key, bucket])
    );

    orders.forEach((order) => {
      const status = orderStatus(order);

      // Cancelled and returned orders are excluded from sales.
      if (["cancelled", "returned"].includes(status)) return;

      const createdAt = new Date(order.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;

      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}-${createdAt.getDate()}`;
      const bucket = bucketMap.get(key);

      if (!bucket) return;

      bucket.sales += orderTotal(order);
      bucket.orders += 1;
    });

    return buckets;
  }, [orders, period]);

  const width = 720;
  const height = 250;
  const padding = { top: 20, right: 16, bottom: 38, left: 16 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    100,
    ...chartData.map((point) => point.sales)
  );

  const points = chartData.map((point, index) => {
    const x =
      padding.left +
      (chartData.length === 1
        ? plotWidth / 2
        : (index / (chartData.length - 1)) * plotWidth);

    const y =
      padding.top + plotHeight - (point.sales / maxValue) * plotHeight;

    return { ...point, x, y };
  });

  const line = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${
        padding.top + plotHeight
      } L ${points[0].x} ${padding.top + plotHeight} Z`
    : "";

  const labelEvery =
    chartData.length <= 7 ? 1 : chartData.length <= 30 ? 5 : 15;

  const totalSales = chartData.reduce(
    (sum, point) => sum + point.sales,
    0
  );

  const totalOrders = chartData.reduce(
    (sum, point) => sum + point.orders,
    0
  );

  return (
    <section className="rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold">Sales overview</h2>
          <p className="mt-1 text-sm text-stone-500">
            Daily order value, excluding cancelled and returned orders.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-stone-500">Period sales</p>
          <p className="mt-1 text-2xl font-semibold">{money(totalSales)}</p>
          <p className="mt-1 text-xs text-stone-500">
            {totalOrders} non-cancelled order(s)
          </p>
        </div>
      </div>

      {totalOrders === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Activity size={30} className="text-stone-300" />
          <p className="mt-3 font-medium">No sales activity in this period</p>
          <p className="mt-1 text-sm text-stone-500">
            The graph will update when orders are placed.
          </p>
        </div>
      ) : (
        <div className="mt-6 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Sales chart showing ${money(totalSales)} over the selected period`}
            className="h-auto w-full overflow-visible"
          >
            {[0, 1, 2, 3].map((step) => {
              const y = padding.top + (plotHeight / 3) * step;

              return (
                <line
                  key={step}
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#eee7dc"
                  strokeDasharray="4 5"
                />
              );
            })}

            <path d={area} fill="#e8e0d3" opacity="0.65" />
            <path
              d={line}
              fill="none"
              stroke="#817665"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((point, index) => (
              <g key={point.key}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={chartData.length <= 7 ? 4 : 2.5}
                  fill="#292821"
                >
                  <title>
                    {point.label}: {money(point.sales)} ({point.orders} orders)
                  </title>
                </circle>

                {(index % labelEvery === 0 ||
                  index === points.length - 1) && (
                  <text
                    x={point.x}
                    y={height - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#817665"
                  >
                    {point.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}

export default function AdminOverview() {
  const [period, setPeriod] = useState("7d");

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
    isFetching: ordersFetching,
  } = useQuery({
    queryKey: ["admin-overview-orders"],
    queryFn: async () => {
      const response = await api.get("/orders/admin/all");
      return extractOrders(response);
    },
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
    isFetching: productsFetching,
  } = useQuery({
    queryKey: ["admin-overview-products"],
    queryFn: async () => {
      const response = await api.get("/products");
      return extractProducts(response);
    },
  });

  const loading = ordersLoading || productsLoading;
  const hasError = ordersError || productsError;

  const metrics = useMemo(() => {
    const counts = Object.fromEntries(
      STATUSES.map((status) => [status, 0])
    );

    let sales = 0;
    let deliveredSales = 0;
    let completedOrders = 0;
    let totalItems = 0;

    orders.forEach((order) => {
      const status = orderStatus(order);

      if (counts[status] !== undefined) counts[status] += 1;

      if (!["cancelled", "returned"].includes(status)) {
        sales += orderTotal(order);
      }

      if (status === "delivered") {
        deliveredSales += orderTotal(order);
        completedOrders += 1;
      }

      (order.items ?? []).forEach((item) => {
        totalItems += Number(item.quantity ?? 1);
      });
    });

    const activeProducts = products.filter(
      (product) => product.status === "active"
    ).length;

    const lowStockVariants = products.reduce((count, product) => {
      const variants = product.variants ?? [];

      if (variants.length === 0) {
        return count + (Number(product.stock ?? 0) <= 5 ? 1 : 0);
      }

      return (
        count +
        variants.filter((variant) => {
          const stock = Number(variant.stock ?? variant.quantity ?? 0);
          return stock > 0 && stock <= 5;
        }).length
      );
    }, 0);

    return {
      totalOrders: orders.length,
      sales,
      deliveredSales,
      completedOrders,
      totalItems,
      activeProducts,
      totalProducts: products.length,
      lowStockVariants,
      counts,
    };
  }, [orders, products]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
        )
        .slice(0, 6),
    [orders]
  );

  const refresh = async () => {
    await Promise.all([refetchOrders(), refetchProducts()]);
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f3eb]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#e5dccd] border-t-[#292821]" />
          <p className="mt-4 text-sm text-stone-500">
            Loading business overview...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4 py-8 text-[#292821] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#817665]">
              Flex-Fashion BD
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Business overview
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              A snapshot of your orders, sales and product inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={ordersFetching || productsFetching}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#e5dccd] bg-white px-4 py-3 text-sm font-medium hover:bg-[#f9f6f0] disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={
                ordersFetching || productsFetching ? "animate-spin" : ""
              }
            />
            Refresh data
          </button>
        </header>

        {hasError && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Could not load all dashboard data. Check your admin login and
              the orders/products API endpoints.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="self-start font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total sales"
            value={money(metrics.sales)}
            description="Excludes cancelled and returned orders"
            icon={Banknote}
          />

          <MetricCard
            title="Total orders"
            value={metrics.totalOrders.toLocaleString()}
            description={`${metrics.completedOrders} delivered orders`}
            icon={ShoppingBag}
          />

          <MetricCard
            title="Total products"
            value={metrics.totalProducts.toLocaleString()}
            description={`${metrics.activeProducts} marked active`}
            icon={Package}
          />

          <MetricCard
            title="Pending orders"
            value={metrics.counts.pending}
            description="Orders awaiting confirmation"
            icon={Clock3}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Delivered sales"
            value={money(metrics.deliveredSales)}
            description="Value of delivered orders"
            icon={CheckCircle2}
          />

          <MetricCard
            title="Items ordered"
            value={metrics.totalItems.toLocaleString()}
            description="Sum of quantities across orders"
            icon={Truck}
          />

          <MetricCard
            title="Low-stock variants"
            value={metrics.lowStockVariants.toLocaleString()}
            description="Variants with stock between 1 and 5"
            icon={Package}
          />
        </section>

        <SalesChart orders={orders} period={period === "all" ? "90d" : period} />

        <section className="rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Sales graph range</h2>
            <p className="mt-1 text-sm text-stone-500">
              Change the period shown in the graph.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Last 7 days", value: "7d" },
              { label: "Last 30 days", value: "30d" },
              { label: "Last 90 days", value: "90d" },
            ].map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                  period === option.value
                    ? "border-[#292821] bg-[#292821] text-white"
                    : "border-[#e5dccd] bg-white text-[#292821] hover:bg-[#f6f2ea]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* <section className="rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Order status overview</h2>
              <p className="mt-1 text-sm text-stone-500">
                Current status of recorded orders.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="shrink-0 text-sm font-medium underline underline-offset-4"
            >
              Manage orders
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="rounded-xl border border-[#eee7dc] p-4"
              >
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    statusColors[status]
                  }`}
                >
                  {status}
                </span>
                <p className="mt-3 text-2xl font-semibold">
                  {metrics.counts[status]}
                </p>
                <p className="mt-1 text-xs text-stone-500">orders</p>
              </div>
            ))}
          </div>
        </section> */}

        {/* <section className="overflow-hidden rounded-2xl border border-[#e8e0d3] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#eee7dc] p-5">
            <div>
              <h2 className="text-lg font-semibold">Recent orders</h2>
              <p className="mt-1 text-sm text-stone-500">
                Latest six orders received.
              </p>
            </div>
            <ShoppingBag size={20} className="text-[#817665]" />
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingBag className="mx-auto text-stone-400" size={30} />
              <p className="mt-3 font-medium">No orders yet</p>
              <p className="mt-1 text-sm text-stone-500">
                New customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eee7dc]">
              {recentOrders.map((order) => {
                const address = order.shippingAddress ?? {};
                const customer = order.customer ?? order.user ?? {};
                const name =
                  address.fullName ??
                  customer.name ??
                  order.customerName ??
                  "Customer";
                const status = orderStatus(order);

                return (
                  <div
                    key={order._id}
                    className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="min-w-0">
                      <p className="break-all font-semibold">
                        #{order.orderNumber ?? order.orderNo ?? order._id}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {name} · {dateLabel(order.createdAt, {
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div>
                        <p className="font-semibold">
                          {money(orderTotal(order))}
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            statusColors[status] ??
                            "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <Link
                        to="/admin/orders"
                        className="rounded-lg border border-[#e5dccd] px-3 py-2 text-sm hover:bg-[#f6f2ea]"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section> */}

        <footer className="pb-4 text-center text-xs text-stone-400">
          Flex-Fashion BD · Business overview
        </footer>
      </div>
    </main>
  );
}
