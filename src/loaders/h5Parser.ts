import h5wasm from "h5wasm";
import { toNumberArray, getFirstDataset, normalizeZeroBased } from "@/utils";

import type { ScenePayload, GeometryPayload } from "@/types";

import { PATHS } from "@/constants";

const classifyFace = (a: number, b: number, c: number, rbe2: Set<number>, rbe3: Set<number>): "rbe2" | "rbe3" | "base" => {
	const has2 = rbe2.has(a) || rbe2.has(b) || rbe2.has(c);
	const has3 = rbe3.has(a) || rbe3.has(b) || rbe3.has(c);

	if (has2) return "rbe2";
	if (has3) return "rbe3";
	return "base";
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

		const nVerts = positions.length / 3;
		const indicesRaw = normalizeZeroBased(toNumberArray(dsSurf.value as ArrayLike<number>).map(Number), nVerts);

		if (positions.length % 3 !== 0) console.warn("positions length % 3 != 0");
		if (indicesRaw.length % 3 !== 0) console.warn("indices length % 3 != 0");

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

		const rbe2Index: number[] = [];
		const rbe3Index: number[] = [];
		const baseIndex: number[] = [];

		for (let i = 0; i < indicesRaw.length; i += 3) {
			const a = indicesRaw[i],
				b = indicesRaw[i + 1],
				c = indicesRaw[i + 2];
			const tag = classifyFace(a, b, c, rbe2Set, rbe3Set);

			if (tag === "rbe2") {
				rbe2Index.push(a, b, c);
			} else if (tag === "rbe3") {
				rbe3Index.push(a, b, c);
			} else {
				baseIndex.push(a, b, c);
			}
		}

		const indices = rbe2Index.concat(rbe3Index, baseIndex);

		const geometry: GeometryPayload = {
			name: file.name,
			positions,
			indices,
			indexGroups: {
				rbe2: [0, rbe2Index.length],
				rbe3: [rbe2Index.length, rbe3Index.length],
				base: [rbe2Index.length + rbe3Index.length, baseIndex.length],
			},
		};

		return { items: [geometry] };
	} finally {
		f.close();
	}
}
