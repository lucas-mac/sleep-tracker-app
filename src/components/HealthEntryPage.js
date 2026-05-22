// illnesses [cold, fever, etc.], medications, temperature, etc.
import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {setDoc, doc, Timestamp, updateDoc, getDoc, deleteDoc} from "firebase/firestore";
import {useActiveChild} from "./ActiveChildContext";
import {LayoutGrid} from "lucide-react";
import {ulid} from "ulid";
import {db} from "../firebase";
import {toTitleCase} from "../utils/format";
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

const HealthEntryPage = () => {
	const {entryId} = useParams();
	const initialDateTime = getInitialDateTime();
	const [type, setType] = useState("medication");
	const [date, setDate] = useState(initialDateTime.date);
	const [time, setTime] = useState(initialDateTime.time);
	const [temperature, setTemperature] = useState(null);
	const [temperatureUnit, setTemperatureUnit] = useState("C");
	const [amount, setAmount] = useState("");
	const [amountUnit, setAmountUnit] = useState("ml");
	const [medicationName, setMedicationName] = useState("");
	const [note, setNote] = useState("");
	const navigate = useNavigate();
	const {activeChild, activeChildId} = useActiveChild();

	const handleDelete = () => {
		// Implement delete functionality here
		console.log("Delete entry with ID:", entryId);
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
			temperature: type === "temperature" ? temperature : null,
			temperature_unit: type === "temperature" ? temperatureUnit : null,
			amount: type === "medication" ? amount : null,
			amount_unit: type === "medication" ? amountUnit : null,
			medication_name: type === "medication" ? medicationName : null,
			note,
		};

		try {
			if (entryId) {
				const entryRef = doc(db, "health", entryId);
				await updateDoc(entryRef, payload);
			} else {
				const id = ulid();
				await setDoc(doc(db, "health", id), payload);
			}

			navigate("/");
		} catch (error) {
			console.error("Error saving health entry:", error);
			await showToast("Could not save health entry. Please try again.", "danger");
		}
	};

	const handleCancel = () => {
		navigate(-1);
	};

	useEffect(() => {
		const fetchEntry = async () => {
			if (!entryId) return;
			const docRef = doc(db, "health", entryId);
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
				setType(data.type);
				setTemperature(data.temperature || null);
				setTemperatureUnit(data.temperature_unit || "C");
				setAmount(data.amount || "");
				setAmountUnit(data.amount_unit || "ml");
				setMedicationName(data.medication_name || "");
			}
		};
		fetchEntry();
	}, [entryId]);

	return (
		<div className="page">
			<Header
				activePage="health"
				title={entryId ? "Edit Health Entry" : "Add Health Entry"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/health/`}>
						{activeChild ? activeChild.nickname + "'s " : ""}Health
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/health/${entryId}`}>
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
				>
					<WaOption value="medication">Medication</WaOption>
					<WaOption value="temperature">Temperature</WaOption>
				</WaSelect>
				{type === "temperature" && (
					<div className="elem-group gap-xl flex-wrap">
						<WaNumberInput
							label="Temperature (°C)"
							value={temperature || ""}
							onChange={(e) => setTemperature(e.target.value)}
							min="30"
							max="45"
							step="0.1"
						/>
						<WaSelect
							label="Unit"
							value={temperatureUnit}
							onChange={(e) => setTemperatureUnit(e.target.value)}
						>
							<WaOption value="C">°C</WaOption>
							<WaOption value="F">°F</WaOption>
						</WaSelect>
					</div>
				)}
				{type === "medication" && (
					<div className="elem-group gap-xl flex-wrap">
						<WaInput
							label="Medication Name"
							value={toTitleCase(medicationName)}
							onInput={(e) => setMedicationName(e.target.value)}
							maxLength="100"
							className="full-width"
						/>
						<WaNumberInput
							label="Amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							min="0"
						/>
						<WaSelect
							label="Unit"
							value={amountUnit}
							onChange={(e) => setAmountUnit(e.target.value)}
						>
							<WaOption value="ml">ml</WaOption>
							<WaOption value="tsp">tsp</WaOption>
							<WaOption value="mg">mg</WaOption>
							<WaOption value="pills">pills</WaOption>
						</WaSelect>
					</div>
				)}
				<WaTextarea
					label="Note"
					placeholder="Add any notes about this health entry..."
					value={note}
					onInput={(e) => setNote(e.target.value)}
					hint="e.g. 'Gave 5ml of Tylenol for fever', 'Temperature was taken rectally', etc."
					size="large"
					resize="auto"
					rows="2"
					// with-count
					maxlength="100"
					className="full-width"
				/>
			</div>
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
	);
};

export default HealthEntryPage;
