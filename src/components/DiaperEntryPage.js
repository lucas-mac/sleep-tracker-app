import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useActiveChild} from "./ActiveChildContext";
import {setDoc, doc, Timestamp, updateDoc, getDoc, deleteDoc} from "firebase/firestore";
import {ulid} from "ulid";
import {db} from "../firebase";
import {House} from "lucide-react";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaInput,
	WaSelect,
	WaOption,
	WaTextarea,
	WaButton,
} from "@web.awesome.me/webawesome-pro/dist/react";

import Header from "./Header";

const getInitialDateTime = () => {
	const now = new Date();
	const pad = (value) => String(value).padStart(2, "0");
	const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
	return {date, time};
};

const DiaperEntryPage = () => {
	const {entryId} = useParams();
	const initialDateTime = getInitialDateTime();
	const [type, setType] = useState("pee");
	const [date, setDate] = useState(initialDateTime.date);
	const [time, setTime] = useState(initialDateTime.time);
	const [consistency, setConsistency] = useState("normal");
	const [colour, setColour] = useState("brown");
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
			consistency: type !== "pee" ? consistency : null,
			colour: type !== "pee" ? colour : null,
			note,
		};

		try {
			if (entryId) {
				const entryRef = doc(db, "diaper", entryId);
				await updateDoc(entryRef, payload);
			} else {
				const id = ulid();
				await setDoc(doc(db, "diaper", id), payload);
			}

			navigate("/");
		} catch (error) {
			console.error("Error saving diaper entry:", error);
			await showToast("Could not save diaper entry. Please try again.", "danger");
		}
	};
    const handleCancel = () => navigate(-1);
    
    const handleDelete = async () => {
		if (!entryId) return;
		if (confirm("Are you sure you want to delete this entry?")) {
			try {
				await deleteDoc(doc(db, "diaper", entryId));
				navigate(-1);
			} catch (error) {
				console.error("Error deleting diaper entry:", error);
				await showToast("Could not delete diaper entry. Please try again.", "danger");
			}
		}
	};

	useEffect(() => {
		const fetchEntry = async () => {
			if (!entryId) return;
			const docRef = doc(db, "diaper", entryId);
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
				setType(data.type || "pee");
				setConsistency(data.consistency || "normal");
				setColour(data.colour || "brown");
			}
		};
		fetchEntry();
	}, [entryId]);

	return (
		<div className="page">
			<Header
				activePage="diaper"
				title={entryId ? "Edit Diaper" : "Add Diaper"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/diapers/`}>
						{activeChild ? activeChild.nickname + "'s " : ""}Diapers
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/diaper/${entryId}`}>
						{entryId ? "Edit Diaper" : "Add Diaper"}
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
					<WaOption value="pee">Pee</WaOption>
					<WaOption value="poop">Poop</WaOption>
					<WaOption value="both">Both</WaOption>
				</WaSelect>
				{type !== "pee" && (
					<div className="elem-group gap-xl flex-wrap">
						<WaSelect
							label="Consistency"
							value={consistency}
							onChange={(e) => setConsistency(e.target.value)}
							size="large"
							className="full-width"
						>
							<WaOption value="diarrhea">Diarrhea</WaOption>
							<WaOption value="watery">Watery</WaOption>
							<WaOption value="seedy">Seedy</WaOption>
							<WaOption value="normal">Normal</WaOption>
							<WaOption value="hard">Hard</WaOption>
						</WaSelect>
						<WaSelect
							label="Colour"
							value={colour}
							onChange={(e) => setColour(e.target.value)}
							size="large"
							className="full-width"
						>
							<WaOption value="brown">Brown</WaOption>
							<WaOption value="grey">Grey</WaOption>
							<WaOption value="green">Green</WaOption>
							<WaOption value="yellow">Yellow</WaOption>
							<WaOption value="red">Red</WaOption>
						</WaSelect>
					</div>
				)}
				<WaTextarea
					label="Note"
					placeholder="Add any notes about this diaper change..."
					value={note}
					onInput={(e) => setNote(e.target.value)}
					hint="e.g. 'Had diarrhea after trying new formula', 'Poop was green and seedy', etc."
					size="large"
					resize="auto"
					rows="2"
					// with-count
					maxlength="100"
					className="full-width"
				/>
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

export default DiaperEntryPage;
