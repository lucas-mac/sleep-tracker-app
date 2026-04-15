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

	const nicknameRef = useRef();
	const birthMonthRef = useRef();
	const birthYearRef = useRef();
	const genderRef = useRef();
    const avatarColorRef = useRef();
    const guardianRef = useRef();

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
						// You can set this sharedUsers array to state if you want to display it
					}
				} else {
					console.log("No such document!");
				}
			}
			setLoading(false);
		};
		fetchChildData();
	}, [childId]);

	useEffect(() => {
		if (!loading) {
			if (nicknameRef.current) nicknameRef.current.value = nickname;
			if (birthMonthRef.current) birthMonthRef.current.value = birthMonth;
			if (birthYearRef.current) birthYearRef.current.value = birthYear;
			if (genderRef.current) genderRef.current.value = gender;
			if (avatarColorRef.current) avatarColorRef.current.value = avatarColor;
			if (guardianRef.current) guardianRef.current.value = guardian;
		}
	}, [loading, nickname, birthMonth, birthYear, gender, avatarColor, guardian]);

	const handleSave = async () => {
		const user = auth.currentUser;
		if (user) {
			setSaving(true);
			const docId = childId || ulid(); // You can generate this ID as needed
			await setDoc(doc(db, "child", docId), {
				nickname: nicknameRef.current?.value || "",
				birth_month: birthMonthRef.current?.value || "",
				birth_year: birthYearRef.current?.value || "",
				gender: genderRef.current?.value || "",
				avatar_icon: avatarIcon,
				avatar_color: avatarColorRef.current?.value || "",
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
			<h1>Child Profile</h1>
			<div className="elem-group column gap-xl align-start">
				<WaInput
					label="Nickname"
					name="nickname"
					placeholder="Johnny"
					size="large"
					type="text"
					ref={nicknameRef}
				></WaInput>
				<div className="elem-group gap-x">
					<WaSelect
						label="Birth Month"
						name="birth_month"
						placeholder="January"
						size="large"
						type="text"
						ref={birthMonthRef}
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
						ref={birthYearRef}
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
					ref={genderRef}
				>
					<WaOption value="male">Male</WaOption>
					<WaOption value="female">Female</WaOption>
					<WaOption value="unset">Prefer Not To Say</WaOption>
				</WaSelect>
				<div class="elem-group gap-lg full-width justify-between">
					<WaColorPicker
						label="Avatar Color"
						name="avatar_color"
						hint="Choose a color for your child's avatar"
						ref={avatarColorRef}
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
				<table>
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

				<WaButton
					size="large"
					onClick={handleSave}
					className="btn-accent"
					pill
					disabled={saving}
				>
					{saving ? "Saving..." : "Save"}
				</WaButton>
			</div>
		</div>
	);
};

export default ChildPage;
