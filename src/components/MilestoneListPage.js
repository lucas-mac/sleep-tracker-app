import React, {useEffect, useState} from "react";
import {
	collection,
	getDocs,
	orderBy,
	query,
	where,
	limit,
	startAfter,
	getCountFromServer,
} from "firebase/firestore";
import {LayoutGrid} from "lucide-react";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaButton,
	WaIcon,
	WaSelect,
	WaOption,
} from "@web.awesome.me/webawesome-pro/dist/react";
import moment from "moment";

import {db} from "../firebase";
import {toTitleCase} from "../utils/format";
import {useActiveChild} from "./ActiveChildContext";
import Header from "./Header";

const MilestoneListPage = () => {
	const {activeChild, activeChildId} = useActiveChild();
	const [milestoneEntries, setMilestoneEntries] = useState([]);
	const [totalMilestoneCount, setTotalMilestoneCount] = useState(0);
	const [firstCursor, setFirstCursor] = useState(null);
	const [lastCursor, setLastCursor] = useState(null);
	const [paginationLimit, setPaginationLimit] = useState(10);
	const [pageStart, setPageStart] = useState(0);

	const fetchMilestoneEntries = async () => {
		if (!activeChildId) return;

		const milestoneQuery = query(
			collection(db, "milestone"),
			where("child_id", "==", activeChildId),
			orderBy("timestamp", "desc"),
			limit(paginationLimit),
		);

		const querySnapshot = await getDocs(milestoneQuery);
		const entries = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
		setMilestoneEntries(entries);
		setPageStart(0);
		setFirstCursor(querySnapshot.docs[0] ?? null);
		setLastCursor(querySnapshot.docs[querySnapshot.docs.length - 1] ?? null);

		const countQuery = query(
			collection(db, "milestone"),
			where("child_id", "==", activeChildId),
		);
		const countSnapshot = await getCountFromServer(countQuery);
		setTotalMilestoneCount(countSnapshot.data().count);
	};

	const handlePagination = async (direction) => {
		if (!activeChildId) return;
		let milestoneQuery;

		if (direction === "next" && lastCursor) {
			milestoneQuery = query(
				collection(db, "milestone"),
				where("child_id", "==", activeChildId),
				orderBy("timestamp", "desc"),
				startAfter(lastCursor),
				limit(paginationLimit),
			);
		} else if (direction === "prev" && firstCursor) {
			milestoneQuery = query(
				collection(db, "milestone"),
				where("child_id", "==", activeChildId),
				orderBy("timestamp", "asc"),
				startAfter(firstCursor),
				limit(paginationLimit),
			);
		} else {
			return;
		}

		const querySnapshot = await getDocs(milestoneQuery);
		const docs = querySnapshot.docs;
		const entries = (direction === "prev" ? [...docs].reverse() : docs).map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		if (entries.length === 0) return;

		if (direction === "next") {
			setPageStart((prev) => prev + milestoneEntries.length);
		} else {
			setPageStart((prev) => prev - entries.length);
		}

		setMilestoneEntries(entries);
		setFirstCursor(direction === "prev" ? docs[docs.length - 1] : docs[0]);
		setLastCursor(direction === "prev" ? docs[0] : docs[docs.length - 1]);
	};

	useEffect(() => {
		fetchMilestoneEntries();
	}, [activeChildId, paginationLimit]);

	const getMilestoneTitle = (entry) => {
		return (
			entry.title || entry.name || entry.milestone || entry.event || toTitleCase(entry.type) || "-"
		);
	};

	const getMilestoneNote = (entry) => {
		return entry.note || entry.details || entry.description || "";
	};

	const formatTimestamp = (timestamp) => {
		if (!timestamp || typeof timestamp.toDate !== "function") return "-";
		return moment(timestamp.toDate()).format("h:mm a");
	};

	const formatDate = (timestamp) => {
		if (!timestamp || typeof timestamp.toDate !== "function") return "-";
		return moment(timestamp.toDate()).format("MMM D");
	};

	return (
		<div className="page">
			<Header
				activePage="milestones"
				title="Milestones"
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href="/milestone-history">
						{activeChild ? activeChild.nickname + "'s" : "Select Child for"} Milestones
					</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaButton
					className="btn-gloss"
					href="/milestone/"
				>
					<WaIcon
						family="default"
						name="plus"
						slot="start"
					/>
					Add Milestone
				</WaButton>
				<div className="table-scroll-wrapper">
					<table className="milestone-table scroll has-pagination">
						<thead>
							<tr>
								<th>Time</th>
								<th>Milestone</th>
								<th>Note</th>
								<th className="sticky-right"></th>
							</tr>
						</thead>
						<tbody>
							{milestoneEntries.length === 0 ? (
								<tr>
									<td colSpan="4">No milestone entries found</td>
								</tr>
							) : (
								milestoneEntries.map((entry) => (
									<tr key={entry.id}>
										<td>
											<span className="no-wrap">{formatTimestamp(entry.timestamp)}</span>
											<br />
											<small className="text-gloss text-uppercase">
												{formatDate(entry.timestamp)}
											</small>
										</td>
										<td>{getMilestoneTitle(entry)}</td>
										<td>{getMilestoneNote(entry)}</td>
										<td className="sticky-right">
											<a href={`/milestone/${entry.id}`}>
												<WaButton
													className="btn-gloss btn-round"
													size="medium"
												>
													<WaIcon
														name="edit"
														family="default"
													/>
												</WaButton>
											</a>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
					<footer className="pagination justify-between">
						<div>
							{totalMilestoneCount === 0 ? 0 : pageStart + 1} {" - "}
							{pageStart + milestoneEntries.length} of {totalMilestoneCount}
						</div>
						<div className="elem-group gap-sm">
							<WaSelect
								size="small"
								value={paginationLimit}
								onChange={(e) => setPaginationLimit(parseInt(e.target.value))}
								style={{width: "80px", position: "relative", top: "2px"}}
								className="no-label"
							>
								<WaOption
									value={5}
									{...(paginationLimit === 5 && {selected: true})}
								>
									5
								</WaOption>
								<WaOption
									value={10}
									{...(paginationLimit === 10 && {selected: true})}
								>
									10
								</WaOption>
								<WaOption
									value={20}
									{...(paginationLimit === 20 && {selected: true})}
								>
									20
								</WaOption>
							</WaSelect>
							<WaButton
								className="btn-gloss"
								size="small"
								onClick={() => handlePagination("prev")}
								disabled={pageStart === 0}
							>
								<WaIcon
									name="chevron-left"
									family="default"
								/>
							</WaButton>
							<WaButton
								className="btn-gloss"
								size="small"
								onClick={() => handlePagination("next")}
								disabled={pageStart + milestoneEntries.length >= totalMilestoneCount}
							>
								<WaIcon
									name="chevron-right"
									family="default"
								/>
							</WaButton>
						</div>
					</footer>
				</div>
			</div>
		</div>
	);
};

export default MilestoneListPage;
