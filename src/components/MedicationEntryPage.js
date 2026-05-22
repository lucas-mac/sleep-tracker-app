// illnesses [cold, fever, etc.], medications, temperature, etc.
import {useParams} from "react-router-dom";
import {House} from "lucide-react";
import {WaBreadcrumb, WaBreadcrumbItem} from "@web.awesome.me/webawesome-pro/dist/react";
import Header from "./Header";

const MedicationEntryPage = () => {
	const {entryId} = useParams();
	return (
		<div className="page">
			<Header
				activePage="medications"
				title={entryId ? "Edit Health" : "Add Health"}
			/>
			<div className="page-meta">
				<WaBreadcrumb>
					<WaBreadcrumbItem href="/">
						<House size={24} />
					</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/medications/`}>Medications</WaBreadcrumbItem>
					<WaBreadcrumbItem href={`/medication/${entryId}`}>Medication</WaBreadcrumbItem>
				</WaBreadcrumb>
			</div>
			<div className="page-content">
				<p>This page is under construction.</p>
			</div>
		</div>
	);
};

export default MedicationEntryPage;
