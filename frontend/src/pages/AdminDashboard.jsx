import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ORDER_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const statsResponse = await fetch(`${API_URL}/admin/stats`, {
          headers,
        });

        const ordersResponse = await fetch(`${API_URL}/admin/orders`, {
          headers,
        });

        const statsData = await statsResponse.json();
        const ordersData = await ordersResponse.json();

        if (!statsResponse.ok) {
          throw new Error(statsData.detail || "Admin access required");
        }

        if (!ordersResponse.ok) {
          throw new Error(ordersData.detail || "Failed to load orders");
        }

        setStats(statsData);
        setOrders(ordersData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [navigate]);

  async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem("access_token");

    setUpdatingOrderId(orderId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/orders/${orderId}/status?status=${newStatus}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update order status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.status,
              }
            : order,
        ),
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (loading) {
    return (
      <main className="admin-page">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error && !stats) {
    return (
      <main className="admin-page">
        <p className="form-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="section-label">NOVICART ADMIN</p>

          <h1>Dashboard</h1>

          <p>Manage your store and monitor recent orders.</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {/* Statistics */}

      <div className="stats-grid">
        <div className="stat-card">
          <p>Products</p>
          <strong>{stats.total_products}</strong>
        </div>

        <div className="stat-card">
          <p>Users</p>
          <strong>{stats.total_users}</strong>
        </div>

        <div className="stat-card">
          <p>Orders</p>
          <strong>{stats.total_orders}</strong>
        </div>

        <div className="stat-card">
          <p>Revenue</p>
          <strong>₹{Number(stats.total_revenue).toFixed(2)}</strong>
        </div>
      </div>

      {/* Quick Actions */}

      <section className="admin-actions">
        <div className="admin-section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="admin-action-buttons">
          <button
            type="button"
            className="auth-button"
            onClick={() =>
              document
                .querySelector(".admin-orders")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Manage Orders
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/products")}
          >
            View Store
          </button>
        </div>
      </section>

      {/* Orders */}

      <section className="admin-orders">
        <div className="admin-section-header">
          <div>
            <h2>Recent Orders</h2>

            <p>Update order status directly from the dashboard.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="empty-admin">No orders yet.</p>
        ) : (
          <div className="admin-table">
            <div className="admin-table-row admin-table-head">
              <span>Order</span>

              <span>Customer</span>

              <span>Total</span>

              <span>Status</span>
            </div>

            {orders.map((order) => (
              <div className="admin-table-row" key={order.id}>
                <span>#{order.id}</span>

                <span>
                  {order.customer_name}

                  <small>{order.customer_email}</small>
                </span>

                <span>₹{Number(order.total_amount).toFixed(2)}</span>

                <span>
                  <select
                    className="order-status-select"
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(event) =>
                      updateOrderStatus(order.id, event.target.value)
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
