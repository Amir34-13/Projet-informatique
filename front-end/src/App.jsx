import React from "react";
import "./App.css";
import NavBar from "./components/navbar/NavBar";
import Auth from "./pages/auth/Auth";
import Home from "./pages/home/Home";
import BookDetail from "./pages/bookPage/bookDetails";
import UserProfile from "./pages/userPage/UserPage";
import { AuthProvider } from "./utils/AuthConext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <NavBar />

          <Routes>
            <Route exact path="/auth" element={<Auth />} />
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/user/:id" element={<UserProfile />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;
