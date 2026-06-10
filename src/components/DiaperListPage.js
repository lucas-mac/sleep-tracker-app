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
// get list of all diaper entries for active child, sorted by date desc
// show date, time, type (pee/poop), consistency, colour, note
// clicking on entry opens edit page

import {toTitleCase} from "../utils/format";

import {db} from "../firebase";
import {useActiveChild} from "./ActiveChildContext";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaButton,
	WaDropdown,
	WaIcon,
	WaSelect,
	WaOption,
} from "@web.awesome.me/webawesome-pro/dist/react";
import {LayoutGrid} from "lucide-react";
import Header from "./Header";
import moment from "moment";

const DiaperListPage = () => {
	const {activeChild, activeChildId} = useActiveChild();

	const [diaperEntries, setDiaperEntries] = useState([]);
	const [totalDiaperCount, setTotalDiaperCount] = useState(0);
	const [firstCursor, setFirstCursor] = useState(null);
	const [lastCursor, setLastCursor] = useState(null);
	const [paginationLimit, setPaginationLimit] = useState(10);
	const [pageStart, setPageStart] = useState(0);

	const fetchDiaperEntries = async () => {
		if (!activeChildId) return;
		const diaperQuery = query(
			collection(db, "diaper"),
			where("child_id", "==", activeChildId),
			orderBy("timestamp", "desc"),
			limit(paginationLimit),
		);

		const querySnapshot = await getDocs(diaperQuery);
		const entries = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
		setDiaperEntries(entries);
		setPageStart(0);
		setFirstCursor(querySnapshot.docs[0] ?? null);
		setLastCursor(querySnapshot.docs[querySnapshot.docs.length - 1] ?? null);

		const countQuery = query(collection(db, "diaper"), where("child_id", "==", activeChildId));
		const countSnapshot = await getCountFromServer(countQuery);
		setTotalDiaperCount(countSnapshot.data().count);
	};

	const handlePagination = async (direction) => {
		if (!activeChildId) return;
		let diaperQuery;
		if (direction === "next" && lastCursor) {
			diaperQuery = query(
				collection(db, "diaper"),
				where("child_id", "==", activeChildId),
				orderBy("timestamp", "desc"),
				startAfter(lastCursor),
				limit(paginationLimit),
			);
		} else if (direction === "prev" && firstCursor) {
			diaperQuery = query(
				collection(db, "diaper"),
				where("child_id", "==", activeChildId),
				orderBy("timestamp", "asc"),
				startAfter(firstCursor),
				limit(paginationLimit),
			);
		} else {
			return;
		}
		const querySnapshot = await getDocs(diaperQuery);
		const docs = querySnapshot.docs;
		const entries = (direction === "prev" ? [...docs].reverse() : docs).map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		if (entries.length === 0) return;
		if (direction === "next") {
			setPageStart((prev) => prev + diaperEntries.length);
		} else {
			setPageStart((prev) => prev - entries.length);
		}
		setDiaperEntries(entries);
		setFirstCursor(direction === "prev" ? docs[docs.length - 1] : docs[0]);
		setLastCursor(direction === "prev" ? docs[0] : docs[docs.length - 1]);
	};

	useEffect(() => {
		fetchDiaperEntries();
	}, [activeChildId, paginationLimit]);

	return (
		<div className="page">
			<Header
				activePage="diapers"
				title="Diapers"
			/>

			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/diaper-history/`}>
						{activeChild ? activeChild.nickname + "'s" : "Select Child for"} Diapers
					</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaButton
					className="btn-gloss"
					href="/diaper/"
				>
					<WaIcon
						family="default"
						name="plus"
						slot="start"
					/>
					Add Diaper
				</WaButton>
				<div className="table-scroll-wrapper">
					<table className="diaper-table scroll has-pagination">
						<thead>
							<tr>
								<th>Time</th>
								<th>Type</th>
								<th>Consistency</th>
								<th>Colour</th>
								<th>Note</th>
								<th className="sticky-right"></th>
							</tr>
						</thead>
						<tbody>
							{diaperEntries.length === 0 ? (
								<tr>
									<td colSpan="6">No diaper entries found</td>
								</tr>
							) : (
								diaperEntries.map((entry) => (
									<tr key={entry.id}>
										<td>
											<span className="no-wrap">
												{moment(entry.timestamp.toDate()).format("h:mm a")}
											</span>
											<br />
											<small className="text-gloss text-uppercase">
												{moment(entry.timestamp.toDate()).format("MMM D")}
											</small>
										</td>
										<td>{toTitleCase(entry.type)}</td>
										<td>{toTitleCase(entry.consistency)}</td>
										<td>{toTitleCase(entry.colour)}</td>
										<td>{entry.note}</td>
										<td className="sticky-right">
											<a href={`/diaper/${entry.id}`}>
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
							{totalDiaperCount === 0 ? 0 : pageStart + 1} {" - "}
							{pageStart + diaperEntries.length} of {totalDiaperCount}
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
								disabled={pageStart + diaperEntries.length >= totalDiaperCount}
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

export default DiaperListPage;
