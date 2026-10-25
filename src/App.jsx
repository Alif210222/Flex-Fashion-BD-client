
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
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} /> */}
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
      </Route>
      

      

      {/* Keep your other existing routes here. */}
    </Routes>
  );
}

