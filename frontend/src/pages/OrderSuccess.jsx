import { Link, useParams } from "react-router-dom";

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <main className="success-page">

      <div className="success-card">

        <div className="success-icon">
          ✓
        </div>

        <p className="section-label">ORDER CONFIRMED</p>

        <h1>Thank you for your order!</h1>

        <p>
          Your order has been successfully placed.
        </p>

        <div className="order-number">
          Order #{orderId}
        </div>

        <div className="success-actions">

          <Link
            to="/products"
            className="secondary-button"
          >
            Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="auth-button"
          >
            View Orders
          </Link>

        </div>

      </div>

    </main>
  );
}

export default OrderSuccess;