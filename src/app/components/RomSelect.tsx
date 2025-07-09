import roms from "../../roms-manifest.json";

// Roms that seemt o be duplicates or not useful
const denyList = ["Sirpinski [Sergey Naydenov, 2010].ch8"];

export const RomSelect = ({
	currentRom,
	onSelect,
}: {
	currentRom: string | null;
	onSelect: (rom: { name: string; file: string }) => void;
}) => {
	return (
		<ul className="flex flex-col">
			{Object.entries(roms).map(([category, romFiles]) => (
				<li key={category} className="">
					<div className="uppercase font-bold bg-stone-200 px-1 pt-4">
						{category}
					</div>
					<ul className="flex flex-col">
						{romFiles
							.filter((rom) => rom.endsWith(".ch8"))
							.filter((rom) => !denyList.includes(rom))
							.map((rom) => (
								<RomButton
									current={`${category}/${rom}` === currentRom}
									key={rom}
									rom={rom}
									category={category}
									onSelect={onSelect}
								/>
							))}
					</ul>
				</li>
			))}
		</ul>
	);
};

// Some inconsistent upstream naming
const romOverrides: Record<string, string> = {
	"Lunar Lander (Udo Pernisz, 1979).ch8":
		"Lunar Lander [Udo Pernisz, 1979].ch8",
	"Mastermind FourRow (Robert Lindley, 1978).ch8":
		"Mastermind FourRow [Robert Lindley, 1978].ch8",
} as const;
const RomButton = ({
	rom,
	current = false,
	category,
	onSelect,
}: {
	rom: string;
	current?: boolean;
	category: string;
	onSelect: (rom: { name: string; file: string }) => void;
}) => {
	const romName = romOverrides[rom] || rom;
	const name = romName.replace(/\[.*?\]/g, "").replace(/\s+\.ch8$/, ".ch8");
	const author = romName.match(/\[([^\]]*)\]/)?.[1] || "Unknown";
	return (
		<li key={rom} className="max-w-46 w-full group p-1">
			<button
				type="button"
				className={`w-full pr-3 text-left ring-stone-900 group-hover:bg-stone-900 group-hover:text-stone-50 group-hover:ring-5 ${current ? "bg-stone-900 ring-5 text-stone-50" : ""}`}
				onClick={() => onSelect({ name, file: `${category}/${rom}` })}
			>
				<div className="text-xs">{name}</div>
				<div className="text-xs text-stone-400 italic">by {author}</div>
			</button>
		</li>
	);
};
