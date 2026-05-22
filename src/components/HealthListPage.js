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

const HealthListPage = () => {
	const [healthEntries, setHealthEntries] = useState([]);
	const {activeChild, activeChildId} = useActiveChild();

	const fetchHealthEntries = async () => {
		if (!activeChildId) return;
		const healthQuery = query(
			collection(db, "health"),
			where("child_id", "==", activeChildId),
			orderBy("timestamp", "desc"),
			limit(10),
		);
		const querySnapshot = await getDocs(healthQuery);
		const entries = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
		setHealthEntries(entries);
	};

	useEffect(() => {
		fetchHealthEntries();
	}, [activeChildId]);

	return (
		<div className="page">
			<Header
				activePage="health"
				title="Health"
			/>

			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/health-history/`}>
						{activeChild ? activeChild.nickname + "'s" : "Select Child for"} Health
					</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaButton
					className="btn-gloss"
					href="/health/"
				>
					<WaIcon
						family="default"
						name="plus"
						slot="start"
					/>
					Add Health Entry
				</WaButton>
				<div className="table-scroll-wrapper">
					<table className="health-table scroll">
						<thead>
							<tr>
								<th>Time</th>
								<th>Type</th>
								<th>Record</th>
								<th>Note</th>
								<th className="sticky-right"></th>
							</tr>
						</thead>
						<tbody>
							{healthEntries.length === 0 ? (
								<tr>
									<td colSpan="5">No health entries found</td>
								</tr>
							) : (
								healthEntries.map((entry) => (
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
										<td>
											{entry.type === "medication" ? (
												<div>
													{entry.amount} {entry.amount_unit} {}
													{entry.medication_name}
												</div>
											) : null}
											{entry.type === "temperature" ? (
												<div>
													{entry.temperature}°{entry.temperature_unit}
												</div>
											) : null}
										</td>
										<td>{entry.note}</td>
										<td className="sticky-right">
											<a href={`/health/${entry.id}`}>
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
								<td colSpan="6">Total: {healthEntries.length}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	);
};

export default HealthListPage;
