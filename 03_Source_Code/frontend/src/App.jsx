import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Report from "./pages/Report";
import Claim from "./pages/Claim";
import Detail from "./pages/Detail";
import DetailClaim from "./pages/DetailClaim";
import History from "./pages/History";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserManagement from "./pages/UserManagement";
import UserProfile from "./pages/UserProfile";
import AuditLogs from "./pages/AuditLogs";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { SearchProvider } from "./context/SearchContext";
import { ItemsProvider } from "./context/ItemsContext";

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <LanguageProvider>
          <NotificationsProvider>
            <ItemsProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route
                    path="/*"
                    element={
                      <div className="app-container">
                        <Sidebar />
                        <main className="main-content">
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/browse" element={<Browse />} />
                            <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
                            <Route path="/detail/:id" element={<Detail />} />
                            <Route path="/claim/:id" element={<ProtectedRoute><Claim /></ProtectedRoute>} />
                            <Route
                              path="/detail-claim/:id"
                              element={<ProtectedRoute><DetailClaim /></ProtectedRoute>}
                            />
                            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                            <Route path="/users" element={<ProtectedRoute requiredRole="Admin"><UserManagement /></ProtectedRoute>} />
                            <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                            <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="Admin"><AuditLogs /></ProtectedRoute>} />
                          </Routes>
                        </main>
                      </div>
                    }
                  />
                </Routes>
              </Router>
            </ItemsProvider>
          </NotificationsProvider>
        </LanguageProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
