import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load orders");
        }

        setOrders(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <main className="orders-page">
        <p>Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="orders-page">

      <div className="orders-header">
        <p className="section-label">YOUR ORDERS</p>
        <h1>Order History</h1>
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="empty-cart">
          <h2>No orders yet</h2>
          <p>Your completed orders will appear here.</p>

          <Link
            to="/products"
            className="auth-button cart-button"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">

          {orders.map((order) => (

            <div className="order-card" key={order.id}>

              <div className="order-top">

                <div>
                  <p className="order-label">
                    ORDER
                  </p>

                  <h2>#{order.id}</h2>
                </div>

                <span className="order-status">
                  {order.status}
                </span>

              </div>

              <div className="order-info">

                <span>
                  {order.items.length} item
                  {order.items.length !== 1 ? "s" : ""}
                </span>

                <strong>
                  ₹{Number(order.total_amount).toFixed(2)}
                </strong>

              </div>

              <Link
                to={`/orders/${order.id}`}
                className="order-link"
              >
                View Order →
              </Link>

            </div>

          ))}

        </div>
      )}

    </main>
  );
}

export default Orders;