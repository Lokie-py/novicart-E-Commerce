import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";


function Products() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function fetchProducts() {

      try {

        const response = await fetch(
          `${API_URL}/products`
        );

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        setProducts(data);

      } catch (error) {

        setError(error.message);

      } finally {

        setLoading(false);

      }

    }

    fetchProducts();

  }, []);


  if (loading) {

    return (
      <main className="products-page">
        <p>Loading products...</p>
      </main>
    );

  }


  if (error) {

    return (
      <main className="products-page">

        <p className="form-error">
          {error}
        </p>

      </main>
    );

  }


  // Only show products that are currently in stock
  const availableProducts = products.filter(
    (product) => product.stock > 0
  );


  return (

    <main className="products-page">


      <div className="products-header">

        <div>

          <p className="section-label">
            NOVICART STORE
          </p>

          <h1>
            All Products
          </h1>

          <p>
            Browse our collection of carefully selected
            products.
          </p>

        </div>

      </div>


      {availableProducts.length === 0 ? (

        <div className="empty-cart">

          <h2>
            No products available
          </h2>

          <p>
            Check back soon for new products.
          </p>

        </div>

      ) : (

        <div className="products-grid">

          {availableProducts.map((product) => (

            <Link
              to={`/products/${product.id}`}
              className="product-card"
              key={product.id}
            >

              <div className="product-image">

                {product.image_url ? (

                  <img
                    src={product.image_url}
                    alt={product.name}
                  />

                ) : (

                  <span>
                    No Image
                  </span>

                )}

              </div>


              <div className="product-info">

                <p className="product-category">
                  {product.category || "General"}
                </p>


                <h2>
                  {product.name}
                </h2>


                <p className="product-description">
                  {product.description}
                </p>


                <div className="product-bottom">

                  <span className="product-price">
                    ₹{product.price.toFixed(2)}
                  </span>


                  <span className="view-product">
                    View
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

      )}

    </main>

  );

}


export default Products;