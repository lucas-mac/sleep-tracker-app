// pee, poop, both
// consistency
// colour
// note

import React, {useState, useEffect} from "react";
import {doc, addDoc, collection, Timestamp} from "firebase/firestore";
import {ulid} from "ulid";
import WaDropdown from "@web.awesome.me/webawesome-pro/dist/components/dropdown/dropdown.js";

const AddEventPage = () => {
	const [eventType, setEventType] = useState("awake");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
};

const handleSubmit = async (e) => {
	e.preventDefault();
	if (!childId) {
		alert("Child ID is missing.");
		return;
	}
	const newEvent = {
		id: ulid(),
		type: eventType,
		start: Timestamp.fromDate(new Date(startTime)),
		end: endTime ? Timestamp.fromDate(new Date(endTime)) : null,
	};
	try {
		await addDoc(collection(doc(db, "children", childId), "events"), newEvent);
		alert("Event added successfully!");
	} catch (error) {
		console.error("Error adding event: ", error);
		alert("Failed to add event. Please try again.");
	}
};

export default AddEventPage;
