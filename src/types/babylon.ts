export type GeometryPayload = {
	name: string;
	positions: number[];
	indices: number[];
	normals?: number[];
	vertexColors?: number[];
	indexGroups?: {
		rbe2: [number, number]; // [startIndex, indexCount]
		rbe3: [number, number];
		base: [number, number];
	};
};

export type ScenePayload = {
	items: GeometryPayload[];
};

export interface BabylonCanvasProps {
	payload: ScenePayload;
}
