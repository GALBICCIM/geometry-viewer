// src/types/geometry.ts
export type GeometryPayload = {
	name: string;
	positions: number[]; // [x0,y0,z0, x1,y1,z1, ...]
	indices: number[]; // [i0,i1,i2, ...]
	normals?: number[]; // 선택: 없으면 viewer에서 계산
	color?: [number, number, number] | undefined; // 0..1 RGB (옵션)
};

export type ScenePayload = {
	items: GeometryPayload[]; // 어셈블리 대비 다수 지원
};
