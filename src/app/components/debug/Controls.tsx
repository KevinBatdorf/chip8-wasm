import type { Chip8Engine } from "../../../runtime/engine";

type Props = { chip8: Chip8Engine | null };

export const Controls = ({ chip8 }: Props) => {
	const handleReset = () => {
		chip8?.reset();
	};
	const handlePause = () => {
		chip8?.pause();
	};
	const handleStep = () => {
		chip8?.step();
	};
	return (
		<div className="flex gap-2">
			<button
				type="button"
				className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
				onClick={handleReset}
			>
				Reset
			</button>
			<button
				type="button"
				className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
				onClick={handlePause}
			>
				Pause
			</button>
			<button
				type="button"
				className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
				onClick={handleStep}
			>
				Step
			</button>
		</div>
	);
};
