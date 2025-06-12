import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const CLIENT_ID = "5c6hfnre21hvjgvtkgc2u6q4ph";
//const REDIRECT_URI = "http://localhost:3000/welcome";  //For local
const REDIRECT_URI = "https://dak1rhhm5u7vh.cloudfront.net/welcome";
const COGNITO_DOMAIN = "https://us-east-1zvty5khu2.auth.us-east-1.amazoncognito.com"; // Hosted UI domain
const TOKEN_ENDPOINT = `${COGNITO_DOMAIN}/oauth2/token`;

function Home() {
  const loginUrl = `${COGNITO_DOMAIN}/login?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid+email+phone`;

  return (
    <div>
      <h2>Welcome to ANN Traders</h2>
      <button onClick={() => window.location.href = loginUrl}>Login with Cognito</button>
    </div>
  );
}

function Welcome() {
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      navigate("/");
      return;
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
    });

    fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
      .then(res => res.json())
      .then(data => {
        setToken(data.id_token || "No token returned");
        if (data.id_token) {
          const decoded = JSON.parse(atob(data.id_token.split(".")[1]));
          setUserInfo(decoded);
        }
      })
      .catch(err => {
        console.error("Token fetch failed", err);
        setToken("Token fetch failed");
      });
  }, [navigate]);

  const menuItems = ["List Items", "Add Items", "Modify Items", "Search Items", "Delete Items"];
  
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <div style={{ width: "200px", background: "#f2f2f2", padding: "1rem" }}>
        <h3>Menu</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item} style={{ margin: "0.5rem 0", cursor: "pointer" }}>{item}</li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>Welcome Page</h2>
        {userInfo && (
          <>
            <p><strong>Username:</strong> {userInfo["cognito:username"]}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
          </>
        )}
        {!userInfo && <p>Loading user info...</p>}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;
