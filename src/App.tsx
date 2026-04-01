import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "@/components/login";
import Register from "@/components/register";
import Dashboard from "@/components/dashboard";
import ProtectedRoute from "@/components/protected-route";
import GuestRoute from "@/components/guest-route";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<GuestRoute><Navigate to="/login" replace /></GuestRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
