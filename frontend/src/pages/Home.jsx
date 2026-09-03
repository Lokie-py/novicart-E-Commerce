import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const goToCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">
            SIMPLE. USEFUL. EVERYDAY.
          </p>

          <h1>
            Everything you need,
            <br />
            in one place.
          </h1>

          <p className="hero-text">
            Discover carefully selected products for your everyday life.
            Shop simply with NoviCart.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/products")}
          >
            Explore Products
          </button>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <p>SHOP BY CATEGORY</p>
          <h2>Find what you need</h2>
        </div>

        <div className="category-grid">

          <div
            className="category-card"
            onClick={() => goToCategory("Electronics")}
          >
            <h3>Electronics</h3>
            <p>Smart devices and everyday tech.</p>
          </div>

          <div
            className="category-card"
            onClick={() => goToCategory("Home & Living")}
          >
            <h3>Home & Living</h3>
            <p>Products that make your space better.</p>
          </div>

          <div
            className="category-card"
            onClick={() => goToCategory("Fashion")}
          >
            <h3>Fashion</h3>
            <p>Simple styles for everyday use.</p>
          </div>

          <div
            className="category-card"
            onClick={() => goToCategory("Accessories")}
          >
            <h3>Accessories</h3>
            <p>Useful additions for your daily routine.</p>
          </div>

        </div>
      </section>
    </main>
  );
}

export default Home;