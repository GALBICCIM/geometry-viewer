export type GeometryPayload = {
	name: string;
	positions: number[];
	indices: number[];
	normals?: number[];
	color?: [number, number, number] | undefined;
	vertexColors?: number[]; // [r,g,b,r,g,b,...] vertex별 색상
};

export type ScenePayload = {
	items: GeometryPayload[];
};
