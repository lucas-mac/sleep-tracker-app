import React, {useState, useEffect} from "react";
import {doc, addDoc, collection, Timestamp} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";
import WaInput from "@web.awesome.me/webawesome-pro/dist/react/input";
import WaButton from "@web.awesome.me/webawesome-pro/dist/react/button";
import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import WaSwitch from "@web.awesome.me/webawesome-pro/dist/react/switch";
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
						placeholder="YYYY-MM-DD"
						value={startDate}
						size="large"
						onInput={(e) => setStartDate(e.target.value)}
					></WaInput>
					<WaInput
						className="timer-time"
						label="Start Time"
						type="time"
						name="start_time"
						placeholder="HH:MM"
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
							placeholder="YYYY-MM-DD"
							value={endDate}
							size="large"
							onInput={(e) => setEndDate(e.target.value)}
						/>
						<WaInput
							className="timer-time"
							label="End Time"
							type="time"
							name="end_time"
							placeholder="HH:MM"
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

export default AddPage;
