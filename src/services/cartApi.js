
import api from "./api";

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data.data.cart;
};

export const addCartItem = async ({
  productId,
  variantSku,
  quantity = 1,
}) => {
  const response = await api.post("/cart/items", {
    productId,
    variantSku,
    quantity,
  });

  return response.data.data.cart;
};

export const updateCartItem = async ({ sku, quantity }) => {
  const response = await api.patch(
    `/cart/items/${encodeURIComponent(sku)}`,
    { quantity }
  );

  return response.data.data.cart;
};

export const removeCartItem = async (sku) => {
  const response = await api.delete(
    `/cart/items/${encodeURIComponent(sku)}`
  );

  return response.data.data.cart;
};

export const clearCart = async () => {
  const response = await api.delete("/cart");
  return response.data.data.cart;
};
