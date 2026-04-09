import React from "react";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";

import "@shoelace-style/shoelace/dist/themes/light.css";
import "@firebase-oss/ui-styles/dist.min.css";
import {setBasePath} from "@shoelace-style/shoelace/dist/utilities/base-path.js";
setBasePath("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/");

import {ui} from "./firebase";
import {FirebaseUIProvider} from "@firebase-oss/ui-react";
import {AuthProvider} from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Controls from "./components/Controls";
import Timeline from "./components/TimelinePage";
import EditPage from "./components/EditPage";
import AddPage from "./components/AddPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProfilePage from "./components/ProfilePage";
import {signOut} from "firebase/auth";
import {auth} from "./firebase";

const handleLogout = () => signOut(auth);

const App = () => {
	return (
		<FirebaseUIProvider ui={ui}>
			<AuthProvider>
				<Router>
					<nav
						className="menu"
						style={{display: "none"}}
					>
						<Link to="/">Index</Link>
						<Link to="/edit">Edit</Link>
						<Link to="/add">Add</Link>
						<Link to="/profile">Profile</Link>
						<button onClick={handleLogout}>Logout</button>
					</nav>
					<Routes>
						<Route
							path="/"
							element={
								<ProtectedRoute>
									<Timeline />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/edit/:entryId"
							element={
								<ProtectedRoute>
									<EditPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/add"
							element={
								<ProtectedRoute>
									<AddPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<ProfilePage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/login"
							element={<LoginPage />}
						/>
						<Route
							path="/signup"
							element={<SignupPage />}
						/>
					</Routes>
				</Router>
			</AuthProvider>
		</FirebaseUIProvider>
	);
};

export default App;
