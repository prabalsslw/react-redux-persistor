import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {

return (
	<BrowserRouter>
		<Routes>
			{/* Public Routes */}
			<Route path="/" element={<Login />} />
			
			{/* Protected Routes */}
			<Route element={<ProtectedRoute />}>
				<Route path="/dashboard" element={<Dashboard />} />
				{/* <Route path="/profile" element={<Profile />} /> */}
			</Route>
			
			{/* Redirect to login by default */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	</BrowserRouter>
  )
}

export default App
