
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";

const products = [
  {
    name: "Essential Tee",
    type: "EVERYDAY T-SHIRT",
    image:
      "https://res.cloudinary.com/dwfs21ssw/image/upload/v1793364145/flex-fashion-bd/products/wl5j9bgfpgaqswqigqqw.jpg",
  },
  {
    name: "Classic Hoodie",
    type: "EVERYDAY HOODIE",
    image:
      "https://res.cloudinary.com/dwfs21ssw/image/upload/v1793342639/flex-fashion-bd/products/mivy1hdvw7facqthjjbe.jpg",
  },
  {
    name: "Relaxed Fit",
    type: "CASUAL ESSENTIAL",
    image:
      "https://res.cloudinary.com/dwfs21ssw/image/upload/v1793342371/flex-fashion-bd/products/ub664fn4tbsggfyx2fba.jpg",
  },
  {
    name: "Relaxed Fit",
    type: "CASUAL ESSENTIAL",
    image:
      "https://res.cloudinary.com/dwfs21ssw/image/upload/v1793342085/flex-fashion-bd/products/f5p0mwvmyzmd2ydxb1wb.jpg",
  },
];

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const activeProduct = products[activeIndex];

  return (
    <section className="overflow-hidden bg-[#F7F3EB] text-[#292821]">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-20">

          {/* Right Animated Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 min-w-0 md:order-2"
          >
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#817665]">
                Explore the essentials
              </p>

              <span className="text-xs tabular-nums text-[#817665]">
                0{activeIndex + 1} / 0{products.length}
              </span>
            </div>

            {/* Image Animation */}
            <div className="relative overflow-hidden bg-[#E8E0D3]">
              <div className="aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeProduct.image}
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    initial={{
                      opacity: 0,
                      x: 70,
                      scale: 1.04,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      x: -70,
                      scale: 0.98,
                    }}
                    transition={{
                      duration: 0.65,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Product Information */}
            <div className="mt-3 flex items-center justify-between sm:mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.image}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <h2 className="text-sm font-medium sm:text-base">
                    {activeProduct.name}
                  </h2>

                  <p className="mt-1 text-[10px] tracking-[0.14em] text-[#817665]">
                    {activeProduct.type}
                  </p>
                </motion.div>
              </AnimatePresence>

              <a
                href="/products"
                aria-label="Explore products"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D0C3] text-[#625E56] transition-colors hover:bg-[#292821] hover:text-white sm:h-10 sm:w-10"
              >
                <ArrowRight size={17} />
              </a>
            </div>

            {/* Slider Progress Indicators */}
            <div className="mt-4 flex gap-2 sm:mt-5">
              {products.map((product, index) => (
                <button
                  key={product.image}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${product.name}`}
                  className="h-[3px] flex-1 overflow-hidden bg-[#DED7CA]"
                >
                  <motion.div
                    className="h-full bg-[#817C70]"
                    initial={false}
                    animate={{
                      width: activeIndex === index ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-left"
          >
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#817665] sm:mb-4 sm:text-[11px]">
              Everyday essentials
            </p>

            <h1 className="max-w-md text-3xl font-medium leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.8rem]">
              Made for your
              <br />
              everyday.
            </h1>

            <p className="mt-4 max-w-sm text-xs leading-6 text-[#625e56] sm:mt-5 sm:text-sm sm:leading-7">
              Explore comfortable T-shirts, hoodies and timeless
              essentials for your everyday wardrobe.
            </p>

            <a
              href="/products"
              className="mt-6 inline-flex items-center justify-center gap-3 rounded-sm bg-[#817C70] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#625E56] sm:mt-7 sm:py-3.5"
            >
              Shop collection
              <ArrowRight size={15} />
            </a>

            <p className="mt-4 text-[11px] text-[#817665] sm:mt-5 sm:text-xs">
              Simple fits. Everyday comfort.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
