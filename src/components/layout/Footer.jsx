
import { Link } from "react-router-dom";
import {
  //Facebook,
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const FACEBOOK_URL = "https://www.facebook.com/flex-feshion-fb";

const footerLinks = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "New Arrivals", to: "/products?sort=newest" },
    { label: "T-Shirts", to: "/products?category=t-shirts" },
    { label: "Hoodies", to: "/products?category=hoodies" },
    { label: "Fabrics", to: "/products?category=fabrics" },
  ],
  Support: [
    { label: "Contact Us", to: "/contact" },
    { label: "My Account", to: "/login" },
    { label: "Shopping Cart", to: "/cart" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#292821] text-[#F7F3EB]">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        {/* Main footer */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 sm:gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:py-16">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-block text-2xl font-semibold tracking-[0.16em]"
            >
              FLEX<span className="text-[#C7B9A3]">.</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-7 text-[#C7C0B4]">
              Everyday essentials made better. Discover comfortable fits
              and timeless styles designed for your everyday wardrobe.
            </p>

            {/* Facebook */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Flex Fashion BD on Facebook"
              className="mt-5 inline-flex items-center gap-3 rounded-sm border border-[#5A574D] px-4 py-3 text-sm text-[#F7F3EB] transition-colors hover:border-[#C7B9A3] hover:text-[#C7B9A3]"
            >
              {/* <Facebook size={18} /> */}
              <span>Follow us on Facebook</span>
              <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Navigation */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-[#C7B9A3]">
                {heading}
              </h3>

              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#C7C0B4] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-[#C7B9A3]">
              Get in touch
            </h3>

            <p className="mt-5 text-sm leading-6 text-[#C7C0B4]">
              Questions about your order or our products? We'd love to
              hear from you.
            </p>

            <div className="mt-5 space-y-4">
              <a
                href="mailto:support@flexfashionbd.com"
                className="flex items-start gap-3 text-sm text-[#C7C0B4] transition-colors hover:text-white"
              >
                <Mail size={16} className="mt-0.5 shrink-0" />
                <span>support@flexfashionbd.com</span>
              </a>

              <div className="flex items-start gap-3 text-sm text-[#C7C0B4]">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Bangladesh</span>
              </div>

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-[#C7C0B4] transition-colors hover:text-white"
              >
                <Phone size={16} />
                <span>Contact us via Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-[#49473F] py-5 text-xs text-[#B8B1A5] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Flex-Fashion BD. All rights reserved.
          </p>

          <p className="tracking-wide">
            Made for everyday living.
          </p>
        </div>
      </div>
    </footer>
  );
}
