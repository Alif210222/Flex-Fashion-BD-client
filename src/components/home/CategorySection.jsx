
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    name: "T-Shirts",
    description: "Everyday essentials",
    href: "/products?category=t-shirts",
    // image:
    //   "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Hoodies",
    description: "Relaxed comfort",
    href: "/products?category=hoodies",
    // image:
    //   "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Drop Shoulder",
    description: "Relaxed silhouettes",
    href: "/products?category=t-shirts&subcategory=drop-shoulder",
    // image:
    //   "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Zackets",
    description: "Quality materials",
    href: "/products?category=fabrics",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=85",
  },
];

export default function CategorySection() {
  return (
    <section className="bg-[#F7F3EB] py-14 text-[#292821] sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-7 flex items-end justify-between gap-4 sm:mb-9"
        >
          <div>
            {/* <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#817665] sm:text-xs">
              Find your style
            </p>

            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Types Of Products
            </h2> */}

            
          </div>

          <a
            href="/products"
            className="hidden items-center gap-2 border-b border-[#B8AE9D] pb-1 text-xs transition-colors hover:border-[#292821] sm:inline-flex"
          >
            All products
            <ArrowUpRight size={14} />
          </a>
        </motion.div>



        {/* Category grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9 lg:grid-cols-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.a
              key={category.name}
              href={category.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              className="group min-w-0"
            >
              <div >
                {/* <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                /> */}

               
              </div>

              <div className="flex items-start justify-between gap-2 pt-3">
                <div class = "border  p-4 bg-[#EDE5D9]">
                  <h3 className="text-sm font-medium sm:text-base">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#817665] sm:text-xs">
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

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
