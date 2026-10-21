
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

import api from "../../services/api";
import ProductCard from "../shared/ProductCard";


async function fetchFeaturedProducts() {
  const response = await api.get("/products", {
    params: {
      limit: 8,
    },
  });

  const body = response.data;

  // Supports common API response formats.
  const products =
    body?.data?.products ??
    body?.data ??
    body?.products ??
    [];

  if (!Array.isArray(products)) {
    throw new Error("Unexpected products API response.");
  }

  return products;
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-sm bg-[#E8E0D3]" />
      <div className="mt-4 h-3 w-24 rounded bg-[#E8E0D3]" />
      <div className="mt-2 h-4 w-3/4 rounded bg-[#E8E0D3]" />
      <div className="mt-3 h-4 w-16 rounded bg-[#E8E0D3]" />
    </div>
  );
}

export default function FeaturedProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeaturedProducts,
    staleTime: 60 * 1000,
  });

  return (
    <section className="bg-[#F7F3EB] py-14 text-[#292821] sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="mb-7 flex items-end justify-between gap-4 sm:mb-9"
        >
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#817665] sm:text-xs">
              Selected for you
            </p>

            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Featured products
            </h2>

            <p className="mt-2 text-sm text-[#777064]">
              Everyday pieces worth reaching for.
            </p>
          </div>

          <Link
            to="/products"
            className="hidden items-center gap-2 border-b border-[#B8AE9D] pb-1 text-xs transition-colors hover:border-[#292821] sm:inline-flex"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#777064]">
              We couldn’t load the products right now.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 border-b border-[#B8AE9D] pb-1 text-sm hover:border-[#292821]"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#777064]">
              No products are available yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-6">
            {products.slice(0, 8).map((product, index) => (
              <motion.div
                key={product._id || product.id || product.slug || index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.4,
                  delay: (index % 4) * 0.06,
                }}
              >
              <ProductCard></ProductCard>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 border-b border-[#B8AE9D] pb-1 text-xs"
          >
            View all products
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
