import React, { useEffect, useState } from "react";

const CLIENT_ID = "5c6hfnre21hvjgvtkgc2u6q4ph";
const REDIRECT_URI = `${window.location.origin}/welcome`;
const COGNITO_DOMAIN = "https://us-east-1zvty5khu2.auth.us-east-1.amazoncognito.com";
const LOGIN_URL = `${COGNITO_DOMAIN}/login?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid+email+phone`;
const BACKEND_API = "https://37b4lg6p5k.execute-api.us-east-1.amazonaws.com/prod/products";

function App() {
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    fetch(`${BACKEND_API}/auth/validate-code?code=${code}`)
      .then(res => res.json())
      .then(data => {
        setToken(data.idToken);
        setUserInfo(data.userInfo);
        window.history.replaceState({}, document.title, window.location.pathname);
      });
  }, []);

  useEffect(() => {
    if (token) {
      fetch(BACKEND_API, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setProducts(Array.isArray(data) ? data : []));
    }
  }, [token]);

  const fetchProducts = () => {
    return fetch(BACKEND_API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []));
  };

  const addProduct = () => {
    fetch(BACKEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newProduct),
    })
      .then(() => {
        setNewProduct({ name: "", description: "", price: "" });
        return fetchProducts();
      });
  };

  const deleteProduct = (id) => {
    fetch(`${BACKEND_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(fetchProducts);
  };

  const updateProduct = (p) => {
    const updated = { ...p };
    delete updated.editing;

    fetch(`${BACKEND_API}/${p.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    }).then(fetchProducts);
  };

  const logout = () => {
    const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(window.location.origin)}`;
    setToken(null);
    setUserInfo(null);
    window.location.href = logoutUrl;
  };

  if (!token) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h2>Welcome to ANN Traders</h2>
        <button onClick={() => (window.location.href = LOGIN_URL)}>Login with Cognito</button>
      </div>
    );
  }

  const filteredProducts = Array.isArray(products)
    ? products.filter(p => (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", position: "relative" }}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.5rem",
          }}
        >
          🔓
        </button>
      </div>

      <h2>Welcome, {userInfo?.["cognito:username"] || userInfo?.email || "User"}</h2>

      <h3>Search</h3>
      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <h3>Add Product</h3>
      <input
        type="text"
        placeholder="Name"
        value={newProduct.name}
        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Description"
        value={newProduct.description}
        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={newProduct.price}
        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
      />
      <button onClick={addProduct}>Add</button>

      <h3>Product List</h3>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>
                {p.editing ? (
                  <input
                    value={p.name}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id ? { ...item, name: e.target.value } : item
                        )
                      )
                    }
                  />
                ) : (
                  p.name
                )}
              </td>
              <td>
                {p.editing ? (
                  <input
                    value={p.description}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id ? { ...item, description: e.target.value } : item
                        )
                      )
                    }
                  />
                ) : (
                  p.description
                )}
              </td>
              <td>
                {p.editing ? (
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id ? { ...item, price: e.target.value } : item
                        )
                      )
                    }
                  />
                ) : (
                  p.price
                )}
              </td>
              <td>
                {p.editing ? (
                  <button onClick={() => updateProduct(p)}>Save</button>
                ) : (
                  <button
                    onClick={() =>
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id ? { ...item, editing: true } : item
                        )
                      )
                    }
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteProduct(p.id)}
                  style={{ marginLeft: "0.5rem", color: "red" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
