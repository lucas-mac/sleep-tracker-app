import React, {useEffect, useState} from "react";
import {collection, getDocs, orderBy, query, where} from "firebase/firestore";

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

const FeedListPage = () => {
	const [feedEntries, setFeedEntries] = useState([]);
	const {activeChild, activeChildId} = useActiveChild();

	const fetchFeedEntries = async () => {
		if (!activeChildId) return;
		const feedQuery = query(
			collection(db, "feed"),
			where("child_id", "==", activeChildId),
			orderBy("timestamp", "desc"),
		);
		const querySnapshot = await getDocs(feedQuery);
		const entries = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
		setFeedEntries(entries);
	};

	useEffect(() => {
		fetchFeedEntries();
	}, [activeChildId]);

	return (
		<div className="page">
			<Header
				activePage="feeds"
				title="Feeds"
			/>

			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/feeds`}>
						{activeChild ? activeChild.nickname + "'s" : "Select Child for"} Feeds
					</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<WaButton
					className="btn-gloss"
					href="/feed/"
				>
					<WaIcon
						family="default"
						name="plus"
						slot="start"
					/>
					Add Feed
				</WaButton>
				<div className="table-scroll-wrapper">
					<table className="feed-table scroll">
						<thead>
							<tr>
								<th>Date</th>
								<th>Type</th>
								<th>Amount</th>
								<th>Note</th>
								<th className="sticky-right"></th>
							</tr>
						</thead>
						<tbody>
							{feedEntries.length === 0 ? (
								<tr>
									<td colSpan="5">No feed entries found</td>
								</tr>
							) : (
								feedEntries.map((entry) => (
									<tr key={entry.id}>
										<td>{entry.timestamp.toDate().toLocaleString()}</td>
										<td>{toTitleCase(entry.type)}</td>
										<td>
											{entry.type === "breast"
												? entry.duration + " mins"
												: entry.amount + " ml"}
										</td>
										<td>{entry.note}</td>
										<td className="sticky-right">
											<a href={`/feed/${entry.id}`}>
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
								<td colSpan="5">Total: {feedEntries.length}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	);
};

export default FeedListPage;
