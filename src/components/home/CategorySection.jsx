
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    name: "T-Shirts",
    description: "Everyday essentials",
    href: "/products?category=t-shirts",
  },
  {
    name: "Hoodies",
    description: "Relaxed comfort",
    href: "/products?category=hoodies",
  },
  {
    name: "Drop Shoulder",
    description: "Relaxed silhouettes",
    href: "/products?category=t-shirts&subcategory=drop-shoulder",
  },
  {
    name: "Zackets",
    description: "Quality materials",
    href: "/products?category=fabrics",
  },
];

export default function CategorySection() {
  return (
    <section className="bg-[#F7F3EB] py-14 text-[#292821] sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-7 flex items-end justify-between gap-4 sm:mb-9"
        >
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#817665] sm:text-xs">
              Explore our collection
            </p>

            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Types Of Products
            </h2>
          </div>

          <a
            href="/products"
            className="hidden items-center gap-2 border-b border-[#B8AE9D] pb-1 text-xs transition-colors hover:border-[#292821] sm:inline-flex"
          >
            All products
            <ArrowUpRight size={14} />
          </a>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.a
              key={category.name}
              href={category.href}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              whileHover={{ y: -6 }}
              className="group relative min-w-0 overflow-hidden rounded-xl border border-[#E2D9CA] bg-[#F2EDE3] p-5 shadow-[0_3px_12px_rgba(41,40,33,0.04)] transition-all duration-300 hover:border-[#B8AA96] hover:bg-[#EDE5D9] hover:shadow-[0_12px_28px_rgba(41,40,33,0.10)] sm:p-6 lg:p-7"
            >
              {/* Top Decorative Line */}
              <div className="absolute left-0 top-0 h-[2px] w-0 bg-[#817665] transition-all duration-500 group-hover:w-full" />

              <div className="flex min-h-[105px] flex-col justify-between gap-5 sm:min-h-[120px]">

                {/* Category Number + Arrow */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium tracking-[0.15em] text-[#A39988]">
                    0{index + 1}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCD2C3] text-[#817665] transition-all duration-300 group-hover:border-[#292821] group-hover:bg-[#292821] group-hover:text-[#F7F3EB]">
                    <ArrowUpRight
                      size={17}
                      className="transition-transform duration-300 group-hover:rotate-45"
                    />
                  </span>
                </div>

                {/* Category Information */}
                <div>
                  <h3 className="text-base font-semibold tracking-tight transition-colors duration-300 group-hover:text-[#817665] sm:text-lg">
                    {category.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-[#817665] sm:text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Mobile Browse Link */}
        <a
          href="/products"
          className="mt-8 inline-flex items-center gap-2 border-b border-[#B8AE9D] pb-1 text-xs sm:hidden"
        >
          Browse all products
          <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
