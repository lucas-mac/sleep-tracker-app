import React, {useState, useEffect} from "react";
import {doc, getDoc, updateDoc, Timestamp} from "firebase/firestore";
import {db} from "../firebase";
import {useParams, useNavigate} from "react-router-dom";
import WaInput from "@web.awesome.me/webawesome-pro/dist/react/input";
import WaButton from "@web.awesome.me/webawesome-pro/dist/react/button";
import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import WaSwitch from "@web.awesome.me/webawesome-pro/dist/react/switch";
import "./EditPage.css"; // Import your CSS styles

const EditPage = () => {
	const {entryId} = useParams();
	const navigate = useNavigate();
	const [startDate, setStartDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endDate, setEndDate] = useState("");
	const [endTime, setEndTime] = useState("");
	const [isOngoing, setIsOngoing] = useState(false);

	const handleSave = async () => {
		if (!entryId) return;
		const docRef = doc(db, "sleep", entryId);
		const data = {
			start: Timestamp.fromDate(new Date(`${startDate}T${startTime}`)),
			end: !isOngoing ? Timestamp.fromDate(new Date(`${endDate}T${endTime}`)) : null,
		};
		try {
			await updateDoc(docRef, {
				start: data.start,
				end: data.end,
			});
			console.log("Entry updated successfully");
			navigate(`/`); // Redirect to the main page after saving
		} catch (error) {
			console.error("Error updating entry:", error);
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
							String(startDateObj.getDate()).padStart(2, "0")
					);
					setStartTime(
						String(startDateObj.getHours()).padStart(2, "0") +
							":" +
							String(startDateObj.getMinutes()).padStart(2, "0")
					);
				}
				if (data.end) {
					const endDateObj = new Date(data.end.seconds * 1000);
					setEndDate(
						endDateObj.getFullYear() +
							"-" +
							String(endDateObj.getMonth() + 1).padStart(2, "0") +
							"-" +
							String(endDateObj.getDate()).padStart(2, "0")
					);
					setEndTime(
						String(endDateObj.getHours()).padStart(2, "0") +
							":" +
							String(endDateObj.getMinutes()).padStart(2, "0")
					);
				} else {
					setIsOngoing(true);
				}
			}
		};
		fetchEntry();
	}, [entryId]);

	return (
		<div className="wrapper">
			<div className="elem-group column gap-lg">
				<WaSwitch
					label="Ongoing"
					checked={isOngoing}
					size="large"
					onChange={(e) => setIsOngoing(e.target.checked)}
				>
					Ongoing Sleep
				</WaSwitch>
				<div className="elem-group gap-x">
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
					<div className="elem-group gap-x">
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
				<div className="fixed-to-bottom controls dark-bg elem-group gap-sm">
					<WaButton
						className="btn-gloss full-width"
						onClick={handleCancel}
						size="large"
						pill
					>
						Cancel
					</WaButton>
					<WaButton
						className="btn-accent full-width"
						onClick={handleSave}
						size="large"
						pill
					>
						Save
					</WaButton>
				</div>
			</div>
		</div>
	);
};

export default EditPage;
