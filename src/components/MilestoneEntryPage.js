import {useParams} from "react-router-dom";
import {LayoutGrid} from "lucide-react";
import {WaBreadcrumb, WaBreadcrumbItem} from "@web.awesome.me/webawesome-pro/dist/react";
import Header from "./Header";

const MilestoneEntryPage = () => {
	const {entryId} = useParams();
	return (
		<div className="page">
			<Header
				activePage="milestones"
				title={entryId ? "Edit Milestone" : "Add Milestone"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<LayoutGrid size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/milestone/${entryId}`}>Milestone</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<p>This page is under construction.</p>
			</div>
		</div>
	);
};

export default MilestoneEntryPage;
