import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="logo">
            NoviCart
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>

            <Link to="/products">Products</Link>

            {user && <Link to="/cart">Cart</Link>}

            {user && <Link to="/orders">Orders</Link>}

            {user?.role === "admin" && <Link to="/admin">Admin</Link>}

            {!user && (
              <>
                <Link to="/login">Login</Link>

                <Link to="/register">Register</Link>
              </>
            )}

            {user && (
              <button className="logout-button" onClick={logout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route path="/products/:productId" element={<ProductDetails />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/order-success/:orderId" element={<OrderSuccess />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/orders/:orderId" element={<OrderDetails />} />

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
