import {MainMenu} from "./Menu";
import {useActiveChild} from "./ActiveChildContext";
import {
	WaDropdown,
	WaDropdownItem,
	WaButton,
	WaIcon,
	WaTooltip,
} from "@web.awesome.me/webawesome-pro/dist/react";

const Header = ({
	activePage,
	title,
	centerContent,
	leftContent,
	rightContent,
	showProfileTooltip = true,
}) => {
	const {children, activeChild, selectChild} = useActiveChild();

	return (
		<div className="pagination align-center space-between full-width">
			<WaDropdown>
				<WaButton
					className="btn-transparent btn-round icon-gloss"
					slot="trigger"
					id="child-switcher"
				>
					<WaIcon
						family="default"
						name={activeChild ? activeChild.avatar_icon : undefined}
						size="medium"
						color={activeChild ? activeChild.avatar_color : undefined}
					/>
				</WaButton>
				{children.length > 0 &&
					children.map((child) => (
						<WaDropdownItem
							key={child.id}
							value={child.id}
							onClick={() => selectChild(child)}
						>
							<WaIcon
								family="default"
								name={child.avatar_icon}
								size="small"
								color={child.avatar_color}
								slot="icon"
							/>
							{child.nickname}
						</WaDropdownItem>
					))}
			</WaDropdown>
			<WaTooltip
				for="child-switcher"
				placement="bottom"
			>
				{activeChild ? activeChild.nickname : "Select Child"}
			</WaTooltip>

			{leftContent || <div></div>}

			{centerContent || (
				<div className="text-center elem-group justify-center gap-sm">
					<h3>{title}</h3>
				</div>
			)}

			{rightContent || <div></div>}

			<MainMenu activePage={activePage} />
			{showProfileTooltip && <WaTooltip for="profile-button">Profile</WaTooltip>}
		</div>
	);
};

export default Header;
