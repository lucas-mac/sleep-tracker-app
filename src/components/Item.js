import React, {useState, useEffect} from "react";
import {SunMedium, MoonStar} from "lucide-react";
import "./Item.css"; // Import your CSS styles

import WaButton from "@web.awesome.me/webawesome-pro/dist/react/button";
import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import WaDropdown from "@web.awesome.me/webawesome-pro/dist/react/dropdown";
import WaDropdownItem from "@web.awesome.me/webawesome-pro/dist/react/dropdown-item";
import {getFirestore, doc, deleteDoc} from "firebase/firestore";
import {db} from "../firebase"; // Import your Firestore instance

import {RefreshCw, EllipsisVertical} from "lucide-react";

import {registerIconLibrary} from "@web.awesome.me/webawesome-pro/dist/webawesome.js";

registerIconLibrary("lucide", {
	resolver: (name) => `https://jsdelivr.net/npm/lucide-static@1.8.0/icons/${name}.svg`,
	mutator: (svg) => svg.setAttribute("fill", "none"),
});

const Item = ({id, entry, onRemoveEntry}) => {
	const [time, setTime] = useState(0);
	const options = {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	};
	const isAwake = entry.type === "awake";
	const duration = entry.end?.seconds - entry.start?.seconds;
	let h, m, s;
	let durationString = "";
	let rows = "row-1";
	if (duration) {
		h = Math.floor(duration / 3600);
		m = Math.floor((duration % 3600) / 60);
		s = duration % 60;

		if (h > 0) {
			durationString = `${h}h ${m}m`;
		} else {
			durationString = `${m}m ${s}s`;
		}

		if (h == 0) rows = `row-1`;
		if (h >= 1 && h <= 3) rows = `row-2`;
		if (h > 3 && h <= 6) rows = `row-3`;
		if (h > 6 && h <= 16) rows = `row-4`;
	}
	if (durationString === "") {
		durationString = "Ongoing";
	}
	const startTime = new Date(entry.start?.seconds * 1000);
	const endTime = entry.end !== null ? new Date(entry.end?.seconds * 1000) : "Ongoing";
	const startDate = startTime.toLocaleDateString([], options);
	const startTimeString = startTime.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
	const endTimeString =
		endTime !== "Ongoing"
			? endTime.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
			  })
			: endTime;

	let awakeTag = "";
	if (isAwake) {
		awakeTag = <span className="tag tag-gloss">Awake</span>;
	}

	// Timer effect for ongoing awake entry
	useEffect(() => {
		let timer;
		if (isAwake && !entry.end) {
			const updateTimer = () => {
				const now = Math.floor(Date.now() / 1000);
				const start = entry.start?.seconds || 0;
				setTime(now - start);
			};
			updateTimer();
			timer = setInterval(updateTimer, 1000);
		}
		return () => clearInterval(timer);
	}, [isAwake, entry.end, entry.start]);

	const formatTime = (totalSeconds) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		return `${String(hours)}h ${String(minutes)}m`;
	};

	const handleEdit = () => {
		window.location.href = `/sleep/${id}`;
	};

	return isAwake ? (
		<div
			className={`timeline-item full-width ${rows} 
                    ${entry.type === "sleep" ? "is-sleep" : "is-awake"} 
                    ${startTime.getHours() >= 17 ? "nighttime" : "daytime"}`}
			key={id}
		>
			<div className="timeline-item-content">
				<div className={`elem-group align-baseline justify-between elem-divider`}>
					<div className={`item-duration`}>
						{awakeTag}
						{!entry.end ? formatTime(time) : durationString}
					</div>
					<WaButton
						label="Add Entry"
						className="btn-round btn-gloss"
						href={`/sleep/`}
					>
						<WaIcon
							name="plus"
							library="lucide"
						/>
					</WaButton>
				</div>
			</div>
		</div>
	) : (
		<div
			className={`timeline-item full-width ${rows} 
                    ${entry.type === "sleep" ? "is-sleep" : "is-awake"} 
                    ${startTime.getHours() >= 17 ? "nighttime" : "daytime"}`}
			key={id}
		>
			<div className="timeline-item-content">
				<div className={`elem-group align-baseline`}>
					<div className={`item-duration`}>
						{!entry.end ? <RefreshCw className="ongoing icon-gloss" /> : durationString}
					</div>
					<div className="item-range">
						{startTimeString} - {endTimeString}
					</div>
				</div>
				<div className="elem-group gap-xs">
					<div className="item-category badge">
						{startTime.getHours() >= 17 ? (
							<wa-icon
								name="moon"
								library="lucide"
								class="icon"
							/>
						) : (
							<wa-icon
								name="sun"
								library="lucide"
								class="icon"
							/>
						)}
					</div>
					<WaDropdown>
						<WaButton
							slot="trigger"
							className="btn-transparent icon-gloss btn-square"
							size="small"
						>
							<EllipsisVertical
								className="icon-gloss"
								size={18}
							/>
						</WaButton>
						<WaDropdownItem
							value="edit"
							onClick={handleEdit}
						>
							Edit
							<WaIcon
								slot="icon"
								name="pencil"
								library="lucide"
							/>
						</WaDropdownItem>
						<WaDropdownItem
							value="delete"
							onClick={(e) => {
								const deleteEntry = async () => {
									try {
										await deleteDoc(doc(db, "sleep", id));
										if (typeof onRemoveEntry === "function") {
											onRemoveEntry(id);
										}
									} catch (error) {
										console.error("Error deleting document: ", error);
									}
								};

								deleteEntry();
							}}
						>
							Delete Entry
							<WaIcon
								slot="icon"
								name="trash"
								library="lucide"
							/>
						</WaDropdownItem>
					</WaDropdown>
				</div>
			</div>
		</div>
	);
};

export default Item;
