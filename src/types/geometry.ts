export type GeometryPayload = {
	name: string;
	positions: number[];
	indices: number[];
	normals?: number[];
	color?: [number, number, number] | undefined;
	vertexColors?: number[];
};

export type ScenePayload = {
	items: GeometryPayload[];
};

export interface BabylonCanvasProps {
	payload: ScenePayload;
}
