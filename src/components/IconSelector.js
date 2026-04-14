import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import "./IconSelector.css";

const IconSelector = ({value, onChange, avatarColor}) => {
	const icons = [
		"cat",
		"dog",
		"cow",
		"crow",
		"dove",
		"dragon",
		"fish-fins",
		"frog",
		"hippo",
		"horse",
		"otter",
		"spider",
		"rocket",
		"user-astronaut",
		"jet-fighter-up",
		"plane",
	];

	return (
		<div class="full-width">
			<label class="large">Avatar Icon</label>
			<div className="icon-selector grid-auto column gap-lg">
				{icons.map((icon) => (
					<WaIcon
						key={icon}
						name={icon}
						family="default"
						size="large"
						className="icon-option"
						style={{
							cursor: "pointer",
							border:
								value === icon
									? "2px solid var(--solvent)"
									: "2px solid transparent",
						}}
						onClick={() => onChange(icon)}
					/>
				))}
			</div>
		</div>
	);
};

export default IconSelector;
