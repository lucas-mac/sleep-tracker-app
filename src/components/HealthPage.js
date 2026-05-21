// illnesses [cold, fever, etc.], medications, temperature, etc.
import {useParams} from "react-router-dom";
import {House} from "lucide-react";
import {WaBreadcrumb, WaBreadcrumbItem} from "@web.awesome.me/webawesome-pro/dist/react";
import Header from "./Header";

const HealthPage = () => {
	const {entryId} = useParams();
	return (
		<div className="page">
			<Header
				activePage="health"
				title={entryId ? "Edit Health" : "Add Health"}
			/>
			<div className="page-meta">
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