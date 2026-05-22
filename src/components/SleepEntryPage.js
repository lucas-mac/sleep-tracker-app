// TODO: change file name to SleepEntryPage or something more generic, since this will also be used for creating new entries (just with empty fields at the start)
// TODO: add note field and ability to add wake events
// TODO: use ulid for entry IDs instead of Firestore's auto-generated IDs, to make it easier to create new entries on the client side before saving to Firestore

import React, {useState, useEffect} from "react";
import {doc, getDoc, setDoc, updateDoc, Timestamp} from "firebase/firestore";
import {db} from "../firebase";
import {useParams, useNavigate} from "react-router-dom";
import {ulid} from "ulid";
import {useActiveChild} from "./ActiveChildContext";
import Header from "./Header";
import {
	WaSwitch,
	WaButton,
	WaInput,
	WaTextarea,
	WaBreadcrumb,
	WaBreadcrumbItem,
} from "@web.awesome.me/webawesome-pro/dist/react";
import "./SleepPage.css"; // Import your CSS styles

import {LayoutGrid} from "lucide-react";

const SleepEntryPage = () => {
	const {entryId} = useParams();
	const navigate = useNavigate();
	const [startDate, setStartDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endDate, setEndDate] = useState("");
	const [endTime, setEndTime] = useState("");
	const [note, setNote] = useState("");
	const [isOngoing, setIsOngoing] = useState(false);
	const {activeChildId} = useActiveChild();

	const handleSave = async () => {
		if (!entryId) {
			const data = {
				child_id: activeChildId,
				start: Timestamp.fromDate(new Date(`${startDate}T${startTime}`)),
				end: !isOngoing ? Timestamp.fromDate(new Date(`${endDate}T${endTime}`)) : null,
				note: note, // TODO: add note field to the form
			};
			try {
				await setDoc(doc(db, "sleep", ulid()), data);
				console.log("Entry created successfully");
				navigate(`/`); // Redirect to the main page after saving
			} catch (error) {
				console.error("Error creating entry:", error);
			}
		} else {
			const docRef = doc(db, "sleep", entryId);
			const data = {
				child_id: activeChildId,
				start: Timestamp.fromDate(new Date(`${startDate}T${startTime}`)),
				end: !isOngoing ? Timestamp.fromDate(new Date(`${endDate}T${endTime}`)) : null,
				note: note, // TODO: add note field to the form
			};
			try {
				await updateDoc(docRef, {
					child_id: data.child_id,
					start: data.start,
					end: data.end,
					note: data.note,
				});
				console.log("Entry updated successfully");
				navigate(`/`); // Redirect to the main page after saving
			} catch (error) {
				console.error("Error updating entry:", error);
			}
		}
	};

	const handleCancel = () => {
		navigate(-1); // Navigate back to the previous page
	};

	useEffect(() => {
		const fetchEntry = async () => {
			if (!entryId) return;
			const docRef = doc(db, "sleep", entryId);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				// Convert Firestore Timestamp to local date and time strings
				if (data.start) {
					const startDateObj = new Date(data.start.seconds * 1000);
					setStartDate(
						startDateObj.getFullYear() +
							"-" +
							String(startDateObj.getMonth() + 1).padStart(2, "0") +
							"-" +
							String(startDateObj.getDate()).padStart(2, "0"),
					);
					setStartTime(
						String(startDateObj.getHours()).padStart(2, "0") +
							":" +
							String(startDateObj.getMinutes()).padStart(2, "0"),
					);
				}
				if (data.end) {
					const endDateObj = new Date(data.end.seconds * 1000);
					setEndDate(
						endDateObj.getFullYear() +
							"-" +
							String(endDateObj.getMonth() + 1).padStart(2, "0") +
							"-" +
							String(endDateObj.getDate()).padStart(2, "0"),
					);
					setEndTime(
						String(endDateObj.getHours()).padStart(2, "0") +
							":" +
							String(endDateObj.getMinutes()).padStart(2, "0"),
					);
				} else {
					setIsOngoing(true);
				}
				setNote(data.note || "");
			}
		};
		fetchEntry();
	}, [entryId]);

	return (
		<div className="page">
			<Header
				activePage="sleep"
				title={entryId ? "Edit Sleep" : "Add Sleep"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/sleep/${entryId}`}>Sleep</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaSwitch
					label="Ongoing"
					checked={isOngoing}
					size="large"
					onChange={(e) => setIsOngoing(e.target.checked)}
				>
					Ongoing Sleep
				</WaSwitch>
				<div className="elem-group gap-md flex-wrap">
					<WaInput
						className="timer-date"
						label="Start Date"
						type="date"
						name="start_date"
						placeholder="Enter date"
						value={startDate}
						size="large"
						onInput={(e) => setStartDate(e.target.value)}
					></WaInput>
					<WaInput
						className="timer-time"
						label="Start Time"
						type="time"
						name="start_time"
						placeholder=""
						value={startTime}
						size="large"
						onInput={(e) => setStartTime(e.target.value)}
					/>
				</div>
				{!isOngoing && (
					<div className="elem-group gap-md flex-wrap">
						<WaInput
							className="timer-date"
							label="End Date"
							type="date"
							name="end_date"
							placeholder="Enter date"
							value={endDate}
							size="large"
							onInput={(e) => setEndDate(e.target.value)}
						/>
						<WaInput
							className="timer-time"
							label="End Time"
							type="time"
							name="end_time"
							placeholder=""
							value={endTime}
							size="large"
							onInput={(e) => setEndTime(e.target.value)}
						/>
					</div>
				)}
				<WaTextarea
					label="Note"
					placeholder="Add any notes about this sleep..."
					value={note}
					onInput={(e) => setNote(e.target.value)}
					hint="e.g. 'Had trouble falling asleep', 'Woke up multiple times', etc."
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
				</div>
			</div>
		</div>
	);
};

export default SleepEntryPage;
