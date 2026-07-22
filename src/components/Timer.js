import {useEffect, useMemo, useState} from "react";

const toTimestampMs = (value) => {
	if (value instanceof Date) {
		return value.getTime();
	}

	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : parsed;
	}

	return null;
};

const formatElapsed = (totalSeconds) => {
	const safeSeconds = Math.max(0, totalSeconds);
	const hours = Math.floor(safeSeconds / 3600);
	const minutes = Math.floor((safeSeconds % 3600) / 60);
	const seconds = safeSeconds % 60;

	return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

const Timer = ({timestamp}) => {
	const startMs = useMemo(() => toTimestampMs(timestamp), [timestamp]);

	const getElapsedSeconds = () => {
		if (startMs === null) return 0;
		return Math.floor((Date.now() - startMs) / 1000);
	};

	const [elapsedSeconds, setElapsedSeconds] = useState(getElapsedSeconds);

	useEffect(() => {
		setElapsedSeconds(getElapsedSeconds());

		if (startMs === null) return undefined;

		const intervalId = setInterval(() => {
			setElapsedSeconds(getElapsedSeconds());
		}, 1000);

		return () => clearInterval(intervalId);
	}, [startMs]);

	return <span>{formatElapsed(elapsedSeconds)}</span>;
};

export default Timer;
