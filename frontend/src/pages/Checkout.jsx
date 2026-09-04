import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Checkout() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Payment failed");
      }

      navigate(`/order-success/${data.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="checkout-page">

      <div className="checkout-card">

        <p className="section-label">CHECKOUT</p>

        <h1>Complete your order</h1>

        <p className="checkout-text">
          Review your order and continue with the demo payment.
        </p>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        <div className="payment-note">
          <strong>Demo Payment</strong>
          <p>
            No real payment will be processed.
          </p>
        </div>

        <button
          className="auth-button"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

      </div>

    </main>
  );
}

export default Checkout;