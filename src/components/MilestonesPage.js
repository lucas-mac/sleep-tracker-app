import {LayoutGrid} from "lucide-react";
import {WaBreadcrumb, WaBreadcrumbItem} from "@web.awesome.me/webawesome-pro/dist/react";
import Header from "./Header";

const MilestonesPage = () => {
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
					<WaBreadcrumbItem href="/milestones">Milestones</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<p>This page is under construction.</p>
			</div>
		</div>
	);
};

export default MilestonesPage;
