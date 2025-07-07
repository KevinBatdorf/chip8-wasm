import clsx from "clsx";
import { type Chip8Debug, ROM_LOAD_ADDRESS } from "../..";

type Props = {
	memory: Uint8Array;
	debug?: Chip8Debug;
	romData?: Uint8Array | null;
};

export function MemoryDump({ memory, romData, debug }: Props) {
	return (
		<div className="font-mono text-xs flex flex-wrap gap-1">
			{[...memory].map((byte, i) => {
				const loc = `0x${i.toString(16).padStart(4, "0")}`;
				const byteStr = byte.toString(16).padStart(2, "0");
				const defaultStyles =
					"rounded p-0.5 leading-none cursor-default select-none";
				if (!romData || !debug) {
					return (
						<span
							key={loc}
							className={`${defaultStyles} bg-gray-200 text-gray-800`}
						>
							{byteStr}
						</span>
					);
				}

				const isRomByte =
					i >= ROM_LOAD_ADDRESS && i < ROM_LOAD_ADDRESS + romData.length;
				const isPC = i === debug.getPC();

				return (
					<span
						key={loc}
						title={loc}
						className={clsx(defaultStyles, {
							"bg-gray-200 text-gray-800": !isRomByte,
							"bg-blue-200 text-gray-900": isRomByte,
							"bg-yellow-500 text-black": isPC,
						})}
					>
						{byteStr}
					</span>
				);
			})}
		</div>
	);
}
