import React, {useEffect, useState} from "react";
import {collection, getDocs, orderBy, query, where} from "firebase/firestore";
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
	WaIcon,
} from "@web.awesome.me/webawesome-pro/dist/react";
import {House} from "lucide-react";
import Header from "./Header";
import moment from "moment";

const DiaperListPage = () => {
	const [diaperEntries, setDiaperEntries] = useState([]);
	const {activeChild, activeChildId} = useActiveChild();

	const fetchDiaperEntries = async () => {
		if (!activeChildId) return;
		const diaperQuery = query(
			collection(db, "diaper"),
			where("child_id", "==", activeChildId),
			orderBy("timestamp", "desc"),
		);
		const querySnapshot = await getDocs(diaperQuery);
		const entries = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
		setDiaperEntries(entries);
	};

	useEffect(() => {
		fetchDiaperEntries();
	}, [activeChildId]);

	return (
		<div className="page">
			<Header
				activePage="diapers"
				title="Diapers"
			/>

			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/diapers`}>
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
					<table className="diaper-table scroll">
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
											<div className="elem-group gap-x flex-wrap">
												<span className="no-wrap">
													{moment(entry.timestamp.toDate()).format(
														"h:mm a",
													)}
												</span>
												<small className="text-gloss text-uppercase">
													{moment(entry.timestamp.toDate()).format(
														"MMM D",
													)}
												</small>
											</div>
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
						<tfoot>
							<tr>
								<td colSpan="6">Total: {diaperEntries.length}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	);
};

export default DiaperListPage;
