import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;


function Cart() {

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function fetchCart() {

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {

        const cartResponse = await fetch(`${API_URL}/cart`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!cartResponse.ok) {
          throw new Error("Failed to load cart");
        }

        const cartData = await cartResponse.json();


        const productsResponse = await fetch(
          `${API_URL}/products`
        );

        if (!productsResponse.ok) {
          throw new Error("Failed to load products");
        }

        const productsData = await productsResponse.json();


        setCartItems(cartData);
        setProducts(productsData);

      } catch (error) {

        setError(error.message);

      } finally {

        setLoading(false);

      }
    }

    fetchCart();

  }, [navigate]);


  function getProduct(productId) {

    return products.find(
      (product) => product.id === productId
    );

  }


  async function removeItem(cartItemId) {

    const token = localStorage.getItem("access_token");

    try {

      const response = await fetch(
        `${API_URL}/cart/${cartItemId}`,
        {
          method: "DELETE",

          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to remove item"
        );
      }


      setCartItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== cartItemId
        )
      );

    } catch (error) {

      setError(error.message);

    }
  }


  const cartProducts = cartItems
    .map((item) => ({
      cartItem: item,
      product: getProduct(item.product_id),
    }))
    .filter((item) => item.product);


  const total = cartProducts.reduce(
    (sum, item) =>
      sum + item.product.price * item.cartItem.quantity,
    0
  );


  if (loading) {
    return (
      <main className="cart-page">
        <p>Loading cart...</p>
      </main>
    );
  }


  return (
    <main className="cart-page">

      <div className="cart-header">

        <div>
          <p className="section-label">YOUR SHOPPING CART</p>

          <h1>Your Cart</h1>
        </div>

      </div>


      {error && (
        <p className="form-error">
          {error}
        </p>
      )}


      {cartProducts.length === 0 ? (

        <div className="empty-cart">

          <h2>Your cart is empty</h2>

          <p>
            Browse our products and add something you like.
          </p>

          <Link
            to="/products"
            className="auth-button cart-button"
          >
            Browse Products
          </Link>

        </div>

      ) : (

        <div className="cart-layout">


          <div className="cart-items">

            {cartProducts.map(({ cartItem, product }) => (

              <div
                className="cart-item"
                key={cartItem.id}
              >

                <div className="cart-item-image">

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                    />
                  ) : (
                    <span>No Image</span>
                  )}

                </div>


                <div className="cart-item-info">

                  <p className="product-category">
                    {product.category || "General"}
                  </p>

                  <h2>{product.name}</h2>

                  <p>
                    ₹{product.price} × {cartItem.quantity}
                  </p>

                  <strong>
                    ₹
                    {(
                      product.price *
                      cartItem.quantity
                    ).toFixed(2)}
                  </strong>

                </div>


                <button
                  className="remove-button"
                  onClick={() =>
                    removeItem(cartItem.id)
                  }
                >
                  Remove
                </button>

              </div>

            ))}

          </div>


          <aside className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <span>Free</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              className="auth-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

          </aside>

        </div>

      )}

    </main>
  );
}


export default Cart;