import clsx from "clsx";
import manifest from "../../roms-manifest.json";
import type { RomEntry } from "../../types";
import { useChip8Store } from "../state/chip8";

const roms = manifest as Record<string, RomEntry[]>;

export const RomSelect = ({
	currentRom,
	onSelect,
}: {
	currentRom: RomEntry | null;
	onSelect: (rom: RomEntry) => void;
}) => {
	const { favorites } = useChip8Store();
	return (
		<ul className="flex flex-col">
			<li className="">
				<div className="uppercase font-bold bg-stone-200 px-1 pt-4">
					Favorites
				</div>
				{favorites?.length > 0 ? (
					<ul className="flex flex-col">
						{favorites.map((rom) => {
							const romEntry = Object.values(roms)
								.flat()
								.find((r) => r.name === rom);
							if (!romEntry) return null;
							return (
								<RomButton
									key={rom}
									rom={romEntry}
									current={romEntry.path === currentRom?.path}
									onSelect={onSelect}
								/>
							);
						})}
					</ul>
				) : (
					<div className="text-stone-500 italic px-1 py-2">
						No favorites yet
					</div>
				)}
			</li>

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
	const { favorites, toggleFavorite } = useChip8Store();
	const date = rom?.releaseDate
		? new Date(rom.releaseDate).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null;

	return (
		<li key={rom.path} className="w-full group relative">
			<button
				type="button"
				className={`w-full p-1 pr-3 text-left ring-stone-900 group-hover:bg-stone-900 group-hover:text-stone-50 ${current ? "bg-stone-900 text-stone-50" : ""}`}
				onClick={() => onSelect(rom)}
			>
				<div className="text-sm">{rom.name}</div>
				<div className="text-xs text-stone-500 italic">{date}</div>
			</button>
			<button
				type="button"
				className={clsx(
					"hover:text-stone-200 h-full absolute top-0 right-0 p-1 group-hover:bg-stone-900 z-20 opacity-0 group-hover:opacity-100 ",
					{
						"text-stone-500":
							!current && !favorites.some((f) => f === rom.name),
						"text-stone-200": current || favorites.some((f) => f === rom.name),
					},
				)}
				onClick={(e) => {
					e.stopPropagation();
					toggleFavorite(rom);
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-4"
				>
					<title>
						{favorites.some((f) => f === rom.name) ? "Unfavorite" : "Favorite"}
					</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						className={clsx({
							"fill-stone-200": favorites.some((f) => f === rom.name),
						})}
						d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
					/>
				</svg>

				<span className="sr-only">
					{favorites.some((f) => f === rom.name) ? "Unfavorite" : "Favorite"}
				</span>
			</button>
		</li>
	);
};
