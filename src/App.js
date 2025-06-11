import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const CLIENT_ID = "5c6hfnre21hvjgvtkgc2u6q4ph";
const REDIRECT_URI = "http://localhost:3000/welcome";
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
      })
      .catch(() => setToken("Token fetch failed"));
  }, [navigate]);

  return (
    <div>
      <h2>Welcome Page</h2>
      <pre>{token}</pre>
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
