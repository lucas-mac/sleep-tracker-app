import WaIcon from "@web.awesome.me/webawesome-pro/dist/react/icon";
import WaTooltip from "@web.awesome.me/webawesome-pro/dist/react/tooltip";
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
		"sailboat",
		"apple-whole",
		"carrot",
		"leaf",
		"feather",
		"lemon",
		"seedling",
		"pepper-hot",
		"pizza-slice",
		"cookie-bite",
		"ice-cream",
		"ghost",
		"robot",
		"snowman",
		"gamepad",
		"chess-bishop",
		"chess-knight",
		"chess-rook",
		"hat-wizard",
		"wand-sparkles",
		"bolt",
		"fire",
		"sun",
		"clover",
		"heart",
		"skull",
	];

	return (
		<div class="full-width">
			<label class="large">Avatar Icon</label>
			<div className="icon-selector grid-auto column gap-lg">
				{icons.map((icon) => (
					<div className="icon-option-wrapper">
						<WaTooltip
							key={icon}
							content={icon}
							for={`icon-${icon}`}
						>
							{icon
								.split("-")
								.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
								.join(" ")}
						</WaTooltip>
						<WaIcon
							id={`icon-${icon}`}
							name={icon}
							family="default"
							className={
								value === icon ? "icon-option--selected icon-option" : "icon-option"
							}
							onClick={() => onChange(icon)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default IconSelector;
