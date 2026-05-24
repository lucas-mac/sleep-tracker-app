import React, {useEffect, useState} from "react";
import {collection, getDocs, orderBy, query, where, limit} from "firebase/firestore";

import {toTitleCase} from "../utils/format";

import {db} from "../firebase";
import {useActiveChild} from "./ActiveChildContext";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaButton,
	WaIcon,
} from "@web.awesome.me/webawesome-pro/dist/react";
import {LayoutGrid} from "lucide-react";
import Header from "./Header";
import moment from "moment";

const MeasurementListPage = () => {
	const [measurementEntries, setMeasurementEntries] = useState([]);
	const {activeChild, activeChildId} = useActiveChild();

	const fetchMeasurementEntries = async () => {
		if (!activeChildId) return;
		const measurementQuery = query(
			collection(db, "growth"),
			where("child_id", "==", activeChildId),
			orderBy("timestamp", "desc"),
			limit(10),
		);
		const querySnapshot = await getDocs(measurementQuery);
		const entries = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
		setMeasurementEntries(entries);
	};

	useEffect(() => {
		fetchMeasurementEntries();
	}, [activeChildId]);

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
					<table className="growth-table scroll">
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
						<tfoot>
							<tr>
								<td colSpan="5">Total: {measurementEntries.length}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	);
};

export default MeasurementListPage;
