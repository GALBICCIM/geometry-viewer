export const getFirstDataset = (file: any, candidates: string[]) => {
	for (const p of candidates) {
		try {
			const obj = file.get(p);

			if (obj && "value" in obj) return obj;
		} catch {
			/* try next */
		}
	}

	return null;
};
