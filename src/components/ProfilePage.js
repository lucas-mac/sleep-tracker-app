import {useState, useEffect} from "react";
import {doc, getDoc, getDocs, updateDoc, query, where, collection} from "firebase/firestore";
import {db, auth} from "../firebase";
import "./Login.css";

import WaInput from "@web.awesome.me/webawesome-pro/dist/react/input";
import WaButton from "@web.awesome.me/webawesome-pro/dist/react/button";

import WaTab from "@web.awesome.me/webawesome-pro/dist/react/tab";
import WaTabGroup from "@web.awesome.me/webawesome-pro/dist/react/tab-group";
import WaTabPanel from "@web.awesome.me/webawesome-pro/dist/react/tab-panel";
import WaSpinner from "@web.awesome.me/webawesome-pro/dist/react/spinner";
import WaTooltip from "@web.awesome.me/webawesome-pro/dist/react/tooltip";
import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import WaBreadcrumb from "@web.awesome.me/webawesome-pro/dist/react/breadcrumb";
import WaBreadcrumbItem from "@web.awesome.me/webawesome-pro/dist/react/breadcrumb-item";

import {MainMenu} from "./Menu";
import {House, LogOut} from "lucide-react";

import "./ProfilePage.css";

const ProfilePage = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [children, setChildren] = useState([]);
	const [activeTab, setActiveTab] = useState("user");

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
		const fetchChildData = async () => {
			const user = auth.currentUser;
			if (user) {
				const q = query(collection(db, "child"), where("guardian", "==", user.uid));
				const querySnapshot = await getDocs(q);
				const childrenData = [];
				querySnapshot.forEach((doc) => {
					childrenData.push({id: doc.id, ...doc.data()});
				});
				setChildren(childrenData);
			}
		};
		fetchChildData();
	}, []);

	useEffect(() => {
		const location = window.location;
		const hash = location.hash;
		const tab = hash ? hash.split("#")[1] : "user";
		setActiveTab(tab);
	}, []);

	const handleUserSave = async () => {
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
		return (
			<div className="column align-center">
				<WaSpinner className="spinner-accent" />
			</div>
		);
	}

	return (
		<div className="profile-page page">
			<div className="page-meta">
				<div className="elem-group gap-lg justify-between align-center">
					<h1>Profile</h1>
					<MainMenu activePage="profile" />
				</div>
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href="/profile">Profile</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<WaTabGroup>
				<WaTab
					slot="nav"
					panel="user"
					active={activeTab === "user"}
				>
					User
				</WaTab>
				<WaTab
					slot="nav"
					panel="children"
					active={activeTab === "children"}
				>
					Children
				</WaTab>
				<WaTabPanel
					name="user"
					active={activeTab === "user"}
				>
					<div className="page-content">
						<WaInput
							label="First Name"
							name="first_name"
							placeholder="John"
							size="large"
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						></WaInput>

						<WaInput
							label="Last Name"
							name="last_name"
							placeholder="Doe"
							size="large"
							type="text"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						></WaInput>

						<WaInput
							label="Email"
							name="email"
							size="large"
							type="email"
							value={email}
							className="full-width"
							readOnly
						></WaInput>

						<div className="elem-group gap-sm">
							<WaButton
								className="btn-accent"
								onClick={handleUserSave}
								size="large"
								pill
								disabled={saving}
							>
								{saving ? "Saving..." : "Save"}
							</WaButton>
							<WaButton
								className="btn-gloss"
								size="large"
								onClick={() => (location.href = "/")}
								pill
							>
								Cancel
							</WaButton>
						</div>
						<WaButton
							label="Logout"
							className="btn-outline"
							size="medium"
							onClick={() => {
								auth.signOut();
								location.href = "/";
							}}
						>
							Logout
							<LogOut
								size={18}
								className="icon-gloss"
								slot="end"
							/>
						</WaButton>
					</div>
				</WaTabPanel>
				<WaTabPanel
					name="children"
					active={activeTab === "children"}
				>
					<div className="page-content">
						<WaButton
							className="btn-accent"
							size="large"
							pill
							href="/child"
						>
							Add Child
						</WaButton>

						<div className="children-wrapper column align-start gap-md full-width">
							{children.length === 0 ? (
								<p>No children added yet.</p>
							) : (
								children.map((child) => (
									<div
										key={child.id}
										className="child-card full-width"
									>
										<div
											className="avatar"
											style={{backgroundColor: child.avatar_color}}
										>
											<WaIcon
												family="default"
												name={child.avatar_icon}
												size="small"
												color={child.avatar_color}
											/>
										</div>
										<div>
											<h3>{child.nickname}</h3>
											<p>
												{child.gender} • {child.birth_month},{" "}
												{child.birth_year}
											</p>
										</div>
										<div className="elem-group gap-sm justify-start">
											<WaButton
												className="btn-gloss"
												size="small"
												pill
												href={`/child/${child.id}`}
											>
												Edit
											</WaButton>
										</div>
									</div>
								))
							)}
						</div>

						<table
							className="children-list"
							style={{display: "none"}}
						>
							<thead>
								<tr>
									<th>Nickname</th>
									<th>Birth Month</th>
									<th>Birth Year</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{children.length === 0 ? (
									<tr>
										<td colSpan="4">No children added yet.</td>
									</tr>
								) : (
									children.map((child) => (
										<tr
											key={child.id}
											className="child-card"
										>
											<td>{child.nickname}</td>
											<td>{child.birth_month}</td>
											<td>{child.birth_year}</td>
											<td>
												<div className="elem-group gap-sm justify-start">
													<WaButton
														className="btn-gloss"
														size="small"
														pill
														href={`/child/${child.id}`}
													>
														Edit
													</WaButton>
													<WaButton
														className="btn-gloss"
														size="small"
														pill
													>
														Share
													</WaButton>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</WaTabPanel>
			</WaTabGroup>
		</div>
	);
};

export default ProfilePage;
