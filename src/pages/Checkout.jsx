
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LoaderCircle, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const initialForm = {
  fullName: "",
  phone: "",
  division: "",
  district: "",
  area: "",
  addressLine: "",
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product;
  const variant =
    location.state?.selectedVariant ?? location.state?.variant;
  const quantity = Math.max(1, Number(location.state?.quantity) || 1);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const image =
    product?.images?.[0]?.url ??
    product?.images?.[0] ??
    "";

  const unitPrice = Number(product?.price) || 0;
  const total = unitPrice * quantity;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid 11-digit Bangladesh phone number.";
    }

    if (!form.division.trim()) {
      nextErrors.division = "Division is required.";
    }

    if (!form.district.trim()) {
      nextErrors.district = "District is required.";
    }

    if (!form.area.trim()) {
      nextErrors.area = "Area or upazila is required.";
    }

    if (form.addressLine.trim().length < 5) {
      nextErrors.addressLine = "Please enter your detailed address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    if (!product?._id || !variant?.sku) {
      toast.error("Product or selected variant is missing. Please select your product again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/orders", {
        items: [
          {
            productId: product._id,
            variantSku: variant.sku,
            quantity,
          },
        ],
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          division: form.division.trim(),
          district: form.district.trim(),
          area: form.area.trim(),
          addressLine: form.addressLine.trim(),
        },
      });

      const order =
        response.data?.data?.order ??
        response.data?.order;

      toast.success("Your order has been placed successfully!");

      navigate("/my-orders", {
        replace: true,
        state: {
          orderPlaced: true,
          orderId: order?._id,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ??
          "Could not place your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#292821] outline-none transition placeholder:text-[#a29b90] focus:border-[#817665] ${
      errors[field] ? "border-red-400" : "border-[#e8e0d3]"
    }`;

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f7f3eb] px-5 py-24 text-[#292821]">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#e8e0d3] bg-white p-8 text-center">
          <PackageCheck className="mx-auto mb-4 h-10 w-10 text-[#817665]" />
          <h1 className="text-2xl font-semibold">Your checkout is empty</h1>
          <p className="mt-3 text-sm leading-6 text-[#817665]">
            Select a product and variant before continuing to checkout.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-[#292821] px-6 py-3 text-sm text-white transition hover:bg-[#49463d]"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4 py-10 text-[#292821] sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          to={`/products/${product.slug}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#817665] transition hover:text-[#292821]"
        >
          <ArrowLeft size={16} />
          Back to product
        </Link>

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#817665]">
            Flex-Fashion BD
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Easy checkout.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#817665]">
            Add your delivery information and confirm your cash-on-delivery order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]"
          noValidate
        >
          <section className="rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f3eb]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Delivery information</h2>
                <p className="mt-1 text-sm text-[#817665]">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={updateField}
                  placeholder="Enter your full name"
                  className={inputClass("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="01XXXXXXXXX"
                  className={inputClass("phone")}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {[
                { name: "division", label: "Division *", placeholder: "e.g. Dhaka" },
                { name: "district", label: "District *", placeholder: "e.g. Dhaka" },
                { name: "area", label: "Area / Upazila *", placeholder: "Your area" },
              ].map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={form[field.name]}
                    onChange={updateField}
                    placeholder={field.placeholder}
                    className={inputClass(field.name)}
                  />
                  {errors[field.name] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              <div className="sm:col-span-2">
                <label htmlFor="addressLine" className="text-sm font-medium">
                  Detailed address *
                </label>
                <textarea
                  id="addressLine"
                  name="addressLine"
                  autoComplete="street-address"
                  rows={3}
                  value={form.addressLine}
                  onChange={updateField}
                  placeholder="House number, road, landmark..."
                  className={inputClass("addressLine")}
                />
                {errors.addressLine && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.addressLine}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-[#f7f3eb] p-4">
              <p className="text-sm font-medium">Payment method</p>
              <p className="mt-1 text-sm text-[#817665]">
                Cash on Delivery — pay when your order arrives.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#292821] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#49463d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Placing your order...
                </>
              ) : (
                "Confirm order"
              )}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-[#817665]">
              Please check your address and phone number before confirming.
            </p>
          </section>

          <aside className="h-fit rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7 lg:sticky lg:top-8">
            <h2 className="text-lg font-semibold">Order summary</h2>

            <div className="mt-6 flex gap-4">
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f7f3eb]">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#817665]">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="mt-2 text-sm text-[#817665]">
                  Size: {variant?.size ?? "—"}
                </p>
                <p className="mt-1 text-sm text-[#817665]">
                  Color: {variant?.color ?? "—"}
                </p>
                <p className="mt-1 text-sm text-[#817665]">
                  Quantity: {quantity}
                </p>
                <p className="mt-3 font-semibold">
                  ৳{(unitPrice * quantity).toLocaleString("en-BD")}
                </p>
              </div>
            </div>

            <div className="my-6 border-t border-dashed border-[#e8e0d3]" />

            <div className="flex justify-between text-sm text-[#817665]">
              <span>Subtotal</span>
              <span>৳{total.toLocaleString("en-BD")}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm text-[#817665]">
              <span>Delivery charge</span>
              <span>To be confirmed</span>
            </div>

            <div className="my-5 border-t border-[#e8e0d3]" />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Product total</span>
              <span className="text-xl font-semibold">
                ৳{total.toLocaleString("en-BD")}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#817665]">
              Delivery charge, if applicable, will be confirmed before delivery.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
