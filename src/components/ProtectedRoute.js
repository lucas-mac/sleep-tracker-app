import {Navigate} from "react-router-dom";
import {useAuth} from "../AuthContext";
import WaSpinner from "@web.awesome.me/webawesome-pro/dist/react/spinner";

const ProtectedRoute = ({children}) => {
	const {user, loading} = useAuth();

	if (loading) {
		return (
			<div className="column align-center">
				<WaSpinner className="spinner-accent" />
			</div>
		);
	}

	if (!user) {
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}

	return children;
};

export default ProtectedRoute;
