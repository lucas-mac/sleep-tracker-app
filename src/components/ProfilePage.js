import {useState, useEffect} from "react";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {db, auth} from "../firebase";
import "./Login.css";

import SlInput from "@shoelace-style/shoelace/dist/react/input";
import SlButton from "@shoelace-style/shoelace/dist/react/button";

const ProfilePage = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const fetchUserData = async () => {
			const user = auth.currentUser;
			if (user) {
				const userDoc = await getDoc(doc(db, "user", user.uid));
				if (userDoc.exists()) {
					const data = userDoc.data();
					setFirstName(data.firstName || "");
					setLastName(data.lastName || "");
					setEmail(data.email || "");
				}
			}
			setLoading(false);
		};
		fetchUserData();
	}, []);

	const handleSave = async () => {
		const user = auth.currentUser;
		if (user) {
			setSaving(true);
			await updateDoc(doc(db, "user", user.uid), {
				firstName,
				lastName,
			});
			setSaving(false);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="profile-page">
			<h1>Profile</h1>
			<div className="elem-group column gap-lg align-start">
				<SlInput
					label="First Name"
					name="first_name"
					placeholder="John"
					size="large"
					type="text"
					value={firstName}
					onSlChange={(e) => setFirstName(e.target.value)}
				></SlInput>

				<SlInput
					label="Last Name"
					name="last_name"
					placeholder="Doe"
					size="large"
					type="text"
					value={lastName}
					onSlChange={(e) => setLastName(e.target.value)}
				></SlInput>

				<SlInput
					label="Email"
					name="email"
					size="large"
					type="email"
					value={email}
					className="full-width"
					readOnly
				></SlInput>

				<SlButton
					className="btn-accent"
					onClick={handleSave}
					size="large"
					pill
					disabled={saving}
				>
					{saving ? "Saving..." : "Save"}
				</SlButton>
			</div>
		</div>
	);
};

export default ProfilePage;
