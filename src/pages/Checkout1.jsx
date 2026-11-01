
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
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

const Checkout1 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutState = location.state ?? {};

  const {
    source,
    product,
    selectedVariant,
    variant: fallbackVariant,
    quantity: initialQuantity,
    checkoutItems,
  } = checkoutState;
  console.log(checkoutItems);

  const isCartCheckout = source === "cart";
  const variant = selectedVariant ?? fallbackVariant;
  const quantity = Math.max(1, Number(initialQuantity) || 1);

  // Normalize Product Details and Cart checkout into one array.
  const items = isCartCheckout
    ? Array.isArray(checkoutItems)
      ? checkoutItems.map((item) => ({
          ...item,
          product: item.product ?? null,
          productId:
            item.productId ?? item.product?._id ?? item._id,
          variantSku: item.variantSku ?? item.selectedVariant?.sku,
          size: item.size ?? item.selectedVariant?.size,
          color: item.color ?? item.selectedVariant?.color,
          quantity: Math.max(1, Number(item.quantity) || 1),
          unitPrice: Number(
            item.unitPrice ?? item.product?.price ?? item.price
          ) || 0,
          productName:
            item.productName ?? item.product?.name ?? item.name,
          image:
            item.image ??
            item.product?.images?.[0]?.url ??
            item.product?.images?.[0] ??
            "",
          slug: item.slug ?? item.product?.slug,
        }))
      : []
    : product && variant
      ? [
          {
            product,
            productId: product._id,
            variantSku: variant.sku,
            size: variant.size,
            color: variant.color,
            quantity,
            unitPrice: Number(product.price) || 0,
            productName: product.name,
            image:
              product.images?.[0]?.url ??
              product.images?.[0] ??
              "",
            slug: product.slug,
          },
        ]
      : [];

  const hasCheckoutItems =
    items.length > 0 &&
    items.every(
      (item) => item.productId && item.variantSku && item.quantity > 0
    );

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      nextErrors.phone =
        "Enter a valid 11-digit Bangladesh phone number.";
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
      nextErrors.addressLine =
        "Please enter your detailed address.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    if (!hasCheckoutItems) {
      toast.error(
        "Product information is missing. Please select your product again."
      );
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          division: form.division.trim(),
          district: form.district.trim(),
          area: form.area.trim(),
          addressLine: form.addressLine.trim(),
        },
      };

      const response = await api.post("/orders", orderPayload);

      const order =
        response.data?.data?.order ?? response.data?.order;

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

  if (!hasCheckoutItems) {
    return (
      <main className="min-h-screen bg-[#f7f3eb] px-5 py-24 text-[#292821]">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#e8e0d3] bg-white p-8 text-center">
          <PackageCheck className="mx-auto mb-4 h-10 w-10 text-[#817665]" />

          <h1 className="text-2xl font-semibold">
            Your checkout is empty
          </h1>

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

  const backLink = isCartCheckout
    ? "/cart"
    : `/products/${items[0].slug ?? ""}`;

  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4 py-10 text-[#292821] sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          to={backLink}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#817665] transition hover:text-[#292821]"
        >
          <ArrowLeft size={16} />
          {isCartCheckout ? "Back to cart" : "Back to product"}
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
                <h2 className="text-lg font-semibold">
                  Delivery information
                </h2>

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
                  <p className="mt-1 text-xs text-red-600">
                    {errors.fullName}
                  </p>
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
                  <p className="mt-1 text-xs text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              {[
                {
                  name: "division",
                  label: "Division *",
                  placeholder: "e.g. Dhaka",
                },
                {
                  name: "district",
                  label: "District *",
                  placeholder: "e.g. Dhaka",
                },
                {
                  name: "area",
                  label: "Area / Upazila *",
                  placeholder: "Your area",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium"
                  >
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
                <label
                  htmlFor="addressLine"
                  className="text-sm font-medium"
                >
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
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <h2 className="text-lg font-semibold">Order summary</h2>
            </div>

            <p className="mt-2 text-sm text-[#817665]">
              {items.length} {items.length === 1 ? "product" : "products"} ·{" "}
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </p>

            <div className="mt-6 space-y-5">
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.variantSku}-${index}`}
                  className="flex gap-4"
                >
                  <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f7f3eb]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName ?? "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#817665]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">
                      {item.productName ?? "Product"}
                    </h3>

                    <p className="mt-2 text-sm text-[#817665]">
                      Size: {item.size ?? "—"}
                    </p>

                    <p className="mt-1 text-sm text-[#817665]">
                      Color: {item.color ?? "—"}
                    </p>

                    <p className="mt-1 text-sm text-[#817665]">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-3 font-semibold">
                      ৳
                      {(item.unitPrice * item.quantity).toLocaleString("en-BD")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-dashed border-[#e8e0d3]" />

            <div className="flex justify-between text-sm text-[#817665]">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString("en-BD")}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm text-[#817665]">
              <span>Delivery charge</span>
              <span>To be confirmed</span>
            </div>

            <div className="my-5 border-t border-[#e8e0d3]" />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Product total</span>
              <span className="text-xl font-semibold">
                ৳{subtotal.toLocaleString("en-BD")}
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

export default Checkout1;
