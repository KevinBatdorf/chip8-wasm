import { useEffect, useState } from "react";

const getRom = async (path: string): Promise<Uint8Array> => {
	const res = await fetch(path);
	if (!res.ok) throw new Error(`Failed to load ROM: ${res.status}`);
	const buffer = await res.arrayBuffer();
	return new Uint8Array(buffer);
};

export default function App() {
	const [rom, setRom] = useState<Uint8Array | null>(null);

	useEffect(() => {
		getRom("/roms/programs/IBM Logo.ch8").then(setRom);
	}, []);

	return (
		<div style={{ padding: "2rem", fontFamily: "monospace" }}>
			<h1>CHIP-8 Emulator</h1>
			<p>{rom ? `ROM loaded: ${rom.length} bytes` : "Loading ROM..."}</p>

			{rom && (
				<pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
					{Array.from(rom)
						.map((b) => b.toString(16).padStart(2, "0"))
						.join(" ")}
				</pre>
			)}
		</div>
	);
}
