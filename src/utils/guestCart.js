
const GUEST_CART_KEY = "flex-fashion-guest-cart";

const emitCartChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("guest-cart-updated"));
  }
};

// Build a normalized cart response
const buildCart = (items = []) => {
  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const stock = Number(item.stock) || 0;

    const available =
      item.available !== false &&
      stock >= quantity &&
      Boolean(item.productId && item.variantSku);

    return {
      ...item,
      quantity,
      unitPrice,
      stock,
      available,
      lineTotal: unitPrice * quantity,
    };
  });

  const itemCount = normalizedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = normalizedItems.reduce(
    (total, item) => total + item.lineTotal,
    0
  );

  const unavailableItems = normalizedItems.filter(
    (item) => !item.available
  ).length;

  return {
    items: normalizedItems,
    itemCount,
    subtotal,
    unavailableItems,
    canCheckout:
      normalizedItems.length > 0 && unavailableItems === 0,
  };
};

// Read guest cart
export const getGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);

    const items = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(items)) {
      return buildCart([]);
    }

    return buildCart(items);
  } catch {
    return buildCart([]);
  }
};

// Save guest cart
const saveGuestCart = (items) => {
  localStorage.setItem(
    GUEST_CART_KEY,
    JSON.stringify(items)
  );

  emitCartChange();

  return buildCart(items);
};

// Add item to guest cart
export const addGuestCartItem = ({
  product,
  variant,
  quantity = 1,
}) => {
  if (!product?._id || !variant?.sku) {
    throw new Error(
      "Product or variant information is missing."
    );
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1 ||
    requestedQuantity > 20
  ) {
    throw new Error(
      "Quantity must be between 1 and 20."
    );
  }

  const items = getGuestCart().items;

  const existingIndex = items.findIndex(
    (item) =>
      item.productId === product._id &&
      item.variantSku === variant.sku
  );

  const stock = Number(
    variant.stock ?? variant.quantity ?? 0
  );

  const currentQuantity =
    existingIndex >= 0
      ? items[existingIndex].quantity
      : 0;

  const nextQuantity =
    currentQuantity + requestedQuantity;

  if (nextQuantity > 20) {
    throw new Error(
      "You can order a maximum of 20 items per variant."
    );
  }

  if (nextQuantity > stock) {
    throw new Error(
      `Only ${stock} item(s) are currently available.`
    );
  }

  // Variant price takes priority over product price
  const unitPrice = Number(
    variant.price ?? product.price ?? 0
  );

  const firstImage = product.images?.[0];

  const cartItem = {
    productId: product._id,
    variantSku: variant.sku,

    productName: product.name,
    slug: product.slug,

    image:
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.url || "",

    unitPrice,

    quantity: nextQuantity,

    size: variant.size || null,
    color: variant.color || null,
    colorHex: variant.colorHex || null,

    stock,
    available: true,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = cartItem;
  } else {
    items.push(cartItem);
  }

  return saveGuestCart(items);
};

// Update guest cart quantity
export const updateGuestCartItem = ({
  sku,
  quantity,
}) => {
  const items = getGuestCart().items;

  const index = items.findIndex(
    (item) => item.variantSku === sku
  );

  if (index === -1) {
    throw new Error("Cart item not found.");
  }

  const item = items[index];

  const nextQuantity = Number(quantity);

  if (
    !Number.isInteger(nextQuantity) ||
    nextQuantity < 1 ||
    nextQuantity > 20
  ) {
    throw new Error(
      "Quantity must be between 1 and 20."
    );
  }

  if (nextQuantity > item.stock) {
    throw new Error(
      `Only ${item.stock} item(s) are currently available.`
    );
  }

  items[index] = {
    ...item,
    quantity: nextQuantity,
  };

  return saveGuestCart(items);
};

// Remove guest cart item
export const removeGuestCartItem = (sku) => {
  const items = getGuestCart().items.filter(
    (item) => item.variantSku !== sku
  );

  return saveGuestCart(items);
};

// Clear guest cart
export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);

  emitCartChange();

  return buildCart([]);
};
