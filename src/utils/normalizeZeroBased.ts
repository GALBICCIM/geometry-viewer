export const normalizeZeroBased = (arr: number[], vertexCount: number): number[] => {
	if (arr.length === 0) return arr;

	const min = Math.min(...arr);
	const max = Math.max(...arr);
	const looksOneBased = min === 1 && max <= vertexCount;

	return looksOneBased ? arr.map((v) => v - 1) : arr;
};
