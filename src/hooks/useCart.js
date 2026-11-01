
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

import { toast } from "sonner";

export const cartQueryKey = ["cart"];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

export function useCart(enabled = true) {
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
    enabled: enabled && Boolean(sessionStorage.getItem("accessToken")),
    staleTime: 30_000,
  });
}

function useCartMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAddCartItem() {
  return useCartMutation(
    addCartItem,
    "Added to your cart."
  );
}

export function useUpdateCartItem() {
  return useCartMutation(
    updateCartItem,
    "Cart quantity updated."
  );
}

export function useRemoveCartItem() {
  return useCartMutation(
    removeCartItem,
    "Item removed from your cart."
  );
}

export function useClearCart() {
  return useCartMutation(
    clearCart,
    "Your cart has been cleared."
  );
}
