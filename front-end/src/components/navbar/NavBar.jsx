import './navbar.css'
import { Link } from "react-router-dom";
import { useAuth } from '../../utils/AuthConext';
const NavBar = () => {
  const {token,logOut} =useAuth();
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">📖 Roombakkd</Link>
      </div>
      <ul className="nav-links">
        <li>
          {token ? (
            <Link to="/auth" onClick={logOut}>
              Se déconnecter
            </Link>
          ) : (
            <Link to="/auth">Connexion|Inscription</Link>
          )}
        </li>
        <li>
          <Link>Livres</Link>
        </li>
        <li>
          <Link>Reviews</Link>
        </li>
      </ul>
      <div className="search">🔍</div>
    </nav>
  );
};



export default NavBar;
