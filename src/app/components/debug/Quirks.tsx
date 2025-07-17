import clsx from "clsx";
import { useEffect, useState } from "react";
import type { Chip8Debug, Chip8Engine, RomEntry } from "../../../types";

type Props = {
	chip8: Chip8Engine | null;
	debug: Chip8Debug | null;
	rom: RomEntry | null;
};

const qrks = {
	vfOrderQuirks: "VF",
	loadStoreQuirks: "MEM",
	vBlankQuirks: "DSP",
	clipQuirks: "CLP",
	shiftQuirks: "SHFT",
	jumpQuirks: "JMP",
};

export const Quirks = ({ chip8, debug, rom }: Props) => {
	const [opts, setOpts] = useState({});

	const toggleOption = (option: keyof typeof opts) => {
		if (!chip8 || !debug || !rom) return;
		const freshOpts = chip8.getOptions();
		const newOptions = {
			...freshOpts,
			[option]: opts[option] ? 0 : 1,
		};
		debug.setOptions(newOptions);
		setOpts(newOptions);
	};

	useEffect(() => {
		if (!chip8 || !debug || !rom) return;
		const id = setTimeout(() => {
			setOpts(chip8.getOptions());
		}, 32);
		return () => clearTimeout(id);
	}, [chip8, debug, rom]);

	return (
		<div className="flex flex-wrap gap-2">
			{Object.entries(qrks).map(([key, label]) => (
				<button
					key={key}
					type="button"
					disabled={!chip8 || !rom}
					className={clsx(
						"px-1 py-px text-stone-300 ring rounded hover:bg-stone-700 text-xs",
						{
							"ring-lime-500": opts[key as keyof typeof opts] === 1,
							"ring-stone-500": opts[key as keyof typeof opts] === 0,
						},
					)}
					onClick={() => toggleOption(key as keyof typeof opts)}
				>
					{label}
				</button>
			))}
		</div>
	);
};
