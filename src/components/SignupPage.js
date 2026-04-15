import {SignUpAuthScreen} from "@firebase-oss/ui-react";
import {useNavigate} from "react-router-dom";
import {doc, setDoc} from "firebase/firestore";
import {db, auth} from "../firebase";
import "./Login.css";

const SignupPage = () => {
	const navigate = useNavigate();

	const handleSignUp = async () => {
		const user = auth.currentUser;
		if (user) {
			await setDoc(doc(db, "user", user.uid), {
				email: user.email,
				firstName: "",
				lastName: "",
				createdAt: new Date(),
			});
		}
		navigate("/profile");
	};

	return <SignUpAuthScreen onSignUp={handleSignUp} />;
};

export default SignupPage;
