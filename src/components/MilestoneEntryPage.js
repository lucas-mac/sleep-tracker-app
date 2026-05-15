import WaBreadcrumb from "@web.awesome.me/webawesome-pro/dist/react/breadcrumb";
import WaBreadcrumbItem from "@web.awesome.me/webawesome-pro/dist/react/breadcrumb-item";

import {House} from "lucide-react";

const MilestoneEntryPage = () => {
	return (
		<div className="milestone-page page">
			<div className="page-meta">
				<h1>Milestones</h1>
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href="/milestones">Milestones</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<p>This page is under construction. Please check back later!</p>
		</div>
	);
};

export default MilestoneEntryPage;
