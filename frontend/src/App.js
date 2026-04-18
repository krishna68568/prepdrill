import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Practice from "@/pages/Practice";
import Exams from "@/pages/Exams";
import MockTest from "@/pages/MockTest";
import MockResult from "@/pages/MockResult";
import Analytics from "@/pages/Analytics";
import Doubt from "@/pages/Doubt";
import AdminHome from "@/pages/admin/AdminHome";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import AdminTests from "@/pages/admin/AdminTests";
import AdminUsers from "@/pages/admin/AdminUsers";

function Shell({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
        </div>
    );
}

export default function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Shell><Landing /></Shell>} />
                        <Route path="/login" element={<Shell><Login /></Shell>} />
                        <Route path="/signup" element={<Shell><Signup /></Shell>} />

                        <Route path="/dashboard" element={<ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>} />
                        <Route path="/practice" element={<ProtectedRoute><Shell><Practice /></Shell></ProtectedRoute>} />
                        <Route path="/exams" element={<ProtectedRoute><Shell><Exams /></Shell></ProtectedRoute>} />
                        <Route path="/test/:id" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
                        <Route path="/result/:id" element={<ProtectedRoute><Shell><MockResult /></Shell></ProtectedRoute>} />
                        <Route path="/analytics" element={<ProtectedRoute><Shell><Analytics /></Shell></ProtectedRoute>} />
                        <Route path="/doubt" element={<ProtectedRoute><Shell><Doubt /></Shell></ProtectedRoute>} />

                        <Route path="/admin" element={<ProtectedRoute adminOnly><Shell><AdminHome /></Shell></ProtectedRoute>} />
                        <Route path="/admin/questions" element={<ProtectedRoute adminOnly><Shell><AdminQuestions /></Shell></ProtectedRoute>} />
                        <Route path="/admin/tests" element={<ProtectedRoute adminOnly><Shell><AdminTests /></Shell></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute adminOnly><Shell><AdminUsers /></Shell></ProtectedRoute>} />
                    </Routes>
                </BrowserRouter>
                <Toaster position="top-right" richColors />
            </AuthProvider>
        </div>
    );
}
