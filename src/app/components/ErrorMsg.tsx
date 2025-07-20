import { useEffect, useState } from "react";
import type { Chip8Engine } from "../../types";

type Props = { chip8: Chip8Engine | null };

export const ErrorMsg = ({ chip8 }: Props) => {
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!chip8) return;
		let rafId: number;
		const check = () => {
			setError(chip8.getError());
			rafId = requestAnimationFrame(check);
		};
		rafId = requestAnimationFrame(check);
		return () => cancelAnimationFrame(rafId);
	}, [chip8]);

	if (!error) return null;

	return <div className="text-red-500">{error}</div>;
};
