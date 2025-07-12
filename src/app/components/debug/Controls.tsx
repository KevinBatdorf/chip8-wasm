import clsx from "clsx";
import { useEffect, useState } from "react";
import type { Chip8Engine } from "../../../runtime/engine";

type Props = {
	chip8: Chip8Engine | null;
	rom?: { name: string; file: string } | null;
};

export const Controls = ({ chip8, rom }: Props) => {
	const [running, setRunning] = useState(false);
	const handleReset = () => {
		chip8?.reset();
	};
	const togglePlay = () => {
		if (chip8?.isRunning()) {
			chip8?.pause();
			setRunning(false);
			return;
		}
		chip8?.start();
		setRunning(true);
	};
	const handleStep = () => {
		chip8?.step();
	};
	useEffect(() => {
		const id = setTimeout(() => {
			setRunning((rom && chip8?.isRunning()) ?? false);
		}, 32);
		return () => clearTimeout(id);
	}, [chip8, rom]);

	return (
		<div className="flex flex-wrap gap-2">
			<button
				type="button"
				className={clsx(
					"px-2 py-1 text-stone-300 ring ring-stone-500 rounded hover:bg-stone-700",
					{
						"bg-stone-700": running,
					},
				)}
				onClick={togglePlay}
			>
				{running ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-6"
					>
						<title>Pause</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15.75 5.25v13.5m-7.5-13.5v13.5"
						/>
					</svg>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-6"
					>
						<title>Play</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
						/>
					</svg>
				)}
			</button>
			<button
				type="button"
				className="px-2 py-1 text-stone-300 ring ring-stone-500 rounded hover:bg-stone-700"
				onClick={handleReset}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-6"
				>
					<title>Reset</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
					/>
				</svg>
			</button>
			<button
				type="button"
				className="px-2 py-1 text-stone-300 ring ring-stone-500 rounded hover:bg-stone-700"
				onClick={handleStep}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-6"
				>
					<title>Step</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
					/>
				</svg>
			</button>
		</div>
	);
};
