// breast, bottle, solids

import {useParams} from "react-router-dom";
import {House} from "lucide-react";
import {WaBreadcrumb, WaBreadcrumbItem} from "@web.awesome.me/webawesome-pro/dist/react";
import Header from "./Header";

const FeedPage = () => {
	const {entryId} = useParams();
	return (
		<div className="page">
			<Header
				activePage="feed"
				title={entryId ? "Edit Feed" : "Add Feed"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/feed/${entryId}`}>Feed</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<p>This page is under construction.</p>
			</div>
		</div>
	);
};

export default FeedPage;