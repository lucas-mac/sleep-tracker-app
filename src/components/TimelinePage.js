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

import {CircleUser, LogOut} from "lucide-react";

import {ulid} from "ulid";

registerIconLibrary("lucide", {
	resolver: (name) => `https://cdn.jsdelivr.net/npm/lucide-static@0.16.29/icons/${name}.svg`,
});

const Timeline = () => {
	// controls
	const [isRunning, setIsRunning] = useState(false);
	const [isAwake, setIsAwake] = useState(false);
	const [time, setTime] = useState(0);
	const [sleepId, setSleepId] = useState(null);
	const [awakeId, setAwakeId] = useState(0);

	// timeline
	const [entries, setEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentDay, setCurrentDay] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
	});
	const now = new Date();
	const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

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
						setSleepId(lastEntry.id);
						setIsRunning(true);
						setTime(0);
						const currentTime = Timestamp.now().seconds;
						const startTime = lastEntryData.start?.seconds;
						if (startTime) {
							const elapsedTime = currentTime - startTime;
							setTime(elapsedTime);
						}
						console.log("Resuming sleep entry with ID:", lastEntry.id);
					} else {
						console.log("Last entry end time:", lastEntryData.end?.seconds);
					}
				}
			} catch (error) {
				console.error("Error checking last sleep entry:", error);
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

	const processEntriesWithAwake = (entries) => {
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
		return result;
	};

	const groupedEntries = processEntriesWithAwake(entries);
	const headerDate = new Intl.DateTimeFormat("en-CA", {
		weekday: "short",
		month: "short",
		day: "numeric",
	}).format(currentDay);

	const logout = () => {
		auth.signOut();
	};

	const header = (
		<div className="pagination align-center space-between full-width">
			<WaButton
				className="btn-transparent btn-round icon-gloss"
				onClick={logout}
				id="logout-button"
			>
				<LogOut size={36} />
			</WaButton>
			<WaTooltip for="logout-button">Log out</WaTooltip>
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
			<h3>{headerDate}</h3>

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

	// Start or pause the timer
	const handleStartPause = async () => {
		setIsRunning((prevState) => !prevState); // Toggle the running state

		if (!isRunning) {
			// If starting the timer, save the start time to Firestore
			if (isAwake && awakeId) {
				const docRef = doc(db, "wake", awakeId); // Get the DocumentReference
				try {
					const awakeDocSnapshot = await getDoc(docRef); // Get the DocumentSnapshot
					const duration =
						Timestamp.now().seconds - awakeDocSnapshot.data().start.seconds;
					await updateDoc(docRef, {duration: duration}); // Use docRef here
					setAwakeId(null); // Reset awake ID
					console.log("Awake entry updated with ID: ", awakeId);
				} catch (error) {
					console.error("Error updating awake entry: ", error);
				}
			}
			setIsAwake(false);
			const sleepEntry = {
				start: Timestamp.now(),
				end: null,
			};
			setEntries([sleepEntry, ...entries]);
			try {
				const eventUlid = ulid();
				const eventDocRef = await setDoc(doc(db, "events", eventUlid), sleepEntry);
				const docRef = await addDoc(collection(db, "sleep"), sleepEntry);
				console.log("Sleep entry added with ID: ", eventDocRef.id);
				setSleepId(eventDocRef.id); // Store the sleep ID
			} catch (error) {
				console.error("Error adding sleep entry: ", error);
			}
		} else {
			// If pausing the timer, save the pause time to Firestore
			setIsAwake(true);
			const wakeEntry = {
				start: Timestamp.now(),
				sleep: sleepId,
			};
			try {
				const docRef = await addDoc(collection(db, "wake"), wakeEntry);
				console.log("Wake entry added with ID: ", docRef.id);
				setAwakeId(docRef.id);
			} catch (error) {
				console.error("Error adding wake entry: ", error);
			}
		}
	};

	// Stop the timer and reset the time
	const handleStop = async () => {
		setIsRunning(false);
		setTime(0); // Reset the timer
		const sleepEntry = {
			end: Timestamp.now(),
		};
		const sleepDocRef = doc(db, "sleep", sleepId);
		try {
			await updateDoc(sleepDocRef, sleepEntry);
			console.log("Sleep entry updated with ID: ", sleepId);
			setSleepId(null);
		} catch (error) {
			console.error("Error updating sleep entry: ", error);
		}
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
					<button
						className="btn-play btn-round btn-transparent btn-outline--thick"
						onClick={handleStartPause}
					>
						{isRunning ? (
							<Pause
								size={24}
								fill="currentColor"
								strokeWidth={2}
								absoluteStrokeWidth={true}
							/>
						) : (
							<Play
								size={24}
								fill="currentColor"
								strokeWidth={2}
								absoluteStrokeWidth={true}
							/>
						)}
					</button>
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
