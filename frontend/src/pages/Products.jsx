import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  // =========================
  // Debounce search
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // =========================
  // Fetch categories
  // =========================

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/products/categories`);

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await response.json();

        setCategories(data);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchCategories();
  }, []);

  // =========================
  // Fetch products
  // =========================

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }

        if (category) {
          params.set("category", category);
        }

        if (sort) {
          params.set("sort", sort);
        }

        const queryString = params.toString();

        const response = await fetch(
          `${API_URL}/products${queryString ? `?${queryString}` : ""}`,
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
  }, [debouncedSearch, category, sort]);

  // =========================
  // Category change
  // =========================

  function handleCategoryChange(event) {
    const selectedCategory = event.target.value;

    const newParams = new URLSearchParams(searchParams);

    if (selectedCategory) {
      newParams.set("category", selectedCategory);
    } else {
      newParams.delete("category");
    }

    setSearchParams(newParams);
  }

  // =========================
  // Sort change
  // =========================

  function handleSortChange(event) {
    const selectedSort = event.target.value;

    const newParams = new URLSearchParams(searchParams);

    if (selectedSort) {
      newParams.set("sort", selectedSort);
    } else {
      newParams.delete("sort");
    }

    setSearchParams(newParams);
  }

  // =========================
  // Clear filters
  // =========================

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setSearchParams({});
  }

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
        <p className="form-error">{error}</p>
      </main>
    );
  }

  const availableProducts = products.filter((product) => product.stock > 0);

  const hasFilters = search.trim() !== "" || category !== "" || sort !== "";

  return (
    <main className="products-page">
      {/* =========================
          Products Header
      ========================= */}

      <div className="products-header">
        <div className="products-heading">
          <p className="section-label">NOVICART STORE</p>

          <h1>{category || "All Products"}</h1>

          <p>
            {category
              ? `Browse our ${category} collection.`
              : "Browse our collection of carefully selected products."}
          </p>
        </div>

        {/* =========================
            Search
        ========================= */}

        <div className="search-box">
          <span className="search-icon">🔎</span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* =========================
          Filters
      ========================= */}

      <div className="product-filters">
        {/* Category */}

        <div className="category-filter">
          <label htmlFor="category">Category</label>

          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>

            {categories.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}

        <div className="category-filter">
          <label htmlFor="sort">Sort by</label>

          <select id="sort" value={sort} onChange={handleSortChange}>
            <option value="">Default</option>

            <option value="price_asc">Price: Low to High</option>

            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Clear */}

        {hasFilters && (
          <button
            type="button"
            className="clear-filters"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* =========================
          Products
      ========================= */}

      {availableProducts.length === 0 ? (
        <div className="empty-cart">
          <h2>No products available</h2>

          <p>
            {search
              ? `No products found for "${search}".`
              : category
                ? `There are currently no products available in ${category}.`
                : "Check back soon for new products."}
          </p>

          {hasFilters && (
            <button
              type="button"
              className="primary-button"
              onClick={clearFilters}
            >
              View All Products
            </button>
          )}
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
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <span>No Image</span>
                )}
              </div>

              <div className="product-info">
                <p className="product-category">
                  {product.category || "General"}
                </p>

                <h2>{product.name}</h2>

                <p className="product-description">{product.description}</p>

                <div className="product-bottom">
                  <span className="product-price">
                    ₹{Number(product.price).toFixed(2)}
                  </span>

                  <span className="view-product">View</span>
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
