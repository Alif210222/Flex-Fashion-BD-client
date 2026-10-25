
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
//   ArrowRight,
  ArrowUp,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";

import api from "../services/api";
import ProductCard from "../components/shared/ProductCard";

const categories = [
  { id: "all", name: "All Products" },
  { id: "t-shirts", name: "T-Shirts" },
  { id: "hoodies", name: "Hoodies" },
  { id: "sweatshirts", name: "Sweatshirts" },
  { id: "shirts", name: "Shirts" },
  { id: "fabrics", name: "Fabrics" },
  { id: "drop-shoulder", name: "Drop Shoulder" },
  { id: "jackets", name: "Jackets" },
  { id: "others", name: "Others" },
];

const categorySections = categories.filter(
  (category) => category.id !== "all"
);

async function fetchProducts() {
  const response = await api.get("/products", {
    params: {
      limit: 100,
      page: 1,
      sort: "newest",
    },
  });

  const body = response.data;
  const products = body?.data?.products;

  if (!Array.isArray(products)) {
    throw new Error("Unable to read products from the server.");
  }

  return products.filter(
    (product) => product && typeof product === "object"
  );
}

function matchesCategory(product, categoryId) {
  const category = String(product.category || "").toLowerCase();
  const subcategory = String(product.subcategory || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .trim();

  if (categoryId === "drop-shoulder") {
    return (
      category === "t-shirts" &&
      subcategory.replace(/\s+/g, "-") === "drop-shoulder"
    );
  }

  if (categoryId === "jackets") {
    return (
      category === "others" &&
      subcategory.replace(/\s+/g, "-") === "jackets"
    );
  }

  if (categoryId === "others") {
    return (
      category === "others" &&
      subcategory.replace(/\s+/g, "-") !== "jackets"
    );
  }

  return category === categoryId;
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-sm bg-[#E8E0D3]" />
      <div className="mt-4 h-3 w-20 rounded bg-[#E8E0D3]" />
      <div className="mt-2 h-4 w-3/4 rounded bg-[#E8E0D3]" />
      <div className="mt-3 h-4 w-16 rounded bg-[#E8E0D3]" />
    </div>
  );
}

function EmptyProducts({ message }) {
  return (
    <div className="rounded-sm border border-dashed border-[#D8CEBF] px-5 py-12 text-center">
      <p className="text-sm text-[#817665]">{message}</p>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
//   const [showFilters, setShowFilters] = useState(false);

  const sectionRefs = useRef({});
  const searchInputRef = useRef(null);

  const activeCategory = searchParams.get("subcategory")
    ? searchParams.get("subcategory") === "drop-shoulder"
      ? "drop-shoulder"
      : searchParams.get("subcategory") === "jackets"
        ? "jackets"
        : searchParams.get("category") || "all"
    : searchParams.get("category") || "all";

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["products-page"],
    queryFn: fetchProducts,
    staleTime: 60 * 1000,
  });

  // Filter products by search term.
  const searchedProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      if (!term) return true;

      return [
        product.name,
        product.description,
        product.category,
        product.subcategory,
        product.brand,
        ...(Array.isArray(product.tags) ? product.tags : []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [products, search]);

  // Sort the filtered results.
  const visibleProducts = useMemo(() => {
    const result = [...searchedProducts];

    if (sort === "price_asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price_desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [searchedProducts, sort]);

  const productsByCategory = useMemo(() => {
    return Object.fromEntries(
      categorySections.map((category) => [
        category.id,
        visibleProducts.filter((product) =>
          matchesCategory(product, category.id)
        ),
      ])
    );
  }, [visibleProducts]);

  // Scroll to a selected category when arriving via a category link.
  useEffect(() => {
    const subcategory = searchParams.get("subcategory");
    const category = subcategory || searchParams.get("category");

    if (!category || category === "all") return;

    const targetId = categories.some((item) => item.id === category)
      ? category
      : "all";

    const timeout = window.setTimeout(() => {
      sectionRefs.current[targetId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  function selectCategory(categoryId) {
    const nextParams = new URLSearchParams(searchParams);

    if (categoryId === "all") {
      nextParams.delete("category");
      nextParams.delete("subcategory");
    } else if (categoryId === "drop-shoulder") {
      nextParams.set("category", "t-shirts");
      nextParams.set("subcategory", "drop-shoulder");
    } else if (categoryId === "jackets") {
      nextParams.set("category", "others");
      nextParams.set("subcategory", "jackets");
    } else {
      nextParams.set("category", categoryId);
      nextParams.delete("subcategory");
    }

    setSearchParams(nextParams, { replace: true });

    if (categoryId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sectionRefs.current[categoryId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function clearSearch() {
    setSearch("");
    searchInputRef.current?.focus();
  }

  return (
    <main className="min-h-screen bg-[#F7F3EB] text-[#292821]">
      {/* Page heading and search */}
      <section className="border-b border-[#E4DBCE]">
        <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#817665] sm:text-xs">
              The Flex-Fashion collection
            </p>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
                  Shop all products
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#817665]">
                  Find your everyday essentials, comfortable fits, and
                  timeless wardrobe pieces.
                </p>
              </div>

              <p className="text-xs text-[#817665]">
                {isLoading
                  ? "Loading collection..."
                  : `${visibleProducts.length} ${
                      visibleProducts.length === 1 ? "product" : "products"
                    }`}
              </p>
            </div>
          </motion.div>

          {/* Search bar */}
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <form
              className="flex h-12 flex-1 items-center border border-[#D8CEBF] bg-[#FBF8F2] px-4 transition-colors focus-within:border-[#817665]"
              onSubmit={(event) => {
                event.preventDefault();
                sectionRefs.current[activeCategory]?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              <Search size={18} className="shrink-0 text-[#817665]" />

              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search T-shirts, hoodies, fabrics..."
                aria-label="Search products"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#A49A8B]"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="p-1 text-[#817665] hover:text-[#292821]"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <label className="flex h-12 items-center gap-3 border border-[#D8CEBF] bg-[#FBF8F2] px-4 sm:w-56">
              <SlidersHorizontal size={16} className="text-[#817665]" />

              <span className="sr-only">Sort products</span>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Sticky category navigation */}
      <nav
        aria-label="Product categories"
        className="sticky top-0 z-30 border-b border-[#E4DBCE] bg-[#F7F3EB]/95 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                className={`shrink-0 rounded-sm border px-4 py-2.5 text-xs transition-colors ${
                  activeCategory === category.id
                    ? "border-[#292821] bg-[#292821] text-[#F7F3EB]"
                    : "border-[#D8CEBF] bg-transparent text-[#655D52] hover:border-[#817665] hover:text-[#292821]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Product collection */}
      <section className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-7">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <EmptyProducts message="We couldn't load the collection. Please try again." />
        ) : visibleProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Search size={25} className="mx-auto mb-4 text-[#817665]" />

            <h2 className="text-lg font-medium">
              No products found
            </h2>

            <p className="mt-2 text-sm text-[#817665]">
              Try another search term or clear your search.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                selectCategory("all");
              }}
              className="mt-5 border-b border-[#B8AE9D] pb-1 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* All products: show every category as a separate section */}
            {categorySections.map((category) => {
              const categoryProducts = productsByCategory[category.id];

              if (categoryProducts.length === 0) return null;

              return (
                <div
                  key={category.id}
                  id={`category-${category.id}`}
                  ref={(element) => {
                    sectionRefs.current[category.id] = element;
                  }}
                  className="mb-14 scroll-mt-28 last:mb-0 sm:mb-20"
                >
                  <div className="mb-6 flex items-end justify-between gap-3 border-b border-[#E4DBCE] pb-4 sm:mb-8">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#817665]">
                        Explore the collection
                      </p>

                      <h2 className="text-xl font-medium sm:text-2xl">
                        {category.name}
                      </h2>

                      <p className="mt-1 text-xs text-[#817665]">
                        {categoryProducts.length}{" "}
                        {categoryProducts.length === 1
                          ? "product"
                          : "products"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => selectCategory(category.id)}
                      className="inline-flex items-center gap-1.5 pb-1 text-xs text-[#817665] transition-colors hover:text-[#292821]"
                    >
                      Jump to section
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-7">
                    {categoryProducts.map((product, index) => (
                      <motion.div
                        key={product._id || product.id || product.slug}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.08 }}
                        transition={{
                          duration: 0.35,
                          delay: (index % 4) * 0.04,
                        }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {visibleProducts.every(
              (product) =>
                !categorySections.some((category) =>
                  matchesCategory(product, category.id)
                )
            ) && (
              <EmptyProducts message="These products do not match any available category yet." />
            )}
          </>
        )}

        {/* Retry */}
        {isError && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 border-b border-[#B8AE9D] pb-1 text-sm disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Loading..." : "Try again"}
            </button>
          </div>
        )}

        <div className="mt-12 border-t border-[#E4DBCE] pt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-[#817665] transition-colors hover:text-[#292821]"
          >
            Back to home
            <ArrowUp size={13} className="rotate-[-45deg]" />
          </Link>
        </div>
      </section>
    </main>
  );
}