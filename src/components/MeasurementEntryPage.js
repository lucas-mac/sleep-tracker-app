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

const MeasurementEntryPage = () => {
	const {entryId} = useParams();
	const initialDateTime = getInitialDateTime();
	const [date, setDate] = useState(initialDateTime.date);
	const [height, setHeight] = useState("");
	const [weightLbs, setWeightLbs] = useState("");
	const [weightOz, setWeightOz] = useState("");
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

		const timestamp = Timestamp.fromDate(new Date(`${date}T00:00:00`));
		const payload = {
			child_id: activeChildId,
			timestamp,
			height,
			weightLbs,
			weightOz,
			note,
		};

		try {
			if (entryId) {
				const entryRef = doc(db, "measurement", entryId);
				await updateDoc(entryRef, payload);
			} else {
				const id = ulid();
				await setDoc(doc(db, "measurement", id), payload);
			}

			navigate("/");
		} catch (error) {
			console.error("Error saving measurement entry:", error);
			await showToast("Could not save measurement entry. Please try again.", "danger");
		}
	};
	const handleCancel = () => navigate(-1);

	const handleDelete = async () => {
		if (!entryId) return;
		if (confirm("Are you sure you want to delete this entry?")) {
			try {
				await deleteDoc(doc(db, "measurement", entryId));
				navigate(-1);
			} catch (error) {
				console.error("Error deleting measurement entry:", error);
				await showToast("Could not delete measurement entry. Please try again.", "danger");
			}
		}
	};

	useEffect(() => {
		const fetchEntry = async () => {
			if (!entryId) return;
			const docRef = doc(db, "measurement", entryId);
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
				}
				setNote(data.note || "");
				setHeight(data.height || "");
				setWeightLbs(data.weightLbs || "");
				setWeightOz(data.weightOz || "");
			}
		};
		fetchEntry();
	}, [entryId]);

	return (
		<div className="page">
			<Header
				activePage="measurement"
				title={entryId ? "Edit Measurement" : "Add Measurement"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/measurements/`}>
						{activeChild ? activeChild.nickname + "'s " : ""}Measurements
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/measurement/${entryId}`}>
						{entryId ? "Edit Measurement" : "Add Measurement"}
					</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaInput
					className=""
					label="Date"
					type="date"
					name="date"
					placeholder="Enter date"
					value={date}
					size="large"
					onInput={(e) => setDate(e.target.value)}
				></WaInput>

				<div className="elem-group gap-xl flex-wrap full-width">
					<WaNumberInput
						label="Weight (lbs)"
						value={weightLbs}
						onInput={(e) => setWeightLbs(e.target.value)}
						size="large"
						className="full-width"
						max="200"
						min="0"
					/>
					<WaNumberInput
						label="Weight (oz)"
						value={weightOz}
						onInput={(e) => setWeightOz(e.target.value)}
						size="large"
						max="14"
						min="0"
					/>
				</div>

				<WaNumberInput
					label="Height (in)"
					value={height}
					onInput={(e) => setHeight(e.target.value)}
					size="large"
					step="0.5"
					min="0"
					max="96"
					className="full-width"
				/>

				<WaTextarea
					label="Note"
					placeholder="Add any notes about this measurement..."
					value={note}
					onInput={(e) => setNote(e.target.value)}
					hint="e.g. 'Baby seemed fussy during measurement', 'Baby measured for a long time', etc."
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

export default MeasurementEntryPage;
