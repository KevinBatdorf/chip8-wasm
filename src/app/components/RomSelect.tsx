import roms from "../../roms-manifest.json";

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
	const name = rom
		.replace(/\[.*?\]/g, "")
		.replaceAll("-", " ")
		.replace(/^\d+/, "")
		.replace(".ch8", "")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
	return (
		<li key={rom} className="w-full group p-1">
			<button
				type="button"
				className={`w-full pr-3 text-left ring-stone-900 group-hover:bg-stone-900 group-hover:text-stone-50 group-hover:ring-5 ${current ? "bg-stone-900 ring-5 text-stone-50" : ""}`}
				onClick={() => onSelect({ name, file: `${category}/${rom}` })}
			>
				<div className="text-xs">{name}</div>
			</button>
		</li>
	);
};
