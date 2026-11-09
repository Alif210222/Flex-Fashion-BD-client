
// import Home from "./pages/Home";

// export default function App() {
//   return <Home />;
// }

import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/admin/adminLayout";
import ProductManagement from "./components/admin/ProductManagement";
import ProductEditor from "./components/admin/Product-add-edit";
import Products from "./pages/Products";
import MainLayout from "./components/layout/MainLayout";
import ProductDetails from "./pages/ProductDetails";
//import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./components/admin/AdminOrders";
import AdminOverview from "./components/admin/AdminOverview";
import Cart from "./pages/Cart";
import Checkout2 from "./pages/Checkout2";
import WhatsAppButton from "./components/shared/WhatsappButton";
import useMetaPixel from "./hooks/useMetaPixel";



function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#F7F3EB] p-6 text-[#292821] sm:p-10">
      <p className="text-xs uppercase tracking-[0.16em] text-[#817665]">
        Flex-Fashion BD
      </p>
      <h1 className="mt-3 text-3xl font-medium">Admin dashboard</h1>
      <p className="mt-3 text-sm text-[#777064]">
        Your admin access is working. Next, we'll add product management.
      </p>
    </main>
  );
}

export default function App() {

  useMetaPixel();
  
  return (
    <> 
    <Routes>
      
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:slug" element={<ProductDetails />}/>
        <Route path="/checkout" element={<Checkout2 />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/cart" element={<Cart />} />

        
      </Route>

       <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        <Route path="products" element={<ProductManagement />} />

        <Route path="products/new" element={<ProductEditor />} />

        <Route
          path="products/:id/edit"
          element={<ProductEditor />}
        />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/overview" element={<AdminOverview />} />
      </Route>
      {/* Keep your other existing routes here. */}
    </Routes>

      <WhatsAppButton></WhatsAppButton>
    </>
  );
}

