import React from "react";
import {House, CircleUser, Calendar, Sparkles, Moon, Cross, Milk, Toilet} from "lucide-react";
import {
	WaBreadcrumb,
	WaBreadcrumbItem,
	WaButton,
	WaTooltip,
	WaDrawer,
	WaIcon,
} from "@web.awesome.me/webawesome-pro/dist/react";
import {useActiveChild} from "./ActiveChildContext";

export const MainMenu = ({activePage}) => {
	const {activeChild} = useActiveChild();

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
						<House
							size={24}
							slot="start"
						/>
						Home
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
						href="/health"
						className={`align-start ${activePage === "health" ? "btn-accent" : "btn-transparent"}`}
					>
						<Cross
							size={24}
							slot="start"
						/>
						Health
					</WaButton>
					<WaButton
						href="/profile"
						className={`align-start ${activePage === "profile" ? "btn-accent" : "btn-transparent"}`}
					>
						<CircleUser
							size={24}
							slot="start"
						/>
						Profile
					</WaButton>
				</div>
			</WaDrawer>
		</div>
	);
};
