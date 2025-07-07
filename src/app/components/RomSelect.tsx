import roms from "../../roms-manifest.json";

export const RomSelect = ({
	currentRom,
	onSelect,
}: {
	currentRom: string | null;
	onSelect: (rom: { name: string; file: string }) => void;
}) => {
	return (
		<ul className="pl-5 flex flex-col gap-4">
			{Object.entries(roms).map(([category, romFiles]) => (
				<li key={category} className="">
					<h3 className="font-bold">{category}</h3>
					<ul className="flex flex-col gap-1">
						{romFiles.map((rom) => (
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
	const name = rom.replace(/\[.*?\]/g, "").replace(/\s+\.ch8$/, ".ch8");
	const author = rom.match(/\[([^\]]*)\]/)?.[1] || "Unknown";
	return (
		<li key={rom}>
			<button
				type="button"
				className={`text-sm text-left p-2 hover:bg-gray-100 ${current ? "bg-gray-100" : ""}`}
				onClick={() => onSelect({ name, file: `${category}/${rom}` })}
			>
				<div className="text-sm">{name}</div>
				<div className="text-xs text-gray-500 italic">by {author}</div>
			</button>
		</li>
	);
};
