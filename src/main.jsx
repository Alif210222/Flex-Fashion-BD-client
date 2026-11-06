import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/scrollToTop";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
          <ScrollToTop></ScrollToTop>
      <AuthProvider> 
         <App />
         <Toaster position="top-right" richColors />
      </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
