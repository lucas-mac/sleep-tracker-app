import React, {useState, useEffect} from "react";
import {Play, Pause, Square} from "lucide-react";
import "./controls.css"; // Import your CSS styles
import {db} from "../firebase";
import {ulid} from "ulid";
import {
	collection,
	doc,
	addDoc,
	getDoc,
	updateDoc,
	query,
	orderBy,
	limit,
	getDocs,
	Timestamp,
} from "firebase/firestore";

const Controls = () => {
	const [isRunning, setIsRunning] = useState(false);
	const [isAwake, setIsAwake] = useState(false);
	const [time, setTime] = useState(0);
	const [sleepId, setSleepId] = useState(null);
	const [awakeId, setAwakeId] = useState(0);

	// Effect to handle the timer logic
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

	// Check Firestore for the last sleep entry on app load
	useEffect(() => {
		const checkLastEntry = async () => {
			try {
				// Query the last sleep entry ordered by the start timestamp
				const sleepQuery = query(
					collection(db, "sleep"),
					orderBy("start", "desc"),
					limit(1)
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
	}, []); // Run only once on component mount

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
			try {
				const docRef = await addDoc(collection(db, "sleep"), sleepEntry);
				console.log("Sleep entry added with ID: ", docRef.id);
				setSleepId(docRef.id); // Store the sleep ID
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
		<div className="controls elem-group wrapper">
			<div className="elem-group gap-md">
				<button
					className="btn-play btn-round btn-transparent"
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
						className="btn-stop btn-round btn-transparent"
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
	);
};

export default Controls;
