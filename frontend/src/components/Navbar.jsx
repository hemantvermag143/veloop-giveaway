import { useEffect, useState } from "react";
import { Gift, Wallet } from "lucide-react";
import { getMe } from "../services/api";
import { Link } from "react-router-dom";

function Navbar() {
  const [veBalance, setVeBalance] = useState(0);
  const [sveBalance, setSveBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("veloop_token");
    window.location.reload();
  };

  useEffect(() => {
    const loadUserBalance = () => {
      const token = localStorage.getItem("veloop_token");

      if (!token) {
        setIsAuthenticated(false);
        setVeBalance(0);
        setSveBalance(0);
        setTokenBalance(0);
        setUserRole("");
        return;
      }

      getMe(token)
        .then((response) => {
          setIsAuthenticated(true);
          setVeBalance(response.data.balances?.VEs ?? 0);
          setSveBalance(response.data.balances?.SVEs ?? 0);
          setTokenBalance(response.data.balances?.Tokens ?? 0);
          setUserRole(response.data.role || "");
        })
        .catch(() => {
          localStorage.removeItem("veloop_token");
          localStorage.removeItem("veloop_user_id");

          setIsAuthenticated(false);
          setVeBalance(0);
          setSveBalance(0);
          setTokenBalance(0);
          setUserRole("");
        });
    };

    loadUserBalance();

    window.addEventListener("veloop:balance-updated", loadUserBalance);

    return () => {
      window.removeEventListener(
        "veloop:balance-updated",
        loadUserBalance
      );
    };
  }, []);



  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Gift size={24} />
        <span>VELOOP</span>
      </div>

      <div className="navbar-links">
        <a href="/giveaways">Giveaways</a>
        <a href="#winners">Winners</a>
        <a href="#faq">FAQ</a>
        {userRole === "ADMIN" && <a href="/admin/claims">Admin</a>}
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <div className="wallet-btn wallet-display">
              <Wallet size={18} />
              <span>
                {veBalance.toLocaleString()} VEs
                {" · "}
                {sveBalance.toLocaleString()} SVEs
                {" · "}
                {tokenBalance.toLocaleString()} Tokens
              </span>
            </div>

            <button
              type="button"
              className="navbar-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-login-btn">
              Login
            </Link>

            <Link to="/register" className="navbar-signup-btn">
              New User
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
