import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;


function ProductDetails() {

  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  useEffect(() => {

    async function fetchProduct() {

      try {

        const response = await fetch(
          `${API_URL}/products/${productId}`
        );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        setProduct(data);

      } catch (error) {

        setError(error.message);

      } finally {

        setLoading(false);

      }
    }

    fetchProduct();

  }, [productId]);


  async function handleAddToCart() {

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setAdding(true);
    setError("");
    setSuccess("");

    try {

      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },

        body: JSON.stringify({
          product_id: Number(productId),
          quantity: quantity,
        }),
      });


      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.detail || "Failed to add item to cart");
      }


      setSuccess("Product added to your cart.");

    } catch (error) {

      setError(error.message);

    } finally {

      setAdding(false);

    }
  }


  if (loading) {
    return (
      <main className="product-details-page">
        <p>Loading product...</p>
      </main>
    );
  }


  if (error && !product) {
    return (
      <main className="product-details-page">

        <p className="form-error">
          {error}
        </p>

        <Link to="/products" className="back-link">
          Back to Products
        </Link>

      </main>
    );
  }


  return (
    <main className="product-details-page">

      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>


      <div className="product-details">

        <div className="details-image">

          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
            />
          ) : (
            <span>No Image</span>
          )}

        </div>


        <div className="details-content">

          <p className="product-category">
            {product.category || "General"}
          </p>

          <h1>{product.name}</h1>

          <p className="details-price">
            ₹{product.price}
          </p>

          <p className="details-description">
            {product.description}
          </p>


          <div className="stock-info">

            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}

          </div>


          {product.stock > 0 && (

            <div className="quantity-control">

              <label>Quantity</label>

              <div className="quantity-buttons">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(product.stock, current + 1)
                    )
                  }
                >
                  +
                </button>

              </div>

            </div>

          )}


          {error && (
            <p className="form-error">
              {error}
            </p>
          )}


          {success && (
            <p className="form-success">
              {success}
            </p>
          )}


          <button
            className="auth-button"
            disabled={product.stock === 0 || adding}
            onClick={handleAddToCart}
          >
            {adding
              ? "Adding..."
              : product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
          </button>

        </div>

      </div>

    </main>
  );
}


export default ProductDetails;