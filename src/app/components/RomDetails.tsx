import type { RomEntry } from "../../types";

type Props = {
	rom: RomEntry | null;
};

export const RomDetails = ({ rom }: Props) => {
	if (!rom)
		return (
			<div>
				<h2 className="text-lg">Select a ROM</h2>
			</div>
		);

	return (
		<div>
			<h2 className="text-lg">{rom ? rom.name : "Select a ROM"}</h2>
			<div>
				By:{" "}
				{rom?.authors && rom.authors.length > 0
					? rom.authors
							.map((author) =>
								author.url ? (
									<a
										key={author.name}
										href={author.url}
										className="underline hover:text-blue-600 inline-flex items-center gap-1"
										target="_blank"
										rel="noopener"
									>
										<span>{author.name}</span>
										<span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={1.5}
												stroke="currentColor"
												className="size-3"
											>
												<title>External Link</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
												/>
											</svg>
										</span>
									</a>
								) : (
									<span key={author.name}>{author.name}</span>
								),
							)
							.reduce((acc, el, i) => {
								if (i > 0) acc.push(", ");
								acc.push(el);
								return acc;
							}, [] as React.ReactNode[])
					: "Unknown"}
			</div>
		</div>
	);
};
