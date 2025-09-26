import h5wasm from "h5wasm";
import { toNumberArray, getFirstDataset } from "@/utils";

import type { ScenePayload, GeometryPayload } from "@/types";

import { PATHS } from "@/constants/h5";

// 보조: 0/1-based를 자동 판별해서 0-based로 돌려놓기
function normalizeToZeroBased(arr: number[], vertexCount: number): number[] {
	if (arr.length === 0) return arr;
	const min = Math.min(...arr);
	const max = Math.max(...arr);
	// 흔한 패턴: 1..N 범위에 있고 정점 수를 넘지 않으면 1-based로 간주
	const looksOneBased = min === 1 && max <= vertexCount;
	return looksOneBased ? arr.map((v) => v - 1) : arr;
}

export async function h5Parser(file: File): Promise<ScenePayload> {
	const { FS } = await h5wasm.ready;
	const ab = await file.arrayBuffer();
	const vname = `/tmp/${file.name || "data.h5"}`;

	try {
		FS.mkdir("/tmp");
	} catch {
		/* exists */
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

		let indices = toNumberArray(dsSurf.value as ArrayLike<number>);
		indices = Array.from(indices, (v) => (typeof v === "bigint" ? Number(v) : v));

		const nVerts = positions.length / 3;

		// 면 인덱스 0-based 보정
		{
			const minI = Math.min(...indices);
			const maxI = Math.max(...indices);
			if (minI === 1 && maxI <= nVerts) indices = indices.map((v) => v - 1);
		}

		if (positions.length % 3 !== 0) console.warn("positions length % 3 != 0");
		if (indices.length % 3 !== 0) console.warn("indices length % 3 != 0");

		// --- RBE2/RBE3 노드 인덱스 읽기 및 0-based 정규화 ---
		const dsRbe2 = getFirstDataset(f, PATHS.rbe2);
		const dsRbe3 = getFirstDataset(f, PATHS.rbe3);

		let rbe2Nodes = dsRbe2?.value ? toNumberArray(dsRbe2.value as ArrayLike<number>) : [];
		let rbe3Nodes = dsRbe3?.value ? toNumberArray(dsRbe3.value as ArrayLike<number>) : [];

		// BigInt → number 안전 변환(이미 toNumberArray가 처리해도 한 번 더 방어)
		rbe2Nodes = rbe2Nodes.map((v) => (typeof v === "bigint" ? Number(v) : v));
		rbe3Nodes = rbe3Nodes.map((v) => (typeof v === "bigint" ? Number(v) : v));

		// ▶︎ 핵심: RBE 노드도 0-based로 정규화
		rbe2Nodes = normalizeToZeroBased(rbe2Nodes, nVerts);
		rbe3Nodes = normalizeToZeroBased(rbe3Nodes, nVerts);

		// 성능을 위해 Set 사용
		const rbe2Set = new Set(rbe2Nodes);
		const rbe3Set = new Set(rbe3Nodes);

		// --- vertexColors(RGB) 생성 ---
		const vertexColors: number[] = new Array(nVerts * 3);
		for (let i = 0; i < nVerts; i++) {
			if (rbe2Set.has(i)) {
				// 노란색
				vertexColors[i * 3 + 0] = 1;
				vertexColors[i * 3 + 1] = 1;
				vertexColors[i * 3 + 2] = 0;
			} else if (rbe3Set.has(i)) {
				// 파란색
				vertexColors[i * 3 + 0] = 0;
				vertexColors[i * 3 + 1] = 0;
				vertexColors[i * 3 + 2] = 1;
			} else {
				// 기본 회색
				vertexColors[i * 3 + 0] = 0.9;
				vertexColors[i * 3 + 1] = 0.9;
				vertexColors[i * 3 + 2] = 0.9;
			}
		}

		const geom: GeometryPayload = {
			name: file.name, // 하나의 메시로 내보냄
			positions,
			indices,
			vertexColors, // Babylon 쪽에서 RGBA로 변환해 적용
		};

		return { items: [geom] };
	} finally {
		f.close();
	}
}
