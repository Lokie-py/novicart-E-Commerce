import { createContext, useContext, useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  async function loadUser() {

    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (!response.ok) {
        localStorage.removeItem("access_token");
        setUser(null);
        return;
      }


      const data = await response.json();

      setUser(data);

    } catch (error) {

      console.error("Failed to load user:", error);

      localStorage.removeItem("access_token");
      setUser(null);

    } finally {

      setLoading(false);

    }
  }


  function logout() {

    localStorage.removeItem("access_token");

    setUser(null);

  }


  useEffect(() => {
    loadUser();
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}