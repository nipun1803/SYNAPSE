import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";   
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";

function PrivateRoute({ children }) {
  return (
    <AuthContext.Consumer>
      {({ token }) => (token ? children : <Navigate to="/login" replace />)}
    </AuthContext.Consumer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}