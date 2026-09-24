let lastToast = {
	message: "",
	variant: "",
	timestamp: 0,
};

export const showToast = async (message, variant = "neutral") => {
	const now = Date.now();
	const isDuplicate = lastToast.message === message && lastToast.variant === variant && now - lastToast.timestamp < 1200;

	if (isDuplicate) return;

	lastToast = {
		message,
		variant,
		timestamp: now,
	};

	const toast = document.querySelector("wa-toast");
	if (!toast) return;
	toast.placement = "top-center";
	await toast.create(message, {variant});
};
