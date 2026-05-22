import React from "react";
import {
	LayoutGrid,
	CircleUser,
	Calendar,
	Sparkles,
	Moon,
	Cross,
	Milk,
	Toilet,
	PencilRuler,
	LogOut,
} from "lucide-react";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaButton,
	WaTooltip,
	WaDrawer,
	WaIcon,
} from "@web.awesome.me/webawesome-pro/dist/react";
import {useActiveChild} from "./ActiveChildContext";
import {auth} from "../firebase";
import {useNavigate} from "react-router-dom";

export const MainMenu = ({activePage}) => {
	const {activeChild} = useActiveChild();
	const navigate = useNavigate();

	return (
		<div>
			<WaButton
				className="btn-transparent btn-round icon-gloss"
				onClick={() => (document.getElementById("site-menu").open = true)}
			>
				<WaIcon
					family="default"
					name="bars"
					size={36}
				/>
			</WaButton>
			<WaDrawer
				id="site-menu"
				placement="end"
				className="has-bg"
			>
				<div className="column">
					<WaButton
						href="/"
						className={`align-start ${activePage === "timeline" ? "btn-accent" : "btn-transparent"}`}
					>
						<LayoutGrid
							size={24}
							slot="start"
						/>
						Home
					</WaButton>
					<WaButton
						href="/sleeps"
						className={`align-start ${activePage === "sleep" ? "btn-accent" : "btn-transparent"}`}
						disabled
					>
						<Moon
							size={24}
							slot="start"
						/>
						Sleep
					</WaButton>
					<WaButton
						href="/diapers"
						className={`align-start ${activePage === "diapers" ? "btn-accent" : "btn-transparent"}`}
					>
						<Toilet
							size={24}
							slot="start"
						/>
						Diapers
					</WaButton>
					<WaButton
						href="/feeds"
						className={`align-start ${activePage === "feed" ? "btn-accent" : "btn-transparent"}`}
					>
						<Milk
							size={24}
							slot="start"
						/>
						Feedings
					</WaButton>
					<WaButton
						href="/measurements"
						className={`align-start ${activePage === "measurements" ? "btn-accent" : "btn-transparent"}`}
					>
						<PencilRuler
							size={24}
							slot="start"
						/>
						Measurements
					</WaButton>
					<WaButton
						hidden="false"
						href="/milestones"
						className={`align-start ${activePage === "milestones" ? "btn-accent" : "btn-transparent"}`}
					>
						<Sparkles
							size={24}
							slot="start"
						/>
						Milestones
					</WaButton>
					<WaButton
						href="/health-history"
						className={`align-start ${activePage === "health" ? "btn-accent" : "btn-transparent"}`}
					>
						<Cross
							size={24}
							slot="start"
						/>
						Health
					</WaButton>
				</div>

				<WaButton
					href="/profile"
					className={`align-start full-width ${activePage === "profile" ? "btn-accent" : "btn-transparent"}`}
					slot="footer"
				>
					<CircleUser
						size={24}
						slot="start"
					/>
					Profile
				</WaButton>
				<WaButton
					onClick={() => {
						auth.signOut();
						navigate("/");
					}}
					className="align-start btn-transparent full-width"
					slot="footer"
				>
					<LogOut
						size={24}
						slot="start"
					/>
					Logout
				</WaButton>
			</WaDrawer>
		</div>
	);
};
