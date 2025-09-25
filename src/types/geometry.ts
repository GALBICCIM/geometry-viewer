// src/types/geometry.ts
export type GeometryPayload = {
	name: string;
	positions: number[];
	indices: number[];
	normals?: number[];
	color?: [number, number, number] | undefined;
};

export type ScenePayload = {
	items: GeometryPayload[];
};
