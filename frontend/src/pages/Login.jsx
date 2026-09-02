import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


const API_URL = "http://127.0.0.1:8000";


function Login() {

  const navigate = useNavigate();

  const { loadUser } = useAuth();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setLoading(true);


    try {

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Login failed"
        );

      }


      // Save JWT token
      localStorage.setItem(
        "access_token",
        data.access_token
      );


      // Load the logged-in user's details
      await loadUser();


      // Go to homepage
      navigate("/");


    } catch (error) {

      setError(error.message);


    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="auth-page">

      <div className="auth-card">


        <div className="auth-header">

          <h1>Welcome back</h1>

          <p>
            Login to continue shopping with NoviCart.
          </p>

        </div>


        <form onSubmit={handleSubmit}>


          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

          </div>


          {error && (

            <p className="form-error">
              {error}
            </p>

          )}


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>


        </form>


        <p className="auth-footer">

          Don't have an account?{" "}

          <Link to="/register">
            Create one
          </Link>

        </p>


      </div>

    </div>

  );

}


export default Login;