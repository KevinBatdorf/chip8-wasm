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
		<ul className="flex flex-col gap-4 p-1 text-sm max-h-screen overflow-y-auto pr-4">
			{Object.entries(roms).map(([category, romFiles]) => (
				<li key={category} className="">
					<div className="uppercase font-bold bg-stone-200 mb-1">
						{category}
					</div>
					<ul className="flex flex-col gap-2">
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
		<li key={rom} className="max-w-40 w-full">
			<button
				type="button"
				className={`w-full text-left hover:bg-stone-100 ${current ? "bg-stone-100" : ""}`}
				onClick={() => onSelect({ name, file: `${category}/${rom}` })}
			>
				<div className="text-xs">{name}</div>
				<div className="text-xs text-gray-500 italic">by {author}</div>
			</button>
		</li>
	);
};
