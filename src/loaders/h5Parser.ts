import h5wasm from "h5wasm";
import { toNumberArray, getFirstDataset, normalizeZeroBased } from "@/utils";

import type { ScenePayload, GeometryPayload } from "@/types";

import { PATHS } from "@/constants";

const triColorFor = (a: number, b: number, c: number, rbe2: Set<number>, rbe3: Set<number>) => {
	const has2 = rbe2.has(a) || rbe2.has(b) || rbe2.has(c);
	const has3 = rbe3.has(a) || rbe3.has(b) || rbe3.has(c);

	if (has2) return [1, 0.35, 0.35];
	if (has3) return [0.35, 0.35, 1];
	return [1, 1, 1];
};

export async function h5Parser(file: File): Promise<ScenePayload> {
	const { FS } = await h5wasm.ready;
	const ab = await file.arrayBuffer();
	const vname = `/tmp/${file.name || "data.h5"}`;

	try {
		FS.mkdir("/tmp");
	} catch (e) {
		console.error(e);
	}

	FS.writeFile(vname, new Uint8Array(ab));
	const f = new h5wasm.File(vname, "r");

	try {
		const dsCoords = getFirstDataset(f, PATHS.coords);
		if (!dsCoords) throw new Error("HDF5: 'coords' dataset not found.");
		const coords = dsCoords.value as ArrayLike<number>;
		const positions = toNumberArray(coords);

		const dsSurf = getFirstDataset(f, PATHS.surfaces);
		if (!dsSurf) throw new Error("HDF5: 'surfaces' dataset not found.");

		let indices = toNumberArray(dsSurf.value as ArrayLike<number>).map(Number);
		const nVerts = positions.length / 3;
		indices = normalizeZeroBased(indices, nVerts);

		if (positions.length % 3 !== 0) console.warn("positions length % 3 != 0");
		if (indices.length % 3 !== 0) console.warn("indices length % 3 != 0");

		const rbe2Set = new Set(
			normalizeZeroBased(
				(getFirstDataset(f, PATHS.rbe2)?.value ? toNumberArray(getFirstDataset(f, PATHS.rbe2)!.value as ArrayLike<number>) : []).map(
					Number
				),
				nVerts
			)
		);
		const rbe3Set = new Set(
			normalizeZeroBased(
				(getFirstDataset(f, PATHS.rbe3)?.value ? toNumberArray(getFirstDataset(f, PATHS.rbe3)!.value as ArrayLike<number>) : []).map(
					Number
				),
				nVerts
			)
		);

		const newPositions: number[] = [];
		const newIndices: number[] = [];
		const newVertexColors: number[] = []; // RGB(혹은 RGBA)

		for (let i = 0; i < indices.length; i += 3) {
			const a = indices[i],
				b = indices[i + 1],
				c = indices[i + 2];
			const color = triColorFor(a, b, c, rbe2Set, rbe3Set); // [r,g,b]

			const base = newPositions.length / 3;

			for (const v of [a, b, c]) {
				newPositions.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
				newVertexColors.push(color[0], color[1], color[2]);
			}

			newIndices.push(base, base + 1, base + 2);
		}

		const geom: GeometryPayload = {
			name: file.name,
			positions: newPositions,
			indices: newIndices,
			vertexColors: newVertexColors,
		};

		return { items: [geom] };
	} finally {
		f.close();
	}
}
