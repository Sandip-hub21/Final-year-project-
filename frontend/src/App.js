import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import BrowseJobs from "./pages/BrowseJobs";
import Recommendations from "./pages/Recommendations";
import SavedRecommendations from "./pages/SavedRecommendations";
import Applications from "./pages/Applications";

import PublisherDashboard from "./pages/PublisherDashboard";

import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import AdminApplications from "./pages/AdminApplications";
import AdminUsers from "./pages/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
function App() {
  return (
    <div className="app-shell">
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/saved-recommendations" element={<SavedRecommendations />} />
          <Route path="/applications" element={<Applications />} />

          <Route path="/publisher/dashboard" element={<PublisherDashboard />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;