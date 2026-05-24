import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useActiveChild} from "./ActiveChildContext";
import {setDoc, doc, Timestamp, updateDoc, getDoc, deleteDoc} from "firebase/firestore";
import {ulid} from "ulid";
import {db} from "../firebase";
import {LayoutGrid} from "lucide-react";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaInput,
	WaSelect,
	WaOption,
	WaTextarea,
	WaButton,
	WaNumberInput,
} from "@web.awesome.me/webawesome-pro/dist/react";

import Header from "./Header";

const getInitialDateTime = () => {
	const now = new Date();
	const pad = (value) => String(value).padStart(2, "0");
	const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
	return {date, time};
};

const FeedEntryPage = () => {
	const {entryId} = useParams();
	const initialDateTime = getInitialDateTime();
	const [type, setType] = useState("breast");
	const [date, setDate] = useState(initialDateTime.date);
	const [time, setTime] = useState(initialDateTime.time);
	const [duration, setDuration] = useState("");
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");
	const navigate = useNavigate();

    const {activeChild, activeChildId} = useActiveChild();

	const showToast = async (message, variant = "neutral") => {
		const toast = document.querySelector("wa-toast");
		if (!toast) return;
		toast.placement = "top-center";
		await toast.create(message, {variant});
	};

	const handleSave = async () => {
		if (!activeChildId) {
			await showToast("Please select a child before saving.", "warning");
			return;
		}

		const timestamp = Timestamp.fromDate(new Date(`${date}T${time}:00`));
		const payload = {
			child_id: activeChildId,
			type,
			timestamp,
			duration: type === "breast" ? duration : null,
			amount: type === "bottle" ? amount : null,
			note,
		};

		try {
			if (entryId) {
				const entryRef = doc(db, "feed", entryId);
				await updateDoc(entryRef, payload);
			} else {
				const id = ulid();
				await setDoc(doc(db, "feed", id), payload);
			}

			navigate(-1);
		} catch (error) {
			console.error("Error saving feed entry:", error);
			await showToast("Could not save feed entry. Please try again.", "danger");
		}
	};
    const handleCancel = () => navigate(-1);
    
    const handleDelete = async () => {
		if (!entryId) return;
		if (confirm("Are you sure you want to delete this entry?")) {
			try {
				await deleteDoc(doc(db, "feed", entryId));
				navigate(-1);
			} catch (error) {
				console.error("Error deleting feed entry:", error);
				await showToast("Could not delete feed entry. Please try again.", "danger");
			}
		}
	};

	useEffect(() => {
		const fetchEntry = async () => {
			if (!entryId) return;
			const docRef = doc(db, "feed", entryId);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				// Convert Firestore Timestamp to local date and time strings
				if (data.timestamp) {
					const startDateObj = new Date(data.timestamp.seconds * 1000);
					setDate(
						startDateObj.getFullYear() +
							"-" +
							String(startDateObj.getMonth() + 1).padStart(2, "0") +
							"-" +
							String(startDateObj.getDate()).padStart(2, "0"),
					);
					setTime(
						String(startDateObj.getHours()).padStart(2, "0") +
							":" +
							String(startDateObj.getMinutes()).padStart(2, "0"),
					);
				}
				setNote(data.note || "");
				setType(data.type || "breast");
				setDuration(data.duration || "");
				setAmount(data.amount || "");
			}
		};
		fetchEntry();
	}, [entryId]);

	return (
		<div className="page">
			<Header
				activePage="feed"
				title={entryId ? "Edit Feed" : "Add Feed"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/feed-history/`}>
						{activeChild ? activeChild.nickname + "'s " : ""}Feeds
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/feed/${entryId}`}>
						{entryId ? "Edit" : "Add"}
					</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<div className="elem-group gap-md flex-wrap">
					<WaInput
						className="timer-date"
						label="Date"
						type="date"
						name="date"
						placeholder="Enter date"
						value={date}
						size="large"
						onInput={(e) => setDate(e.target.value)}
					></WaInput>
					<WaInput
						className="timer-time"
						label="Time"
						type="time"
						name="time"
						placeholder=""
						value={time}
						size="large"
						onInput={(e) => setTime(e.target.value)}
					/>
				</div>
				<WaSelect
					label="Type"
					value={type}
					onChange={(e) => setType(e.target.value)}
					size="large"
					className="full-width"
				>
					<WaOption value="breast">Breast</WaOption>
					<WaOption value="bottle">Bottle</WaOption>
				</WaSelect>

				{(type === "bottle" && (
					<WaNumberInput
						label="Amount (ml)"
						value={amount}
						onInput={(e) => setAmount(e.target.value)}
						size="large"
						className="full-width"
					/>
				)) || (
					<WaNumberInput
						label="Duration (mins)"
						value={duration}
						onInput={(e) => setDuration(e.target.value)}
						size="large"
						className="full-width"
					/>
				)}

				<WaTextarea
					label="Note"
					placeholder="Add any notes about this feeding..."
					value={note}
					onInput={(e) => setNote(e.target.value)}
					hint="e.g. 'Baby seemed fussy during feeding', 'Baby fed for a long time', etc."
					size="large"
					resize="auto"
					rows="2"
					// with-count
					maxlength="100"
					className="full-width"
				/>
				<div className="page-footer">
					<div className="elem-group gap-sm">
						<WaButton
							className="btn-accent"
							onClick={handleSave}
							size="large"
							pill
						>
							Save
						</WaButton>
						<WaButton
							className="btn-gloss"
							onClick={handleCancel}
							size="large"
							pill
						>
							Cancel
						</WaButton>
					</div>
					{entryId && (
						<WaButton
							className="btn-outline"
							onClick={handleDelete}
							size="large"
							pill
						>
							Delete
						</WaButton>
					)}
				</div>
			</div>
		</div>
	);
};

export default FeedEntryPage;
