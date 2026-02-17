import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/commons/Navbar";
import Footer from "./components/commons/Footer";
import ScrollToTop from "./components/commons/ScrollToTop";
import Preloader from "./components/commons/Preloader";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Halls from "./pages/Halls";
import HallDetail from "./pages/HallDetail";
import MyBookings from "./pages/user/MyBookings";
import Reviews from "./pages/Reviews";
import Favorites from "./pages/user/Favorites";
import UserEditProfile from "./pages/user/EditProfile";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminEditProfile from "./pages/admin/EditProfile";
import HallOwnerDashboard from "./pages/hallowner/HallOwnerDashboard";
import MyHalls from "./pages/hallowner/MyHalls";
import AddHall from "./pages/hallowner/AddHall";
import EditHall from "./pages/hallowner/EditHall";
import EditProfile from "./pages/hallowner/EditProfile";
import EarningsReport from "./pages/hallowner/EarningsReport";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import "./styles/custom.css";

// Facebook privacy pages deployed

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Preloader />
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/data-deletion" element={<DataDeletion />} />
                <Route path="/terms" element={<PrivacyPolicy />} />
                {/* Reset password route removed - forgot password feature disabled */}
                <Route path="/halls" element={<Halls />} />
                <Route path="/halls/:id" element={<HallDetail />} />

                {/* User Routes */}
                <Route
                  path="/user/edit-profile"
                  element={
                    <PrivateRoute allowedRoles={["user"]}>
                      <UserEditProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <PrivateRoute>
                      <MyBookings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <PrivateRoute>
                      <Reviews />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <PrivateRoute>
                      <Favorites />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <PrivateRoute>
                      <Payment />
                    </PrivateRoute>
                  }
                />

                {/* Hall Owner Routes */}
                <Route
                  path="/hall-owner/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["hall_owner", "admin"]}>
                      <HallOwnerDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hall-owner/halls"
                  element={
                    <PrivateRoute allowedRoles={["hall_owner", "admin"]}>
                      <MyHalls />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hall-owner/halls/add"
                  element={
                    <PrivateRoute allowedRoles={["hall_owner", "admin"]}>
                      <AddHall />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hall-owner/halls/edit/:id"
                  element={
                    <PrivateRoute allowedRoles={["hall_owner", "admin"]}>
                      <EditHall />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hall-owner/edit-profile"
                  element={
                    <PrivateRoute allowedRoles={["hall_owner", "admin"]}>
                      <EditProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hall-owner/revenue"
                  element={
                    <PrivateRoute allowedRoles={["hall_owner", "admin"]}>
                      <EarningsReport />
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* Admin registration disabled - use backend script to create admin accounts */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/edit-profile"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <AdminEditProfile />
                    </PrivateRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ScrollToTop />
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
