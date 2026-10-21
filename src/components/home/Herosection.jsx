
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const products = [
  {
    name: "Essential Tee",
    type: "EVERYDAY T-SHIRT",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Classic Hoodie",
    type: "EVERYDAY HOODIE",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Relaxed Fit",
    type: "CASUAL ESSENTIAL",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=500&q=80",
  },
];

export default function HeroSection() {
  // Duplicate the products for a seamless animation.
  const movingProducts = [...products, ...products];

  return (
    <section className="overflow-hidden bg-[#F7F3EB] text-[#292821]">
      <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="grid items-center gap-9 md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-16">
          {/* Minimal hero content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="order-2 md:order-1"
          >
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[#817665]">
              Everyday essentials
            </p>

            <h1 className="max-w-md text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Made for your
              <br />
              everyday.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#625e56]">
              Explore comfortable T-shirts, hoodies and timeless
              essentials for your everyday wardrobe.
            </p>

            <a
              href="/products"
              className="mt-7 inline-flex items-center gap-3 rounded-sm bg-[#909087]  px-5 py-3.5  font-medium text-[#eeeae3] transition-colors hover:bg-[#afadaa]"
            >
              Shop collection
              <ArrowRight size={15} />
            </a>

            <p className="mt-5 text-xs text-[#817665]">
              Simple fits. Everyday comfort.
            </p>
          </motion.div>

          {/* Smaller animated product showcase */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="order-1 min-w-0 overflow-hidden md:order-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#817665]">
                Explore the essentials
              </p>
              <span className="text-xs text-[#817665]">01 / 03</span>
            </div>

            <div className="overflow-hidden">
              <motion.div
                className="flex w-max gap-4"
                animate={{ x: ["-50%", "0%"] }}
                transition={{
                  duration: 22,
                  ease: "linear",
                  repeat: Infinity,
                }}
                whileHover={{ animationPlayState: "paused" }}
              >
                {movingProducts.map((product, index) => (
                  <article
                    key={`${product.name}-${index}`}
                    className="w-[185px] shrink-0 sm:w-[220px] lg:w-[235px]"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-sm bg-[#E8E0D3]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading={index < 3 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-2 py-3">
                      <div>
                        <h2 className="text-sm font-medium">
                          {product.name}
                        </h2>
                        <p className="mt-1 text-[9px] tracking-[0.12em] text-[#817665]">
                          {product.type}
                        </p>
                      </div>
                      <ArrowRight
                        size={15}
                        className="mt-1 shrink-0 text-[#817665]"
                      />
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
