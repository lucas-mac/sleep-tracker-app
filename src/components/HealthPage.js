// illnesses [cold, fever, etc.], medications, temperature, etc.
import {useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {House} from "lucide-react";
import {WaBreadcrumb, WaBreadcrumbItem} from "@web.awesome.me/webawesome-pro/dist/react";

const HealthPage = () => {
	const {entryId} = useParams();
	return (
		<div className="page">
			<div className="page-meta">
				<h1>{entryId ? "Edit Health" : "Add Health"}</h1>
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/health/${entryId}`}>Health</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<p>This page is under construction.</p>
			</div>
		</div>
	);
};

export default HealthPage;