
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CollectionSection() {
  return (
    <section className="bg-[#F7F3EB] px-5 py-10 text-[#292821] sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="grid overflow-hidden rounded-sm bg-[#E8E0D3] md:grid-cols-2"
        >
          {/* Collection image */}
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] md:min-h-[430px]">
            <img
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85"
              alt="Neutral everyday clothing collection"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>

          {/* Collection content */}
          <div className="flex flex-col items-start justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#817665] sm:text-xs">
              The latest collection
            </p>

            <h2 className="max-w-sm text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Everyday style,
              <br />
              redefined.
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-[#6F685C]">
              Discover comfortable fits, timeless colors, and versatile
              essentials made to be part of your everyday wardrobe.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                to="/products?sort=newest"
                className="inline-flex items-center gap-3 rounded-sm bg-[#292821] px-5 py-3.5 text-xs font-medium text-[#F7F3EB] transition-colors hover:bg-[#514B3F]"
              >
                Explore collection
                <ArrowRight size={15} />
              </Link>

              <span className="text-xs text-[#817665]">
                Simple. Versatile. Timeless.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
