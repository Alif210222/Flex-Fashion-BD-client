
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  //Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";

const CART_KEY = "flex-fashion-cart";

const formatPrice = (price) =>
  `৳${Number(price || 0).toLocaleString("en-BD")}`;

const getImageUrl = (image) =>
  typeof image === "string" ? image : image?.url;

const getVariants = (product) =>
  Array.isArray(product?.variants) ? product.variants : [];

const getVariantValue = (variant, key) =>
  variant?.[key] ?? variant?.[key.toLowerCase()] ?? "";

const getAvailableSizes = (variants) =>
  [...new Set(variants.map((variant) => getVariantValue(variant, "size")).filter(Boolean))];

const getAvailableColors = (variants) =>
  [...new Set(variants.map((variant) => getVariantValue(variant, "color")).filter(Boolean))];

const readCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product-details", slug],
    queryFn: async () => {
      // Requires a public backend endpoint: GET /products/slug/:slug
      const response = await api.get(
        `/products/slug/${encodeURIComponent(slug)}`
      );

      console.log( response)

      const payload = response.data?.data;
      const foundProduct = payload?.product ?? payload;

      if (!foundProduct || !foundProduct._id) {
        throw new Error("Product not found");
      }

      return foundProduct;
    },
    enabled: Boolean(slug),
  });

  const images = useMemo(
    () =>
      (product?.images || [])
        .map(getImageUrl)
        .filter(Boolean),
    [product]
  );

  const variants = useMemo(() => getVariants(product), [product]);
  const sizes = useMemo(() => getAvailableSizes(variants), [variants]);
  const colors = useMemo(() => getAvailableColors(variants), [variants]);

  useEffect(() => {
    setActiveImage(0);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  }, [slug]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    return (
      variants.find((variant) => {
        const sizeMatches =
          !sizes.length ||
          getVariantValue(variant, "size") === selectedSize;

        const colorMatches =
          !colors.length ||
          getVariantValue(variant, "color") === selectedColor;

        return sizeMatches && colorMatches;
      }) || null
    );
  }, [variants, sizes, colors, selectedSize, selectedColor]);

  const stock = selectedVariant
    ? Number(selectedVariant.stock ?? selectedVariant.quantity ?? 0)
    : Number(product?.stock ?? product?.quantity ?? 0);

  const hasStockField = selectedVariant
    ? selectedVariant.stock != null || selectedVariant.quantity != null
    : product?.stock != null || product?.quantity != null;

  const outOfStock = hasStockField && stock <= 0;

  const price = Number(selectedVariant?.price ?? product?.price ?? 0);
  const compareAtPrice = Number(
    selectedVariant?.compareAtPrice ?? product?.compareAtPrice ?? 0
  );

  const discount =
    compareAtPrice > price && compareAtPrice > 0
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const needsSize = sizes.length > 0 && !selectedSize;
  const needsColor = colors.length > 0 && !selectedColor;

  const chooseVariant = () => {
    if (needsSize || needsColor) {
      toast.error(
        needsSize && needsColor
          ? "Please select a size and color."
          : needsSize
            ? "Please select a size."
            : "Please select a color."
      );
      return false;
    }

    if (outOfStock) {
      toast.error("Sorry, this variant is out of stock.");
      return false;
    }

    if (hasStockField && quantity > stock) {
      toast.error(`Only ${stock} item(s) are available.`);
      return false;
    }

    return true;
  };

  const createCartItem = () => ({
    productId: product._id,
    slug: product.slug,
    name: product.name,
    image: images[0] || "",
    price,
    quantity,
    size: selectedSize || null,
    color: selectedColor || null,
    variantId: selectedVariant?._id || null,
    sku: selectedVariant?.sku || product.sku || null,
  });

  const addToCart = () => {
    if (!chooseVariant()) return;

    const item = createCartItem();
    const cart = readCart();

    const existingIndex = cart.findIndex(
      (entry) =>
        entry.productId === item.productId &&
        entry.size === item.size &&
        entry.color === item.color
    );

    if (existingIndex >= 0) {
      const nextQuantity = Number(cart[existingIndex].quantity || 0) + quantity;

      if (hasStockField && nextQuantity > stock) {
        toast.error(`Only ${stock} item(s) are available for this variant.`);
        return;
      }

      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity: nextQuantity,
      };
    } else {
      cart.push(item);
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));

    toast.success("Added to your bag.");
  };

  const orderNow = () => {
    if (!chooseVariant()) return;

    // Checkout page can receive the selected item through router state.
    navigate("/checkout", {
      state: {
        product,
        selectedVariant,
        quantity,
        checkoutItems: [createCartItem()],
        source: "product-details",
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-5 py-12 lg:px-8">
        <div className="mb-8 h-4 w-40 rounded bg-[#e8e0d3]" />
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] rounded-sm bg-[#e8e0d3]" />
          <div className="space-y-5 py-4">
            <div className="h-4 w-24 rounded bg-[#e8e0d3]" />
            <div className="h-10 w-3/4 rounded bg-[#e8e0d3]" />
            <div className="h-6 w-32 rounded bg-[#e8e0d3]" />
            <div className="h-24 rounded bg-[#e8e0d3]" />
            <div className="h-12 rounded bg-[#e8e0d3]" />
            <div className="h-12 rounded bg-[#e8e0d3]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <span className="mb-4 text-xs uppercase tracking-[0.25em] text-[#817665]">
          Flex-Fashion BD
        </span>
        <h1 className="text-3xl font-medium text-[#292821]">
          We couldn't find this product
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#777064]">
          The product may have been removed, or there may be a connection
          problem.
        </p>
        <div className="mt-7 flex gap-3">
          <button
            onClick={() => refetch()}
            className="border border-[#292821] px-5 py-3 text-sm hover:bg-[#292821] hover:text-white"
          >
            Try again
          </button>
          <Link
            to="/products"
            className="bg-[#292821] px-5 py-3 text-sm text-white"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <main className="bg-[#fbf9f5] text-[#292821]">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[#817665]">
          <Link to="/" className="hover:text-[#292821]">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#292821]">Shop</Link>
          <span>/</span>
          <span className="max-w-[200px] truncate text-[#292821]">
            {product.name}
          </span>
        </nav>

        <div className="grid items-start gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          {/* Product gallery */}
          <section>
            <div className="relative overflow-hidden bg-[#f0ece4]">
              {images.length > 0 ? (
                <img
                  src={images[activeImage] || images[0]}
                  alt={product.images?.[activeImage]?.alt || product.name}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-sm text-[#817665]">
                  No product image available
                </div>
              )}

              {product.isFeatured && (
                <span className="absolute left-4 top-4 bg-[#fbf9f5] px-3 py-2 text-[10px] uppercase tracking-[0.2em]">
                  Featured
                </span>
              )}

              {discount > 0 && (
                <span className="absolute right-4 top-4 bg-[#292821] px-3 py-2 text-[10px] uppercase tracking-wider text-white">
                  Save {discount}%
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`overflow-hidden border ${
                      activeImage === index
                        ? "border-[#292821]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="aspect-square w-full bg-[#f0ece4] object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-7 hidden grid-cols-3 gap-4 border-y border-[#e8e0d3] py-5 sm:grid">
              <div className="flex items-center gap-2 text-xs text-[#655f54]">
                <Truck size={17} strokeWidth={1.5} />
                <span>Delivery across Bangladesh</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#655f54]">
                <ShieldCheck size={17} strokeWidth={1.5} />
                <span>Quality checked</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#655f54]">
                <Check size={17} strokeWidth={1.5} />
                <span>Easy order process</span>
              </div>
            </div>
          </section>

          {/* Product information */}
          <section className="lg:sticky lg:top-28">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#817665]">
              {product.brand || "FLEX-FASHION BD"}
            </p>

            <h1 className="mt-3 max-w-xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-medium">
                {formatPrice(price)}
              </span>
              {compareAtPrice > price && (
                <>
                  <span className="text-base text-[#91897d] line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                  <span className="text-xs font-medium text-[#6b735d]">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-5 text-sm leading-7 text-[#777064]">
                {product.shortDescription}
              </p>
            )}

            <div className="my-7 h-px bg-[#e8e0d3]" />

            {/* Color selection */}
            {colors.length > 0 && (
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-[0.15em]">
                    Color
                  </label>
                  <span className="text-xs text-[#817665]">
                    {selectedColor || "Select a color"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const disabled = !variants.some(
                      (variant) =>
                        getVariantValue(variant, "color") === color &&
                        (!selectedSize ||
                          getVariantValue(variant, "size") === selectedSize) &&
                        Number(variant.stock ?? variant.quantity ?? 1) > 0
                    );

                    return (
                      <button
                        key={color}
                        disabled={disabled}
                        onClick={() => setSelectedColor(color)}
                        className={`min-w-16 border px-4 py-2.5 text-xs transition ${
                          selectedColor === color
                            ? "border-[#292821] bg-[#292821] text-white"
                            : "border-[#d9d1c4] hover:border-[#292821]"
                        } disabled:cursor-not-allowed disabled:opacity-35`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selection */}
            {sizes.length > 0 && (
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-[0.15em]">
                    Size
                  </label>
                  <span className="text-xs text-[#817665]">
                    {selectedSize || "Select a size"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {sizes.map((size) => {
                    const disabled = !variants.some(
                      (variant) =>
                        getVariantValue(variant, "size") === size &&
                        (!selectedColor ||
                          getVariantValue(variant, "color") === selectedColor) &&
                        Number(variant.stock ?? variant.quantity ?? 1) > 0
                    );

                    return (
                      <button
                        key={size}
                        disabled={disabled}
                        onClick={() => setSelectedSize(size)}
                        className={`border py-3 text-xs transition ${
                          selectedSize === size
                            ? "border-[#292821] bg-[#292821] text-white"
                            : "border-[#d9d1c4] hover:border-[#292821]"
                        } disabled:cursor-not-allowed disabled:opacity-35`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-7 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-[0.15em]">
                Quantity
              </label>
              <div className="flex items-center border border-[#d9d1c4]">
                <button
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-3 disabled:opacity-35"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-9 text-center text-sm">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(hasStockField ? stock : 99, current + 1)
                    )
                  }
                  disabled={hasStockField && quantity >= stock}
                  aria-label="Increase quantity"
                  className="p-3 disabled:opacity-35"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Purchase actions */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={addToCart}
                disabled={outOfStock}
                className="flex min-h-14 items-center justify-center gap-2 border border-[#292821] px-4 text-sm transition hover:bg-[#eee8de] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={17} strokeWidth={1.6} />
                Add to Cart
              </button>

              <button
                onClick={orderNow}
                disabled={outOfStock}
                className="group flex min-h-14 items-center justify-center gap-2 bg-[#292821] px-4 text-sm text-white transition hover:bg-[#464337] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {outOfStock ? "Out of Stock" : "Order Now"}
                {!outOfStock && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </div>

            {outOfStock && (
              <p className="mt-3 text-xs text-red-700">
                This variant is currently unavailable.
              </p>
            )}

            <p className="mt-4 text-center text-xs leading-6 text-[#817665]">
              Secure order details · Customer support available
            </p>

            {/* Product accordions */}
            <div className="mt-8 border-t border-[#e8e0d3]">
              <ProductAccordion
                title="Description"
                open={descriptionOpen}
                onToggle={() => setDescriptionOpen((value) => !value)}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-[#777064]">
                  {product.description || "No description has been added yet."}
                </p>
              </ProductAccordion>

              <ProductAccordion
                title="Product details"
                open={detailsOpen}
                onToggle={() => setDetailsOpen((value) => !value)}
              >
                <div className="space-y-3 text-sm">
                  {[
                    ["Category", product.category],
                    ["Subcategory", product.subcategory],
                    ["Material", product.material],
                    ["Fit", product.fit],
                    ["Pattern", product.pattern],
                    ["Fabric weight", product.fabricWeightGsm ? `${product.fabricWeightGsm} GSM` : null],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-4 border-b border-[#eee8de] pb-3"
                      >
                        <span className="text-[#817665]">{label}</span>
                        <span className="text-right capitalize">{value}</span>
                      </div>
                    ))}
                </div>
              </ProductAccordion>

              <ProductAccordion
                title="Care instructions"
                open={careOpen}
                onToggle={() => setCareOpen((value) => !value)}
              >
                {Array.isArray(product.careInstructions) &&
                product.careInstructions.length > 0 ? (
                  <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-[#777064]">
                    {product.careInstructions.map((instruction, index) => (
                      <li key={`${instruction}-${index}`}>{instruction}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-6 text-[#777064]">
                    Follow the care label attached to the garment.
                  </p>
                )}
              </ProductAccordion>
            </div>
          </section>
        </div>

        {/* Continue shopping */}
        <div className="mt-16 border-t border-[#e8e0d3] pt-7">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#655f54] transition hover:text-[#292821]"
          >
            <ArrowLeft size={15} />
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
};

const ProductAccordion = ({ title, open, onToggle, children }) => (
  <div className="border-b border-[#e8e0d3]">
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between py-5 text-left text-sm"
    >
      <span>{title}</span>
      <ChevronDown
        size={17}
        className={`text-[#817665] transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
    {open && <div className="pb-5">{children}</div>}
  </div>
);

export default ProductDetails;