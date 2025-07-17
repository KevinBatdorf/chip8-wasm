import manifest from "../../roms-manifest.json";
import type { RomEntry } from "../../types";

const roms = manifest as Record<string, RomEntry[]>;

export const RomSelect = ({
	currentRom,
	onSelect,
}: {
	currentRom: RomEntry | null;
	onSelect: (rom: RomEntry) => void;
}) => {
	return (
		<ul className="flex flex-col">
			{Object.entries(roms).map(([category, romFiles]) => (
				<li key={category} className="">
					<div className="uppercase font-bold bg-stone-200 px-1 pt-4">
						{category}
					</div>
					<ul className="flex flex-col">
						{romFiles.map((rom) => (
							<RomButton
								current={rom.path === currentRom?.path}
								key={rom.path}
								rom={rom}
								onSelect={onSelect}
							/>
						))}
					</ul>
				</li>
			))}
		</ul>
	);
};

const RomButton = ({
	rom,
	current = false,
	onSelect,
}: {
	rom: RomEntry;
	current?: boolean;
	onSelect: (rom: RomEntry) => void;
}) => {
	return (
		<li key={rom.path} className="w-full">
			<button
				type="button"
				className={`w-full p-1 pr-3 text-left ring-stone-900 group-hover:bg-stone-900 hover:text-stone-50 hover:bg-stone-900 ${current ? "bg-stone-900 text-stone-50" : ""}`}
				onClick={() => onSelect(rom)}
			>
				<div className="text-xs">{rom.name}</div>
			</button>
		</li>
	);
};
