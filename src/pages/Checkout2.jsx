
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
  ShoppingBag,
 
  Check,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import { clearGuestCart } from "../utils/guestCart";
import { clearCart as clearUserCart } from "../services/cartApi";

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
};

// const initialAccountForm = {
//   email: "",
//   password: "",
//   confirmPassword: "",
// };

const Checkout2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
const isLoggedIn = Boolean(token && user);

  const checkoutState = location.state ?? {};

  const {
    source,
    product,
    selectedVariant,
    variant: fallbackVariant,
    quantity: initialQuantity,
    checkoutItems,
  } = checkoutState;

  const isCartCheckout = source === "cart";
  const variant = selectedVariant ?? fallbackVariant;
  const quantity = Math.max(1, Number(initialQuantity) || 1);

  const items = isCartCheckout
    ? Array.isArray(checkoutItems)
      ? checkoutItems.map((item) => ({
          ...item,
          product: item.product ?? null,
          productId: item.productId ?? item.product?._id ?? item._id,
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

  //const isLoggedIn = Boolean(user && token);

  const [form, setForm] = useState(() => ({
    ...initialForm,
    fullName: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  }));

 // const [accountForm, setAccountForm] = useState(initialAccountForm);

  //const [accountCreated, setAccountCreated] = useState(isLoggedIn);
  //const [creatingAccount, setCreatingAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});
  //const [accountErrors, setAccountErrors] = useState({});

  const [deliveryLocation, setDeliveryLocation] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const deliveryCharge =
    deliveryLocation === "inside-dhaka"
      ? 70
      : deliveryLocation === "outside-dhaka"
        ? 130
        : 0;

  const grandTotal = subtotal + deliveryCharge;

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

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // const updateAccountField = (event) => {
  //   const { name, value } = event.target;

  //   setAccountForm((previous) => ({
  //     ...previous,
  //     [name]: value,
  //   }));

  //   setAccountErrors((previous) => ({
  //     ...previous,
  //     [name]: "",
  //   }));
  // };

  const handleDeliveryChange = (value) => {
    setDeliveryLocation(value);

    setErrors((previous) => ({
      ...previous,
      deliveryLocation: "",
    }));
  };

  const validateDeliveryForm = () => {
    const nextErrors = {};

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!/^(?:\+?8801|01)[3-9]\d{8}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid Bangladesh phone number.";
    }

    if (form.address.trim().length < 5) {
      nextErrors.address = "Please enter your detailed address.";
    }

    if (!deliveryLocation) {
      nextErrors.deliveryLocation = "Please select a delivery location.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // const validateAccountForm = () => {
  //   const nextErrors = {};

  //   if (!accountForm.email.trim()) {
  //     nextErrors.email = "Email is required.";
  //   } else if (
  //     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email.trim())
  //   ) {
  //     nextErrors.email = "Enter a valid email address.";
  //   }

  //   if (accountForm.password.length < 8) {
  //     nextErrors.password = "Password must be at least 8 characters.";
  //   }

  //   if (accountForm.password.length > 72) {
  //     nextErrors.password = "Password must not exceed 72 characters.";
  //   }

  //   if (accountForm.password !== accountForm.confirmPassword) {
  //     nextErrors.confirmPassword = "Passwords do not match.";
  //   }

  //   setAccountErrors(nextErrors);

  //   return Object.keys(nextErrors).length === 0;
  // };

  // const handleCreateAccount = async () => {
  //   if (creatingAccount || accountCreated) return;

  //   if (form.fullName.trim().length < 2) {
  //     setErrors((previous) => ({
  //       ...previous,
  //       fullName: "Enter your name before creating an account.",
  //     }));
  //     toast.error("Please enter your name first.");
  //     return;
  //   }

  //   if (!validateAccountForm()) return;

  //   try {
  //     setCreatingAccount(true);

  //     await register({
  //       name: form.fullName.trim(),
  //       email: accountForm.email.trim(),
  //       password: accountForm.password,
  //     });

  //     setAccountCreated(true);
  //     setAccountForm(initialAccountForm);

  //     toast.success("Your account has been created successfully!");
  //   } catch (error) {
  //     toast.error(
  //       error.response?.data?.message ??
  //         error.message ??
  //         "Could not create your account."
  //     );
  //   } finally {
  //     setCreatingAccount(false);
  //   }
  // };

 
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!hasCheckoutItems) {
    toast.error(
      "Product information is missing. Please select your product again."
    );
    return;
  }

  if (!validateDeliveryForm()) return;

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
        address: form.address.trim(),
      },

      deliveryLocation,
    };

    // Create order first. Never clear the cart before this succeeds.
    const response = await api.post("/orders", orderPayload);

    const orderData = response.data?.data ?? {};

    const orderNumber =
      orderData.orderNumber ??
      orderData.order?.orderNumber;

    // Clear only the cart used for this checkout.
    if (isCartCheckout) {
      try {
        if (isLoggedIn) {
          await clearUserCart();
        } else {
          clearGuestCart();
        }
      } catch (cartError) {
        // Order is already created. Do not show order failure
        // just because cart cleanup failed.
        console.error("Cart cleanup failed:", cartError);
        toast.warning(
          "Order placed, but your cart could not be cleared automatically."
        );
      }
    }

    toast.success("Your order has been placed successfully!");

    if (isLoggedIn) {
      navigate("/my-orders", {
        replace: true,
        state: {
          orderPlaced: true,
          orderId: orderData.order?._id,
          orderNumber,
        },
      });
    } else {
      // Guest cannot access order history or order details.
      // Only show a basic order confirmation/reference.
      navigate("/", {
        replace: true,
        state: {
          orderPlaced: true,
          orderNumber,
        },
      });
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message ??
        "Could not place your order. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};


  const inputClass = (field, errorSource = errors) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#292821] outline-none transition placeholder:text-[#a29b90] focus:border-[#817665] ${
      errorSource[field] ? "border-red-400" : "border-[#e8e0d3]"
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

        <div className="mb-10 hidden lg:top">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#817665]">
            Flex-Fashion BD
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Easy checkout.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#817665]">
            Add your delivery information, create your account and confirm
            your cash-on-delivery order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]"
          noValidate
        >
          

{/* ----------- */}

<section className="rounded-2xl border border-[#e8e0d3] bg-white p-4 sm:p-6">
  {/* Delivery information */}
  <div className="mb-5 flex items-center gap-3">
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

  {/* Delivery form */}
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border p-3 border-amber-950 rounded-2xl">
    {/* Full name */}
    <div>
      <label htmlFor="fullName" className="text-sm font-medium">
        Full name <span className="text-xl text-red-500">*</span>
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

    {/* Phone */}
    <div>
      <label htmlFor="phone" className="text-sm font-medium">
        Phone number <span className="text-xl text-red-500">*</span>
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        inputMode="tel"
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

    {/* Address */}
    <div className="sm:col-span-2">
      <label htmlFor="address" className="text-sm font-medium">
        Detailed address <span className="text-xl text-red-500">*</span> 
      </label>
      <textarea
        id="address"
        name="address"
        autoComplete="street-address"
        rows={3}
        value={form.address}
        onChange={updateField}
        placeholder="House number, road, area, district..."
        className={inputClass("address")}
      />
      {errors.address && (
        <p className="mt-1 text-xs text-red-600">
          {errors.address}
        </p>
      )}
    </div>
  </div>

  {/* Account creation */}
  



  {/* Delivery location */}
  <div className="mt-7 border-t border-[#e8e0d3] pt-6">
    <h2 className="text-lg font-semibold text-[#0adb0a]">
      Delivery location <span className="text-xl text-red-500">*</span>
    </h2>
    <p className="mt-1 text-sm text-[#7d7261]">
      Select your delivery area.
    </p>

    <div className="mt-4 grid grid-cols-2 gap-3">
      {[
        {
          value: "inside-dhaka",
          label: "Inside Dhaka",
          fee: 70,
          description: "Within Dhaka",
        },
        {
          value: "outside-dhaka",
          label: "Outside Dhaka",
          fee: 130,
          description: "Outside Dhaka",
        },
      ].map((option) => {
        const isSelected = deliveryLocation === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleDeliveryChange(option.value)}
            aria-pressed={isSelected}
            className={`rounded-xl border-2 p-3 text-left transition-all duration-200 sm:p-4 ${
              isSelected
                ? "border-[#a18a62] bg-[#f7f3eb] shadow-sm"
                : "border-[#e8e0d3] bg-white hover:border-[#b9a98d] hover:bg-[#fcfaf6]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold sm:text-sm">
                {option.label}
              </span>

              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-[#a18a62] bg-[#a18a62] text-white"
                    : "border-[#d8d0c3] bg-white"
                }`}
              >
                {isSelected && (
                  <Check size={13} strokeWidth={3} />
                )}
              </span>
            </div>

            <p className="mt-2 text-lg font-semibold text-[#292821] sm:text-xl">
              ৳{option.fee}
            </p>

            <p className="mt-1 text-[11px] text-[#817665] sm:text-xs">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>

    {errors.deliveryLocation && (
      <p className="mt-2 text-xs text-red-600">
        {errors.deliveryLocation}
      </p>
    )}
  </div>

  {/* Payment */}
  <div className="mt-6 rounded-xl bg-[#f7f3eb] p-4">
    <p className="text-sm font-medium">
      Payment method
    </p>
    <p className="mt-1 text-sm text-[#817665]">
      Cash on Delivery — pay when your order arrives.
    </p>
  </div>

  {/* Confirm order */}
  <button
    type="submit"
    disabled={submitting}
    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#292821] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#49463d] disabled:cursor-not-allowed disabled:opacity-60"
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
{/* 
  {!isLoggedIn && !accountCreated && (
    <p className="mt-3 text-center text-xs text-[#817665]">
      Create your account before confirming your order.
    </p>
  )} */}
</section>


{/* ------- */}
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
              <span>
                {deliveryLocation
                  ? `৳${deliveryCharge.toLocaleString("en-BD")}`
                  : "Select delivery area"}
              </span>
            </div>

            <div className="my-5 border-t border-[#e8e0d3]" />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Grand Total</span>
              <span className="text-xl font-semibold">
                ৳{grandTotal.toLocaleString("en-BD")}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#817665]">
              Delivery charge is included in your total payable amount.
              Payment method: Cash on Delivery.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default Checkout2;
