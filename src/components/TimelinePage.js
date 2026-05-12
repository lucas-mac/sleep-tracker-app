import React, {useState, useEffect} from "react";
import {auth, db} from "../firebase";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	setDoc,
	Timestamp,
	updateDoc,
	where,
} from "firebase/firestore";

import Item from "./Item";
import "./Timeline.css";
import "./controls.css";

import {Play, Pause, Square, Circle} from "lucide-react";
import {registerIconLibrary} from "@web.awesome.me/webawesome-pro/dist/webawesome.js";
import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import WaButton from "@web.awesome.me/webawesome-pro/dist/react/button";
import WaTooltip from "@web.awesome.me/webawesome-pro/dist/react/tooltip";
import WaDropdown from "@web.awesome.me/webawesome-pro/dist/react/dropdown";
import WaDropdownItem from "@web.awesome.me/webawesome-pro/dist/react/dropdown-item";

import {CircleUser, Calendar} from "lucide-react";

import {ulid} from "ulid";

registerIconLibrary("lucide", {
	resolver: (name) => `https://cdn.jsdelivr.net/npm/lucide-static@0.16.29/icons/${name}.svg`,
});

const Timeline = () => {
	// controls
	const [isRunning, setIsRunning] = useState(false);
	const [isAwake, setIsAwake] = useState(true);
	const [isPaused, setIsPaused] = useState(false);
	const [time, setTime] = useState(0);
	const [sleepId, setSleepId] = useState(null);
	const [awakeId, setAwakeId] = useState(0);
	const [activeSleepEvent, setActiveSleepEvent] = useState(null);

	const [children, setChildren] = useState([]);
	const [activeChild, setActiveChild] = useState(null);

	// timeline
	const [entries, setEntries] = useState([]);
	const [groupedEntries, setGroupedEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentDay, setCurrentDay] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
	});
	const now = new Date();
	const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

	const upsertEntry = (updatedEntry) => {
		if (!updatedEntry?.id) return;
		setEntries((prevEntries) => {
			const existingIndex = prevEntries.findIndex((entry) => entry.id === updatedEntry.id);
			if (existingIndex === -1) {
				return [updatedEntry, ...prevEntries];
			}
			return prevEntries.map((entry) =>
				entry.id === updatedEntry.id ? updatedEntry : entry,
			);
		});
	};

	const removeEntry = (entryId) => {
		setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryId));
		if (activeSleepEvent?.id === entryId) {
			setActiveSleepEvent(null);
			setIsRunning(false);
			setIsAwake(true);
			setTime(0);
		}
	};

	const fetchEntries = async (startOfDay) => {
		setLoading(true);
		// window.history.replaceState(null, "", `/?d=${startOfDay.toISOString().split('T')[0]}`);
		const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
		const startOfYesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
		const startOfDayTimestamp = Timestamp.fromDate(startOfDay);
		const startOfYesterdayTimestamp = Timestamp.fromDate(startOfYesterday);
		const startOfNextDayTimestamp = Timestamp.fromDate(startOfNextDay);

		try {
			const sleepQuery = query(
				collection(db, "sleep"),
				where("start", ">=", startOfYesterdayTimestamp),
				where("start", "<", startOfNextDayTimestamp),
				orderBy("start", "desc"),
			);
			const querySnapshot = await getDocs(sleepQuery);

			const sleepEntries = querySnapshot.docs
				.map((doc) => ({id: doc.id, ...doc.data()}))
				.filter((entry) => !entry.end || (entry.end && entry.end >= startOfDayTimestamp));

			setEntries(sleepEntries);
		} catch (error) {
			console.error("Error fetching sleep entries:", error);
		}
		setLoading(false);
	};

	const fetchChildren = async () => {
		try {
			const childrenQuery = query(
				collection(db, "child"),
				where("guardian", "==", auth.currentUser.uid),
			);
			const querySnapshot = await getDocs(childrenQuery);
			if (!querySnapshot.empty) {
				setChildren(querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})));
				console.log(querySnapshot.docs[0].data());
				setActiveChild({id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data()});
			} else {
				console.warn("No child found for user");
				return null;
			}
		} catch (error) {
			console.error("Error fetching child data:", error);
			return null;
		}
	};

	const getPrevDay = () => {
		const prevDay = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
		setCurrentDay(prevDay);
		fetchEntries(prevDay);
	};
	const getToday = () => {
		const today = new Date(
			new Date().getFullYear(),
			new Date().getMonth(),
			new Date().getDate(),
			0,
			0,
			0,
			0,
		);
		setCurrentDay(today);
		fetchEntries(today);
	};
	const getNextDay = () => {
		const nextDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000);
		setCurrentDay(nextDay);
		fetchEntries(nextDay);
	};

	useEffect(() => {
        fetchEntries(currentDay);
        fetchChildren();
		// eslint-disable-next-line

		const checkLastEntry = async () => {
			try {
				// Query the last sleep entry ordered by the start timestamp
				const sleepQuery = query(
					collection(db, "sleep"),
					orderBy("start", "desc"),
					limit(1),
				);
				const querySnapshot = await getDocs(sleepQuery);

				if (!querySnapshot.empty) {
					const lastEntry = querySnapshot.docs[0];
					const lastEntryData = lastEntry.data();

					if (!lastEntryData.end) {
						setIsAwake(false);
						setIsRunning(true);
						setActiveSleepEvent({id: lastEntry.id, ...lastEntryData});
						setSleepId(lastEntry.id);

						const currentTime = Timestamp.now().seconds;
						const startTime = lastEntryData.start?.seconds;
						if (startTime) {
							const elapsedTime = currentTime - startTime;
							setTime(elapsedTime);
						}
					}
				}
			} catch (error) {
				console.error("Error checking last sleep entry:", error);
				// TODO: handle error (e.g., show notification to user)
			}
		};

		checkLastEntry();
	}, []);

	useEffect(() => {
		let timer;
		if (isRunning) {
			timer = setInterval(() => {
				setTime((prevTime) => prevTime + 1);
			}, 1000); // Increment timer every second
		} else {
			clearInterval(timer);
		}
		return () => clearInterval(timer); // Cleanup on unmount
	}, [isRunning]);

	useEffect(() => {
		const sleepEntries = entries.map((entry) => ({
			...entry,
			type: "sleep",
		}));

		const result = [];
		for (let i = 0; i < sleepEntries.length; i++) {
			const current = sleepEntries[i];
			if (i == 0 && sleepEntries[i].end !== null) {
				result.push({
					id: `awake-${current.id}-${sleepEntries[i].id}`,
					end: null,
					start: sleepEntries[i].end,
					type: "awake",
				});
			}

			result.push(current);

			if (i < sleepEntries.length - 1 && current.start && sleepEntries[i + 1].end) {
				result.push({
					id: `awake-${current.id}-${sleepEntries[i + 1].id}`,
					end: current.start,
					start: sleepEntries[i + 1].end,
					type: "awake",
				});
			}
		}
		setGroupedEntries(result);
	}, [entries]);

	const headerDate = new Intl.DateTimeFormat("en-CA", {
		weekday: "short",
		month: "short",
		day: "numeric",
	}).format(currentDay);

	const header = (
		<div className="pagination align-center space-between full-width">
			<WaDropdown>
				<WaButton
					className="btn-transparent btn-round icon-gloss"
					slot="trigger"
				>
					<WaIcon
						family="default"
						name={activeChild ? activeChild.avatar_icon : undefined}
						size="large"
						color={activeChild ? activeChild.avatar_color : undefined}
					/>
				</WaButton>
				{children.length > 0 &&
					children.map((child) => (
						<WaDropdownItem
							key={child.id}
							value={child.id}
							onClick={() => setActiveChild(child)}
						>
							<WaIcon
								family="default"
								name={child.avatar_icon}
								size="large"
								color={child.avatar_color}
								slot="icon"
							/>
							{child.nickname}
						</WaDropdownItem>
					))}
			</WaDropdown>
			<WaButton
				slot="trigger"
				className="btn-round btn-gloss btn-icon"
				onClick={getPrevDay}
			>
				<WaIcon
					name="chevron-left"
					library="lucide"
					className=""
				/>
			</WaButton>
			<div className="text-center elem-group gap-sm">
				<h3>{headerDate}</h3>
				{currentDay.getTime() !== todayDay.getTime() && (
					<WaButton
						className="btn-transparent btn-round icon-gloss"
						onClick={getToday}
					>
						<Calendar size={36} />
					</WaButton>
				)}
			</div>

			<WaButton
				slot="trigger"
				className="btn-round btn-gloss"
				onClick={getNextDay}
				style={currentDay.getTime() < todayDay.getTime() ? {} : {visibility: "hidden"}}
			>
				<WaIcon
					name="chevron-right"
					library="lucide"
				/>
			</WaButton>
			<WaButton
				className="btn-transparent btn-round icon-gloss"
				href="/profile"
				id="profile-button"
			>
				<CircleUser size={36} />
			</WaButton>
			<WaTooltip for="profile-button">Profile</WaTooltip>
		</div>
	);

	const handleStart = async () => {
		setIsRunning(true);
		if (isPaused) {
			setIsPaused(false);
			// get last wake entry and update end time
			if (activeSleepEvent && activeSleepEvent.wake && activeSleepEvent.wake.length > 0) {
				const lastWakeEntry = activeSleepEvent.wake[activeSleepEvent.wake.length - 1];
				const endTime = Timestamp.now();
				const duration = endTime.seconds - lastWakeEntry.start.seconds;

				try {
					const updatedSleepEvent = {
						...activeSleepEvent,
						wake: activeSleepEvent.wake.slice(0, -1).concat({
							...lastWakeEntry,
							end: endTime,
							duration: duration,
						}),
					};
					await updateDoc(doc(db, "sleep", activeSleepEvent.id), {
						wake: updatedSleepEvent.wake,
					});
					setActiveSleepEvent(updatedSleepEvent);
					upsertEntry(updatedSleepEvent);
				} catch (error) {
					// TODO: handle error (e.g., show notification to user)
					console.error("Error updating wake entry: ", error);
				}
			}
		} else {
			let eventUlid;
			let sleepEntry;
			if (!activeSleepEvent) {
				eventUlid = ulid();
				sleepEntry = {
					child_id: "01KNYE1GXDTQ0R5W85MGXTAAN2", // TODO: replace with dynamic child ID
					start: Timestamp.now(),
					end: null,
					duration: null,
					wake: [],
					notes: "",
				};
			} else {
				eventUlid = activeSleepEvent.id;
				// get last wake entry for this sleep event
				sleepEntry = {
					...activeSleepEvent,
				};
			}
			try {
				await setDoc(doc(db, "sleep", eventUlid), sleepEntry);
				const sleepEntryWithId = {id: eventUlid, ...sleepEntry};
				setActiveSleepEvent(sleepEntryWithId);
				upsertEntry(sleepEntryWithId);
				setSleepId(eventUlid); // Store the sleep ID
			} catch (error) {
				console.error("Error adding sleep entry: ", error);
				// TODO: handle error (e.g., show notification to user)
			}
		}

		setIsAwake(false);
	};

	const handlePause = async () => {
		// setIsRunning(false);
		setIsAwake(true);
		setIsPaused(true);
		const wakeStart = Timestamp.now();

		const updatedWakeEntries = activeSleepEvent.wake
			? [...activeSleepEvent.wake, {start: wakeStart}]
			: [{start: wakeStart}];

		try {
			await updateDoc(doc(db, "sleep", activeSleepEvent.id), {
				wake: updatedWakeEntries,
			});
			const updatedSleepEvent = {
				...activeSleepEvent,
				wake: updatedWakeEntries,
			};
			setActiveSleepEvent(updatedSleepEvent);
			upsertEntry(updatedSleepEvent);
		} catch (error) {
			// TODO: handle error (e.g., show notification to user)
			console.error("Error updating wake entry: ", error);
		}
	};

	// Stop the timer and reset the time
	const handleStop = async () => {
		// TODO: need to check for active wake entry and delete if no duration has been set, otherwise the wake entry will be orphaned without a corresponding sleep entry

		const endTime = Timestamp.now();
		const sleepEntry = {
			end: endTime,
			duration: endTime.seconds - activeSleepEvent.start.seconds,
		};
		const sleepDocRef = doc(db, "sleep", sleepId);
		try {
			await updateDoc(sleepDocRef, sleepEntry);
			setActiveSleepEvent((prevEvent) => {
				if (!prevEvent) return prevEvent;
				const duration = endTime.seconds - prevEvent.start.seconds;
				const updatedSleepEvent = {...prevEvent, end: endTime, duration: duration};
				upsertEntry(updatedSleepEvent);
				return updatedSleepEvent;
			});
			setActiveSleepEvent(null);
			console.log("Sleep entry updated with ID: ", sleepId);
			setSleepId(null);
		} catch (error) {
			console.error("Error updating sleep entry: ", error);
		}

		setTime(0); // Reset the timer
		setIsRunning(false);
		setIsAwake(true);
	};

	// Format time in hours:minutes:seconds
	const formatTime = (totalSeconds) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		// Pad with leading zeros if needed
		const paddedHours = String(hours).padStart(2, "0");
		const paddedMinutes = String(minutes).padStart(2, "0");
		const paddedSeconds = String(seconds).padStart(2, "0");

		return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
	};

	return (
		<div className="wrapper full-height space-between column justify-between page">
			<div className="column">
				{header}
				{loading ? (
					""
				) : (
					<div className="elem-group column gap-sm timeline">
						<div className="day">
							{groupedEntries.length > 0 ? (
								groupedEntries.map((entry) => (
									<Item
										key={entry.id}
										id={entry.id}
										entry={entry}
										onRemoveEntry={removeEntry}
									/>
								))
							) : (
								<p>No entries found</p>
							)}
						</div>
					</div>
				)}
			</div>
			<div className="controls elem-group">
				<div className="elem-group gap-md">
					{!isRunning && (
						<button
							className="btn-play btn-round btn-transparent btn-outline--thick"
							onClick={handleStart}
						>
							<Play
								size={24}
								fill="currentColor"
								strokeWidth={2}
								absoluteStrokeWidth={true}
							/>
						</button>
					)}

					{isRunning && (
						<button
							className="btn-pause btn-round btn-transparent btn-outline--thick"
							onClick={handlePause}
						>
							<Pause
								size={24}
								fill="currentColor"
								strokeWidth={2}
								absoluteStrokeWidth={true}
							/>
						</button>
					)}
					{isRunning && (
						<button
							className="btn-stop btn-round btn-transparent btn-outline--thick"
							onClick={handleStop}
						>
							<Square
								size={24}
								strokeWidth={4}
								absoluteStrokeWidth={true}
							/>
						</button>
					)}
				</div>
				<div className="timer">{formatTime(time)}</div>
			</div>
		</div>
	);
};

export default Timeline;
