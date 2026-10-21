
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const productName = product.name || product.title || "Untitled product";
  const productUrl = product.slug
    ? `/products/${product.slug}`
    : "/products";

  return (
    <article className="group min-w-0">
      <Link to={productUrl} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#E8E0D3]">
          {image ? (
            <img
              src={image}
              alt={product.images?.[0]?.alt || productName}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#817665]">
              No image available
            </div>
          )}

          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F3EB] text-[#292821] transition-colors group-hover:bg-[#292821] group-hover:text-[#F7F3EB]">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>

      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#817665]">
            {product.category || "Everyday essentials"}
          </p>

          <Link
            to={productUrl}
            className="line-clamp-2 text-sm font-medium text-[#292821] transition-colors hover:text-[#817665] sm:text-base"
          >
            {productName}
          </Link>
        </div>

        <p className="shrink-0 text-sm font-medium text-[#292821]">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
