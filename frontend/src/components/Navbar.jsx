import { useEffect, useRef, useState } from "react";
import {
  Gift,
  MoreVertical,
  Wallet,
  History,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { getMe } from "../services/api";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [veBalance, setVeBalance] = useState(0);
  const [sveBalance, setSveBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("veloop_token");
    localStorage.removeItem("veloop_user_id");
    setMenuOpen(false);
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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/giveaways" className="navbar-brand" aria-label="VELOOP Rewards home">
        <Gift size={22} />
        <span>VELOOP</span>
      </Link>

      <div className="navbar-links">
        <Link to="/giveaways">Giveaways</Link>
        <a href="/giveaways#winners">Winners</a>
        <a href="/giveaways#faq">FAQ</a>
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <div className="navbar-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className={`navbar-menu-btn ${menuOpen ? "is-open" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open account menu"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <div className="navbar-dropdown" role="menu">
                <div className="navbar-dropdown-header">
                  <div className="navbar-dropdown-label">
                    <Wallet size={17} />
                    <span>VELOOP Wallet</span>
                  </div>
                  <span className="navbar-dropdown-status">Active</span>
                </div>

                <div className="navbar-balance-grid">
                  <div className="navbar-balance-item">
                    <span className="navbar-balance-icon">
                      <Coins size={15} />
                    </span>
                    <div>
                      <strong>{veBalance.toLocaleString()}</strong>
                      <small>VEs</small>
                    </div>
                  </div>

                  <div className="navbar-balance-item">
                    <span className="navbar-balance-icon">
                      <Coins size={15} />
                    </span>
                    <div>
                      <strong>{sveBalance.toLocaleString()}</strong>
                      <small>SVEs</small>
                    </div>
                  </div>

                  <div className="navbar-balance-item navbar-balance-item-wide">
                    <span className="navbar-balance-icon">
                      <Coins size={15} />
                    </span>
                    <div>
                      <strong>{tokenBalance.toLocaleString()}</strong>
                      <small>Tokens</small>
                    </div>
                  </div>
                </div>

                <div className="navbar-dropdown-divider" />

                <Link
                  to="/giveaways"
                  className="navbar-dropdown-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <History size={17} />
                  <span>Transaction History</span>
                </Link>

                {userRole === "ADMIN" && (
                  <Link
                    to="/admin/claims"
                    className="navbar-dropdown-item"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck size={17} />
                    <span>Admin Claims</span>
                  </Link>
                )}

                <button
                  type="button"
                  className="navbar-dropdown-item navbar-dropdown-danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="navbar-login-btn">
              Login
            </Link>

            <Link to="/register" className="navbar-signup-btn">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
