import { useState } from "react";
import axios from "axios";
import "./auth.css";
import { useAuth } from "../../utils/AuthConext";
import { useNavigate } from "react-router-dom";

const Connexion = () => {
  const navigate=useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/login",
        credentials
      );
      console.log("Connexion réussie:", response.data);
      alert("Connexion réussie !");
      login(response.data.token,response.data.data._id);
      console.log(response.data._id);

      navigate("/")
    } catch (error) {
      console.error("Erreur de connexion:", error.response?.data || error);
      alert("Échec de la connexion.");
    }
  }; 

  return (
    <div className="box connexion-box">
      <h2>Connexion</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        onChange={handleChange}
      />
      <button onClick={handleSubmit}>Se connecter</button>
    </div>
  );
};

const Inscription = () => {
    const navigate = useNavigate();

    const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (formData.email !== formData.confirmEmail) {
      alert("Les emails ne se correspondent pas !");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne se correspondent pas !");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/signup", {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      console.log("Inscription réussie:", response.data);
      alert("Inscription réussie !");
      login(response.data.token);
            navigate("/");

    } catch (error) {
      console.error("Erreur d'inscription:", error.response?.data || error);
      alert("Échec de l'inscription.");
    }
  };

  return (
    <div className="box inscription-box">
      <h2>Inscription</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />
      <input
        type="email"
        name="confirmEmail"
        placeholder="Confirmer Email"
        onChange={handleChange}
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        onChange={handleChange}
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirmer Mot de passe"
        onChange={handleChange}
      />
      <button onClick={handleRegister}>S'inscrire</button>
    </div>
  );
};

const Auth = () => {
  return (
    <div className="container">
      <Connexion />
      <Inscription />
    </div>
  );
};

export default Auth;
