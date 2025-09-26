import h5wasm from "h5wasm";
import { toNumberArray, getFirstDataset, normalizeZeroBased } from "@/utils";

import type { ScenePayload, GeometryPayload } from "@/types";

import { PATHS } from "@/constants/h5";

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

		const vertexColors: number[] = Array.from({ length: nVerts }, (_, i) =>
			rbe2Set.has(i) ? [1, 1, 0] : rbe3Set.has(i) ? [0, 0, 1] : [0.9, 0.9, 0.9]
		).flat();

		const geom: GeometryPayload = {
			name: file.name, // 하나의 메시로 내보냄
			positions,
			indices,
			vertexColors,
		};

		return { items: [geom] };
	} finally {
		f.close();
	}
}
