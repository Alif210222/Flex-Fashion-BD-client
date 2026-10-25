
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  RefreshCw,
  ImageOff,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

const categories = [
  "t-shirts",
  "hoodies",
  "sweatshirts",
  "shirts",
  "fabrics",
  "others",
];

function getProducts(response) {
  const body = response.data;
  const data = body?.data ?? body;

  if (Array.isArray(data)) return data;

  return data?.products ?? body?.products ?? [];
}

export default function ProductManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await api.get("/products/admin/all");
      return getProducts(response);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted successfully.");
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Could not delete this product."
      );
    },
  });

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.title?.toLowerCase().includes(term) ||
        product.slug?.toLowerCase().includes(term);

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesStatus =
        status === "all" || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const handleDelete = (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name || product.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      deleteMutation.mutate(product._id || product.id);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#817665]">
            Store inventory
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#292821] sm:text-4xl">
            Products
          </h1>
          <p className="mt-2 text-sm text-[#817665]">
            Manage your clothing, pricing, and product visibility.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#292821] px-5 py-3 text-sm font-medium text-[#f7f3eb] transition hover:bg-[#454338]"
        >
          <Plus size={18} />
          Add product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total products"
          value={products.length}
          icon={<Package size={20} />}
        />
        <StatCard
          label="Active products"
          value={products.filter((p) => p.status === "active").length}
          icon={<Package size={20} />}
        />
        <StatCard
          label="Featured products"
          value={products.filter((p) => p.isFeatured).length}
          icon={<Package size={20} />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e8e0d3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#eee8df] p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817665]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name or slug..."
              className="w-full rounded-xl border border-[#e8e0d3] bg-[#fbf9f5] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#817665]"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-[#e8e0d3] bg-[#fbf9f5] px-4 py-3 text-sm text-[#292821] outline-none focus:border-[#817665]"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item.replace("-", " ")}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-[#e8e0d3] bg-[#fbf9f5] px-4 py-3 text-sm text-[#292821] outline-none focus:border-[#817665]"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh products"
            aria-label="Refresh products"
            className="flex items-center justify-center rounded-xl border border-[#e8e0d3] px-4 py-3 text-[#625d52] transition hover:bg-[#f7f3eb]"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-[#f7f3eb]"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="p-10 text-center">
            <p className="font-medium text-[#292821]">
              Couldn't load products.
            </p>
            <p className="mt-2 text-sm text-[#817665]">
              Check your API server and admin permissions.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-[#292821] px-4 py-2 text-sm text-white"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Package
              size={34}
              className="mx-auto mb-3 text-[#b0a696]"
            />
            <p className="font-medium text-[#292821]">
              No products found
            </p>
            <p className="mt-1 text-sm text-[#817665]">
              Add a product or adjust your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#fbf9f5] text-xs uppercase tracking-wider text-[#817665]">
                  <tr>
                    <th className="px-5 py-4 font-medium">Product</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Price</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Featured</th>
                    <th className="px-5 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eee8df]">
                  {filteredProducts.map((product) => {
                    const id = product._id || product.id;
                    const image = product.images?.[0]?.url;

                    return (
                      <tr key={id} className="transition hover:bg-[#fbf9f5]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name || "Product"}
                                className="h-14 w-12 rounded-lg border border-[#e8e0d3] object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-12 items-center justify-center rounded-lg bg-[#f7f3eb] text-[#817665]">
                                <ImageOff size={18} />
                              </div>
                            )}
                            <div className="max-w-56">
                              <p className="truncate text-sm font-medium text-[#292821]">
                                {product.name || product.title}
                              </p>
                              <p className="mt-1 truncate text-xs text-[#817665]">
                                {product.slug || id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm capitalize text-[#625d52]">
                          {product.category?.replace("-", " ")}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-[#292821]">
                          ৳{Number(product.price || 0).toLocaleString("en-BD")}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={product.status} />
                        </td>

                        <td className="px-5 py-4 text-sm text-[#625d52]">
                          {product.isFeatured ? "Yes" : "No"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/products/${id}/edit`}
                              aria-label={`Edit ${product.name || product.title}`}
                              className="rounded-lg border border-[#e8e0d3] p-2 text-[#625d52] hover:bg-[#e8e0d3]"
                            >
                              <Pencil size={16} />
                            </Link>
                            <button
                              type="button"
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(product)}
                              aria-label={`Delete ${product.name || product.title}`}
                              className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filteredProducts.map((product) => {
                const id = product._id || product.id;

                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[#e8e0d3] p-3"
                  >
                    <div className="flex gap-3">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name || "Product"}
                          className="h-20 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-[#f7f3eb]">
                          <ImageOff size={18} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[#292821]">
                          {product.name || product.title}
                        </p>
                        <p className="mt-1 text-sm capitalize text-[#817665]">
                          {product.category?.replace("-", " ")}
                        </p>
                        <p className="mt-1 font-semibold text-[#292821]">
                          ৳{Number(product.price || 0).toLocaleString("en-BD")}
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={product.status} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-[#eee8df] pt-3">
                      <Link
                        to={`/admin/products/${id}/edit`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e8e0d3] py-2 text-sm"
                      >
                        <Pencil size={15} /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deleteMutation.isPending}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 py-2 text-sm text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="border-t border-[#eee8df] px-5 py-4 text-xs text-[#817665]">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#e8e0d3] bg-white p-5">
      <div>
        <p className="text-sm text-[#817665]">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-[#292821]">
          {value}
        </p>
      </div>
      <div className="rounded-xl bg-[#f7f3eb] p-3 text-[#625d52]">
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-green-50 text-green-700",
    draft: "bg-amber-50 text-amber-700",
    archived: "bg-stone-100 text-stone-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] || "bg-stone-100 text-stone-600"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}
