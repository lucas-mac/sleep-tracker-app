import React, {useState, useEffect} from "react";
import {SunMedium, MoonStar} from "lucide-react";
import "./Item.css"; // Import your CSS styles

import SlButton from "@shoelace-style/shoelace/dist/react/button";
import SlDropdown from "@shoelace-style/shoelace/dist/react/dropdown";
import SlMenu from "@shoelace-style/shoelace/dist/react/menu";
import SlMenuItem from "@shoelace-style/shoelace/dist/react/menu-item";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import {getFirestore, doc, deleteDoc} from "firebase/firestore";
import {db} from "../firebase"; // Import your Firestore instance

import {registerIconLibrary} from "@shoelace-style/shoelace/dist/utilities/icon-library";

registerIconLibrary("lucide", {
	resolver: (name) => `https://cdn.jsdelivr.net/npm/lucide-static@0.16.29/icons/${name}.svg`,
});

const Item = ({id, entry}) => {
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
		window.location.href = `/edit/${id}`;
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
					<SlIconButton
						name="plus"
						library="lucide"
						label="Add Entry"
						className="btn-round btn-gloss"
						href={`/add/`}
					/>
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
						{!entry.end ? (
							<SlIcon
								name="arrow-repeat"
								className="ongoing"
							/>
						) : (
							durationString
						)}
					</div>
					<div className="item-range">
						{startTimeString} - {endTimeString}
					</div>
				</div>
				<div className="elem-group gap-xs">
					<div className="item-category badge">
						{startTime.getHours() >= 17 ? (
							<sl-icon
								name="moon"
								library="lucide"
								class="icon"
							/>
						) : (
							<sl-icon
								name="sun"
								library="lucide"
								class="icon"
							/>
						)}
					</div>
					<SlDropdown>
						<SlIconButton
							name="three-dots-vertical"
							slot="trigger"
						/>
						<SlMenu>
							<SlMenuItem
								value="edit"
								onClick={handleEdit}
							>
								Edit
								<SlIcon
									slot="prefix"
									name="pencil"
									library="lucide"
								/>
							</SlMenuItem>
							<SlMenuItem
								value="delete"
								onClick={(e) => {
									const deleteEntry = async () => {
										try {
											await deleteDoc(doc(db, "sleep", id));
											const entry = e.target.closest(".timeline-item");
											entry.remove();
										} catch (error) {
											console.error("Error deleting document: ", error);
										}
									};

									deleteEntry();
								}}
							>
								Delete Entry
								<SlIcon
									slot="prefix"
									name="trash"
									library="lucide"
								/>
							</SlMenuItem>
						</SlMenu>
					</SlDropdown>
				</div>
			</div>
		</div>
	);
};

export default Item;
