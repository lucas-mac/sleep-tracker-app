import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useActiveChild} from "./ActiveChildContext";
import {setDoc, doc, Timestamp, updateDoc, getDoc, deleteDoc} from "firebase/firestore";
import {ulid} from "ulid";
import {db} from "../firebase";
import {requireEntryAccess} from "../utils/childAccess";
import {showToast} from "../utils/toast";
import {LayoutGrid} from "lucide-react";
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

	const {activeChild, activeChildId, children, selectChild, loadingChildren} = useActiveChild();

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
				const entrySnap = await getDoc(entryRef);
				const canAccess = await requireEntryAccess({
					entrySnap,
					children,
					showToast,
					navigate,
					redirectTo: "/diaper-history",
				});
				if (!canAccess) {
					return;
				}
				await updateDoc(entryRef, payload);
			} else {
				const id = ulid();
				await setDoc(doc(db, "diaper", id), payload);
			}

			navigate("/diaper-history");
		} catch (error) {
			console.error("Error saving diaper entry:", error);
			await showToast("Could not save diaper entry. Please try again.", "danger");
		}
	};
    const handleCancel = () => navigate("/diaper-history");
    
    const handleDelete = async () => {
		if (!entryId) return;
		if (confirm("Are you sure you want to delete this entry?")) {
			try {
				const entryRef = doc(db, "diaper", entryId);
				const entrySnap = await getDoc(entryRef);
				const canAccess = await requireEntryAccess({
					entrySnap,
					children,
					showToast,
					navigate,
					redirectTo: "/diaper-history",
				});
				if (!canAccess) {
					return;
				}
				await deleteDoc(entryRef);
				navigate("/diaper-history");
			} catch (error) {
				console.error("Error deleting diaper entry:", error);
				await showToast("Could not delete diaper entry. Please try again.", "danger");
			}
		}
	};

	useEffect(() => {
		const fetchEntry = async () => {
			if (loadingChildren) return;
			if (!entryId) return;
			const docRef = doc(db, "diaper", entryId);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const canAccess = await requireEntryAccess({
					entrySnap: docSnap,
					children,
					showToast,
					navigate,
					redirectTo: "/diaper-history",
					selectChild,
					activeChildId,
					syncActiveChild: true,
				});
				if (!canAccess) {
					return;
				}
				const data = docSnap.data();
				// Convert Firestore Timestamp to local date and time strings
				if (data.timestamp) {
					const startDateObj = new Date(data.timestamp.seconds * 1000);
					setDate(startDateObj.getFullYear() + "-" + String(startDateObj.getMonth() + 1).padStart(2, "0") + "-" + String(startDateObj.getDate()).padStart(2, "0"));
					setTime(String(startDateObj.getHours()).padStart(2, "0") + ":" + String(startDateObj.getMinutes()).padStart(2, "0"));
				}
				setNote(data.note || "");
				setType(data.type || "pee");
				setConsistency(data.consistency || "normal");
				setColour(data.colour || "brown");
			}
		};
		fetchEntry();
	}, [entryId, children, loadingChildren]);

	return (
		<div className="page">
			<Header
				activePage="diaper"
				title={entryId ? "Edit Diaper" : "Add Diaper"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/diaper-history/`}>
						{activeChild ? activeChild.nickname + "'s " : ""}Diapers
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/diaper/${entryId}`}>
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
					<WaOption value="pee">Pee</WaOption>
					<WaOption value="poop">Poop</WaOption>
					<WaOption value="both">Pee and Poop</WaOption>
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
							<WaOption value="sticky">Sticky</WaOption>
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
							<WaOption value="black">Black</WaOption>
							<WaOption value="brown">Brown</WaOption>
							<WaOption value="tan">Tan</WaOption>
							<WaOption value="clay">Clay</WaOption>
							<WaOption value="green">Green</WaOption>
							<WaOption value="yellow">Yellow</WaOption>
							<WaOption value="orange">Orange</WaOption>
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
				<div className="page-footer">
					<div class="elem-group gap-sm">
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
							size="large"
							onClick={handleDelete}
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
