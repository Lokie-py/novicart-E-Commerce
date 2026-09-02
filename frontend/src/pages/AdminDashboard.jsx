import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

        const statsResponse = await fetch(
          `${API_URL}/admin/stats`,
          { headers }
        );

        const ordersResponse = await fetch(
          `${API_URL}/admin/orders`,
          { headers }
        );

        const statsData = await statsResponse.json();
        const ordersData = await ordersResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.detail || "Admin access required"
          );
        }

        if (!ordersResponse.ok) {
          throw new Error(
            ordersData.detail || "Failed to load orders"
          );
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

  if (loading) {
    return (
      <main className="admin-page">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
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
        </div>
      </div>


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
          <strong>
            ₹{stats.total_revenue.toFixed(2)}
          </strong>
        </div>

      </div>


      <section className="admin-orders">

        <div className="admin-section-header">
          <h2>Recent Orders</h2>
        </div>

        {orders.length === 0 ? (
          <p className="empty-admin">
            No orders yet.
          </p>
        ) : (

          <div className="admin-table">

            <div className="admin-table-row admin-table-head">
              <span>Order</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Status</span>
            </div>

            {orders.map((order) => (

              <div
                className="admin-table-row"
                key={order.id}
              >

                <span>#{order.id}</span>

                <span>
                  {order.customer_name}
                  <small>
                    {order.customer_email}
                  </small>
                </span>

                <span>
                  ₹{order.total_amount.toFixed(2)}
                </span>

                <span className="order-status">
                  {order.status}
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