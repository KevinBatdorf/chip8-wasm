export const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(value, max));

export const getHighestZIndex = () => {
	const windows = document.querySelectorAll(".floating-window");
	const highestZIndex = Math.max(
		...Array.from(windows).map((w) => {
			const zIndex = window.getComputedStyle(w).zIndex;
			return zIndex === "auto" ? 0 : Number.parseInt(zIndex, 10);
		}),
	);
	return highestZIndex;
};
