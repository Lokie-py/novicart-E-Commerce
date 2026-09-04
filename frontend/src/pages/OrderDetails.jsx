import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load order");
        }

        setOrder(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <main className="orders-page">
        <p>Loading order...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <div className="empty-cart">
          <h2>Unable to load order</h2>
          <p>{error}</p>

          <Link
            to="/orders"
            className="auth-button cart-button"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="orders-page">

      <div className="orders-header">
        <p className="section-label">ORDER DETAILS</p>

        <h1>Order #{order.id}</h1>

        <p>
          Placed on{" "}
          {new Date(order.created_at).toLocaleDateString()}
        </p>
      </div>


      <div className="order-card">

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


        <div className="order-items">

          {order.items.map((item) => (

            <div
              className="order-item"
              key={item.product_id}
            >

              <div className="order-item-details">

                <h3>
                  {item.product_name}
                </h3>

                <p>
                  ₹{Number(item.price).toFixed(2)}
                  {" × "}
                  {item.quantity}
                </p>

              </div>

              <strong>
                ₹{Number(item.subtotal).toFixed(2)}
              </strong>

            </div>

          ))}

        </div>


        <div className="order-total">

          <span>
            Total
          </span>

          <strong>
            ₹{Number(order.total_amount).toFixed(2)}
          </strong>

        </div>


        <div className="success-actions">

          <Link
            to="/orders"
            className="secondary-button"
          >
            ← Back to Orders
          </Link>

          <Link
            to="/products"
            className="auth-button"
          >
            Continue Shopping
          </Link>

        </div>

      </div>

    </main>
  );
}

export default OrderDetails;