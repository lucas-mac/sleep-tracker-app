import {useState, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {doc, setDoc, getDoc} from "firebase/firestore";
import {db, auth} from "../firebase";
import {ulid} from "ulid";

import WaInput from "@web.awesome.me/webawesome-pro/dist/react/input";
import WaSelect from "@web.awesome.me/webawesome-pro/dist/react/select";
import WaOption from "@web.awesome.me/webawesome-pro/dist/react/option";
import WaButton from "@web.awesome.me/webawesome-pro/dist/react/button";
import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import WaColorPicker from "@web.awesome.me/webawesome-pro/dist/react/color-picker";
import WaBreadcrumb from "@web.awesome.me/webawesome-pro/dist/react/breadcrumb";
import WaBreadcrumbItem from "@web.awesome.me/webawesome-pro/dist/react/breadcrumb-item";

import {House} from "lucide-react";

import IconSelector from "./IconSelector";

const ChildPage = () => {
	const {childId} = useParams();

	const [nickname, setNickname] = useState("");
	const [birthMonth, setBirthMonth] = useState("");
	const [birthYear, setBirthYear] = useState("");
	const [gender, setGender] = useState("");
	const [guardian, setGuardian] = useState("");
	const [guardianId, setGuardianId] = useState("");
	const [avatarIcon, setAvatarIcon] = useState("");
	const [avatarColor, setAvatarColor] = useState("");
	const [sharedUsers, setSharedUsers] = useState([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const birthYears = Array.from({length: 18}, (_, i) => new Date().getFullYear() - i);

	useEffect(() => {
		const fetchChildData = async () => {
			if (!childId) {
				setLoading(false);
				return;
			}
			const user = auth.currentUser;
			if (user) {
				const childDoc = await getDoc(doc(db, "child", childId));
				if (
					childDoc.exists() &&
					(childDoc.data().guardian === user.uid ||
						(childDoc.data().shared_with &&
							childDoc.data().shared_with.includes(user.uid)))
				) {
					const data = childDoc.data();
					setNickname(data.nickname || "");
					setBirthMonth(data.birth_month || "");
					setBirthYear(data.birth_year || "");
					setGender(data.gender || "");
					setAvatarIcon(data.avatar_icon || "");
					setAvatarColor(data.avatar_color || "");
					setGuardianId(data.guardian || "");

					const guardianDoc = await getDoc(doc(db, "user", data.guardian));
					if (guardianDoc.exists()) {
						const guardianData = guardianDoc.data();
						setGuardian(guardianData.firstName + " " + guardianData.lastName);
					}

					const sharedWith = data.shared_with || [];
					if (sharedWith.length > 0) {
						const sharedUsersQuery = query(
							collection(db, "user"),
							where("uid", "in", sharedWith),
						);
						const querySnapshot = await getDocs(sharedUsersQuery);
						const sharedUsers = [];
						querySnapshot.forEach((doc) => {
							const userData = doc.data();
							sharedUsers.push(userData.firstName + " " + userData.lastName);
						});
						setSharedUsers(sharedUsers);
					}
				} else {
					console.log("No such document!");
					// TODO: display error message that the user doesn't have access to this child profile, and redirect back to profile page after a few seconds
				}
			}
			setLoading(false);
		};
		fetchChildData();
	}, [childId]);

	const handleSave = async () => {
		const user = auth.currentUser;
		if (user) {
			setSaving(true);
			const docId = childId || ulid(); // You can generate this ID as needed
			await setDoc(doc(db, "child", docId), {
				nickname: nickname || "",
				birth_month: birthMonth || "",
				birth_year: birthYear || "",
				gender: gender || "",
				avatar_icon: avatarIcon,
				avatar_color: avatarColor || "",
				guardian: user.uid,
			});
			setSaving(false);

			const toast = document.querySelector("wa-toast");
			toast.placement = "top-center";
			await toast.create("Child profile saved", {
				variant: "success",
			});

			// history.back();
			location.href = "/profile#children";
		}
	};

	return (
		<div className="child-page page">
			<div className="page-meta">
				<h1>Child Profile</h1>
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href="/profile">Profile</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/child/${childId}`}>Child</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaInput
					label="Nickname"
					name="nickname"
					placeholder="Johnny"
					size="large"
					type="text"
					// ref={nicknameRef}
					value={nickname}
					onChange={(e) => setNickname(e.target.value)}
				></WaInput>
				<div className="elem-group gap-x">
					<WaSelect
						label="Birth Month"
						name="birth_month"
						placeholder="January"
						size="large"
						type="text"
						value={birthMonth}
						onChange={(e) => setBirthMonth(e.target.value)}
					>
						<WaOption value="Jan">January</WaOption>
						<WaOption value="Feb">February</WaOption>
						<WaOption value="Mar">March</WaOption>
						<WaOption value="Apr">April</WaOption>
						<WaOption value="May">May</WaOption>
						<WaOption value="Jun">June</WaOption>
						<WaOption value="Jul">July</WaOption>
						<WaOption value="Aug">August</WaOption>
						<WaOption value="Sep">September</WaOption>
						<WaOption value="Oct">October</WaOption>
						<WaOption value="Nov">November</WaOption>
						<WaOption value="Dec">December</WaOption>
					</WaSelect>
					<WaSelect
						label="Birth Year"
						name="birth_year"
						size="large"
						value={birthYear}
						onChange={(e) => setBirthYear(e.target.value)}
					>
						{birthYears.map((year) => (
							<WaOption
								key={year}
								value={year}
							>
								{year}
							</WaOption>
						))}
					</WaSelect>
				</div>
				<WaSelect
					label="Gender"
					name="gender"
					size="large"
					value={gender}
					onChange={(e) => setGender(e.target.value)}
				>
					<WaOption value="Male">Male</WaOption>
					<WaOption value="Female">Female</WaOption>
					<WaOption value="Unset">Prefer Not To Say</WaOption>
				</WaSelect>
				<div class="elem-group gap-lg full-width justify-between">
					<WaColorPicker
						label="Avatar Color"
						name="avatar_color"
						hint="Choose a color for your child's avatar"
						value={avatarColor}
						onChange={(e) => setAvatarColor(e.target.value)}
						size="large"
						format="hex"
						round
					></WaColorPicker>
					<div className="avatar-preview">
						<div
							className="avatar avatar-lg"
							style={{backgroundColor: avatarColor}}
						>
							<WaIcon
								family="default"
								name={avatarIcon}
								size="large"
								color={avatarColor}
							/>
						</div>
					</div>
				</div>

				<IconSelector
					avatarColor={avatarColor}
					value={avatarIcon}
					onChange={(icon) => setAvatarIcon(icon)}
				/>

				<label class="large">Permissions</label>
				<div class="table-scroll-wrapper">
					<table class="scroll">
						<thead>
							<tr>
								<th>Name</th>
								<th>Role</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{guardian && (
								<tr>
									<td>
										{guardian}
										{auth.currentUser.uid === guardianId && " (You)"}
									</td>
									<td>Owner</td>
									<td>
										<WaButton
											className="btn-gloss"
											size="small"
											pill
											disabled
										>
											Revoke
										</WaButton>
									</td>
								</tr>
							)}
							{sharedUsers && sharedUsers.length > 0 ? (
								sharedUsers.map((user, index) => (
									<tr key={index}>
										<td>
											{user}
											{auth.currentUser.uid === user.id && " (You)"}
										</td>
										<td>Viewer</td>
										<td>
											<WaButton
												className="btn-gloss"
												size="small"
												pill
											>
												Revoke
											</WaButton>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="3">Not shared with anyone</td>
								</tr>
							)}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan="3">
									<WaButton
										className="btn-outline"
										size="small"
										pill
										href={`/share/${childId}`}
									>
										Share with someone
									</WaButton>
								</td>
							</tr>
						</tfoot>
					</table>
				</div>

				<div className="elem-group gap-sm">
					<WaButton
						size="large"
						onClick={handleSave}
						className="btn-accent"
						pill
						disabled={saving}
					>
						{saving ? "Saving..." : "Save"}
					</WaButton>
					<WaButton
						className="btn-gloss"
						size="large"
						onClick={() => (location.href = "/profile#children")}
						pill
					>
						Cancel
					</WaButton>
				</div>
			</div>
		</div>
	);
};

export default ChildPage;
