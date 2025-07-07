export const getRom = async (path: string): Promise<Uint8Array> => {
	const res = await fetch(path);
	if (!res.ok) throw new Error(`Failed to load ROM: ${res.status}`);
	const buffer = await res.arrayBuffer();
	return new Uint8Array(buffer);
};
export const getWasm = async (path: string): Promise<Uint8Array> => {
	const res = await fetch(path);
	if (!res.ok) throw new Error(`Failed to load WASM: ${res.status}`);
	const buffer = await res.arrayBuffer();
	return new Uint8Array(buffer);
};
