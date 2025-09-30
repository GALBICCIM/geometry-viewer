import type { Vector3 } from "@babylonjs/core";

export type CameraInfo = { alpha: number; beta: number; radius: number; target: Vector3 };

export interface CameraStatusProps extends CameraInfo {
	name: string;
}
