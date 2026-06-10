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

import {db} from "../firebase";
import {useActiveChild} from "./ActiveChildContext";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaButton,
	WaIcon,
	WaSelect,
	WaOption,
} from "@web.awesome.me/webawesome-pro/dist/react";
import {LayoutGrid} from "lucide-react";
import Header from "./Header";
import moment from "moment";

const GrowthListPage = () => {
	const [measurementEntries, setMeasurementEntries] = useState([]);
	const [totalGrowthCount, setTotalGrowthCount] = useState(0);
	const [firstCursor, setFirstCursor] = useState(null);
	const [lastCursor, setLastCursor] = useState(null);
	const [paginationLimit, setPaginationLimit] = useState(10);
	const [pageStart, setPageStart] = useState(0);
	const {activeChild, activeChildId} = useActiveChild();

	const fetchMeasurementEntries = async () => {
		if (!activeChildId) return;
		const measurementQuery = query(
			collection(db, "growth"),
			where("child_id", "==", activeChildId),
			orderBy("timestamp", "desc"),
			limit(paginationLimit),
		);
		const querySnapshot = await getDocs(measurementQuery);
		const entries = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
		setMeasurementEntries(entries);
		setPageStart(0);
		setFirstCursor(querySnapshot.docs[0] ?? null);
		setLastCursor(querySnapshot.docs[querySnapshot.docs.length - 1] ?? null);

		const countQuery = query(collection(db, "growth"), where("child_id", "==", activeChildId));
		const countSnapshot = await getCountFromServer(countQuery);
		setTotalGrowthCount(countSnapshot.data().count);
	};

	const handlePagination = async (direction) => {
		if (!activeChildId) return;
		let measurementQuery;
		if (direction === "next" && lastCursor) {
			measurementQuery = query(
				collection(db, "growth"),
				where("child_id", "==", activeChildId),
				orderBy("timestamp", "desc"),
				startAfter(lastCursor),
				limit(paginationLimit),
			);
		} else if (direction === "prev" && firstCursor) {
			measurementQuery = query(
				collection(db, "growth"),
				where("child_id", "==", activeChildId),
				orderBy("timestamp", "asc"),
				startAfter(firstCursor),
				limit(paginationLimit),
			);
		} else {
			return;
		}

		const querySnapshot = await getDocs(measurementQuery);
		const docs = querySnapshot.docs;
		const entries = (direction === "prev" ? [...docs].reverse() : docs).map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		if (entries.length === 0) return;

		if (direction === "next") {
			setPageStart((prev) => prev + measurementEntries.length);
		} else {
			setPageStart((prev) => prev - entries.length);
		}

		setMeasurementEntries(entries);
		setFirstCursor(direction === "prev" ? docs[docs.length - 1] : docs[0]);
		setLastCursor(direction === "prev" ? docs[0] : docs[docs.length - 1]);
	};

	useEffect(() => {
		fetchMeasurementEntries();
	}, [activeChildId, paginationLimit]);

	return (
		<div className="page">
			<Header
				activePage="growth"
				title="Growth History"
			/>

			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/growth-history/`}>
						{activeChild ? activeChild.nickname + "'s" : "Select Child for"} Growth
					</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaButton
					className="btn-gloss"
					href="/growth/"
				>
					<WaIcon
						family="default"
						name="plus"
						slot="start"
					/>
					Add Growth Entry
				</WaButton>
				<div className="table-scroll-wrapper">
					<table className="growth-table scroll has-pagination">
						<thead>
							<tr>
								<th>Date</th>
								<th>Weight</th>
								<th>Height</th>
								<th>Note</th>
								<th className="sticky-right"></th>
							</tr>
						</thead>
						<tbody>
							{measurementEntries.length === 0 ? (
								<tr>
									<td colSpan="5">No growth entries found</td>
								</tr>
							) : (
								measurementEntries.map((entry) => (
									<tr key={entry.id}>
										<td>
											<span className="no-wrap">
												{moment(entry.timestamp.toDate()).format("MMM D")}
											</span>
										</td>
										<td>
											{entry.weightLbs} lbs.{" "}
											{entry.weightOz ? entry.weightOz + " oz" : ""}
										</td>
										<td>{entry.height} in.</td>
										<td>{entry.note}</td>
										<td className="sticky-right">
											<a href={`/growth/${entry.id}`}>
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
							{totalGrowthCount === 0 ? 0 : pageStart + 1} {" - "}
							{pageStart + measurementEntries.length} of {totalGrowthCount}
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
								disabled={pageStart + measurementEntries.length >= totalGrowthCount}
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

export default GrowthListPage;
