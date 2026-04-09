import React, {useState, useEffect} from "react";
import {doc, addDoc, collection, Timestamp} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";
import SlInput from "@shoelace-style/shoelace/dist/react/input";
import SlButton from "@shoelace-style/shoelace/dist/react/button";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon";
import SlSwitch from "@shoelace-style/shoelace/dist/react/switch";
import "./EditPage.css"; // Import your CSS styles

const AddPage = () => {
	const navigate = useNavigate();
	const now = new Date();
	const [startDate, setStartDate] = useState(now.toLocaleDateString("en-CA"));
	const [startTime, setStartTime] = useState(
		now.toLocaleTimeString("en-CA", {hour: "2-digit", minute: "2-digit"})
	);
	const [endDate, setEndDate] = useState("");
	const [endTime, setEndTime] = useState("");
	const [isOngoing, setIsOngoing] = useState(true);

	const handleSave = async () => {
		const data = {
			start: Timestamp.fromDate(new Date(`${startDate}T${startTime}`)),
			end: !isOngoing ? Timestamp.fromDate(new Date(`${endDate}T${endTime}`)) : null,
		};
		try {
			await addDoc(collection(db, "sleep"), data);
			console.log("Entry updated successfully");
			navigate(`/`); // Redirect to the main page after saving
		} catch (error) {
			console.error("Error updating entry:", error);
		}
	};

	const handleCancel = () => {
		navigate(-1); // Navigate back to the previous page
	};

	return (
		<div className="wrapper">
			<div className="elem-group column gap-lg">
				<SlSwitch
					label="Ongoing"
					checked={isOngoing}
					size="large"
					onSlChange={(e) => setIsOngoing(e.target.checked)}
				>
					Ongoing Sleep
				</SlSwitch>
				<div className="elem-group gap-x">
					<SlInput
						className="timer-date"
						label="Start Date"
						type="date"
						name="start_date"
						placeholder="YYYY-MM-DD"
						value={startDate}
						size="large"
						onSlInput={(e) => setStartDate(e.target.value)}
					></SlInput>
					<SlInput
						className="timer-time"
						label="Start Time"
						type="time"
						name="start_time"
						placeholder="HH:MM"
						value={startTime}
						size="large"
						onSlInput={(e) => setStartTime(e.target.value)}
					/>
				</div>
				{!isOngoing && (
					<div className="elem-group gap-x">
						<SlInput
							className="timer-date"
							label="End Date"
							type="date"
							name="end_date"
							placeholder="YYYY-MM-DD"
							value={endDate}
							size="large"
							onSlInput={(e) => setEndDate(e.target.value)}
						/>
						<SlInput
							className="timer-time"
							label="End Time"
							type="time"
							name="end_time"
							placeholder="HH:MM"
							value={endTime}
							size="large"
							onSlInput={(e) => setEndTime(e.target.value)}
						/>
					</div>
				)}
				<div className="fixed-to-bottom controls dark-bg elem-group gap-sm">
					<SlButton
						className="btn-gloss full-width"
						onClick={handleCancel}
						size="large"
						pill
					>
						Cancel
					</SlButton>
					<SlButton
						className="btn-accent full-width"
						onClick={handleSave}
						size="large"
						pill
					>
						Save
					</SlButton>
				</div>
			</div>
		</div>
	);
};

export default AddPage;
