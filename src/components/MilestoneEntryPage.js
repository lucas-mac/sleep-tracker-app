import {useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {House} from "lucide-react";
import {WaBreadcrumb, WaBreadcrumbItem} from "@web.awesome.me/webawesome-pro/dist/react";

const MilestoneEntryPage = () => {
	const {entryId} = useParams();
	return (
		<div className="page">
			<div className="page-meta">
				<h1>{entryId ? "Edit Milestone" : "Add Milestone"}</h1>
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
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
