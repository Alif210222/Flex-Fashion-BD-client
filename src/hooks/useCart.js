
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cartApi";

import {
  getGuestCart,
  addGuestCartItem,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
} from "../utils/guestCart";

import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

export const cartQueryKey = (isLoggedIn) =>
  isLoggedIn ? ["cart", "user"] : ["cart", "guest"];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

// Get cart
export function useCart(isLoggedIn = Boolean(sessionStorage.getItem("accessToken"))) {
  const queryClient = useQueryClient();

  const queryKey = cartQueryKey(isLoggedIn);

  const query = useQuery({
    queryKey,
    queryFn: isLoggedIn ? getCart : getGuestCart,
    enabled: true,
    staleTime: 30_000,
  });

  // Synchronize guest cart changes
  useEffect(() => {
    if (isLoggedIn) return;

    const updateCart = () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKey(false),
      });
    };

    window.addEventListener("guest-cart-updated", updateCart);
    window.addEventListener("storage", updateCart);

    return () => {
      window.removeEventListener("guest-cart-updated", updateCart);
      window.removeEventListener("storage", updateCart);
    };
  }, [isLoggedIn, queryClient]);

  return query;
}

// Shared cart mutation
function useCartMutation(
  userMutationFn,
  guestMutationFn,
  successMessage
) {
  const queryClient = useQueryClient();

  // Reactively read authentication state
  const { token } = useAuth();

  const isLoggedIn = Boolean(token);

  const queryKey = cartQueryKey(isLoggedIn);

  return useMutation({
    mutationFn: (variables) =>
      isLoggedIn
        ? userMutationFn(variables)
        : guestMutationFn(variables),

    onSuccess: (cart) => {
      queryClient.setQueryData(queryKey, cart);

      toast.success(successMessage);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Add cart item
export function useAddCartItem() {
  return useCartMutation(
    addCartItem,
    addGuestCartItem,
    "Added to your cart."
  );
}

// Update quantity
export function useUpdateCartItem() {
  return useCartMutation(
    updateCartItem,
    updateGuestCartItem,
    "Cart quantity updated."
  );
}

// Remove item
export function useRemoveCartItem() {
  return useCartMutation(
    removeCartItem,
    removeGuestCartItem,
    "Item removed from your cart."
  );
}

// Clear cart
export function useClearCart() {
  return useCartMutation(
    clearCart,
    clearGuestCart,
    "Your cart has been cleared."
  );
}
