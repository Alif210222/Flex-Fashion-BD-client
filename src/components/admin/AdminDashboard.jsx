
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import api from "../../services/api";

function getProducts(response) {
  const body = response.data;
  const data = body?.data ?? body;

  if (Array.isArray(data)) return data;
  return data?.products ?? body?.products ?? [];
}

export default function AdminDashboard() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await api.get("/products/admin/all");
      return getProducts(response);
    },
  });

  const active = products.filter((p) => p.status === "active").length;
  const featured = products.filter((p) => p.isFeatured).length;
  const totalStock = products.reduce(
    (sum, product) =>
      sum +
      (product.variants || []).reduce(
        (variantSum, variant) =>
          variantSum + Number(variant.stock || 0),
        0
      ),
    0
  );

  const stats = [
    {
      label: "Total products",
      value: products.length,
      icon: Package,
    },
    {
      label: "Active products",
      value: active,
      icon: ShoppingBag,
    },
    {
      label: "Featured products",
      value: featured,
      icon: TrendingUp,
    },
    {
      label: "Units in stock",
      value: totalStock,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-[#292821] p-6 text-[#f7f3eb] sm:p-9">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d3c8b8]">
          Flex-Fashion BD
        </p>

        <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Your store, all in one place.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#d3c8b8]">
              Manage your inventory, update product details, and
              prepare your latest collections for customers.
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f7f3eb] px-5 py-3 text-sm font-semibold text-[#292821] transition hover:bg-[#e8e0d3]"
          >
            <Plus size={17} />
            Add new product
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#292821]">
            Store overview
          </h2>
          <p className="mt-1 text-sm text-[#817665]">
            A snapshot of your current product inventory.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#e8e0d3] bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#817665]">
                    {stat.label}
                  </p>
                  <div className="rounded-xl bg-[#f7f3eb] p-2.5 text-[#625d52]">
                    <Icon size={19} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-semibold text-[#292821]">
                  {isLoading ? "—" : stat.value.toLocaleString("en-BD")}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#292821]">
              Recently added products
            </h2>
            <p className="mt-1 text-sm text-[#817665]">
              Review your latest inventory.
            </p>
          </div>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#625d52] hover:text-[#292821]"
          >
            All products <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-5 h-24 animate-pulse rounded-xl bg-[#f7f3eb]" />
        ) : products.length === 0 ? (
          <div className="mt-5 rounded-xl bg-[#fbf9f5] px-5 py-10 text-center">
            <Package size={30} className="mx-auto text-[#a99e8d]" />
            <p className="mt-3 font-medium text-[#292821]">
              Your inventory is ready for its first product.
            </p>
            <p className="mt-1 text-sm text-[#817665]">
              Upload a T-shirt, hoodie, or fabric item to get started.
            </p>
            <Link
              to="/admin/products/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#292821] px-4 py-2.5 text-sm text-white"
            >
              <Plus size={16} /> Create first product
            </Link>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-[#eee8df]">
            {[...products]
              .sort(
                (a, b) =>
                  new Date(b.createdAt || 0) -
                  new Date(a.createdAt || 0)
              )
              .slice(0, 5)
              .map((product) => (
                <div
                  key={product._id || product.id}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name || "Product"}
                      className="h-14 w-12 rounded-lg border border-[#e8e0d3] object-cover"
                    />
                  ) : (
                    <div className="h-14 w-12 rounded-lg bg-[#f7f3eb]" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#292821]">
                      {product.name || product.title}
                    </p>
                    <p className="mt-1 text-xs capitalize text-[#817665]">
                      {product.category?.replace("-", " ")}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-[#292821]">
                    ৳{Number(product.price || 0).toLocaleString("en-BD")}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
