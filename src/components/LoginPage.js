import {SignInAuthScreen} from "@firebase-oss/ui-react";
import {useNavigate, Link} from "react-router-dom";
import "./Login.css";

const LoginPage = () => {
	const navigate = useNavigate();
	return (
		<div>
			<SignInAuthScreen
				onSignIn={() => {
					navigate("/");
				}}
			/>
			<p style={{textAlign: "center"}}>
				Don't have an account? <Link to="/signup">Sign Up</Link>
			</p>
		</div>
	);
};

export default LoginPage;
