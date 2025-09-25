import { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";

import type { ScenePayload } from "@/types";

import { Canvas } from "./styled";

type BabylonCanvasProps = { payload: ScenePayload };

const BabylonCanvas = ({ payload }: BabylonCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<BABYLON.Engine | null>(null);
	const sceneRef = useRef<BABYLON.Scene | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const engine = new BABYLON.Engine(canvas, true);
		engineRef.current = engine;

		const scene = new BABYLON.Scene(engine);
		sceneRef.current = scene;
		scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

		const camera = new BABYLON.ArcRotateCamera("cam", Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);
		camera.attachControl(canvas, true);

		const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
		hemi.intensity = 1.1;
		hemi.groundColor = new BABYLON.Color3(1, 1, 1);

		engine.runRenderLoop(() => scene.render());

		const onResize = () => engine.resize();

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			engine.dispose();
		};
	}, []);

	useEffect(() => {
		const scene = sceneRef.current;
		if (!scene) return;

		scene.meshes.slice().forEach((m) => m.dispose());

		const root = new BABYLON.TransformNode("root", scene);

		for (const item of payload.items) {
			const mesh = new BABYLON.Mesh(item.name, scene);
			const v = new BABYLON.VertexData();

			v.positions = item.positions;
			v.indices = item.indices;

			if (item.normals && item.normals.length === item.positions.length) {
				v.normals = item.normals;
			} else {
				const normals: number[] = [];

				BABYLON.VertexData.ComputeNormals(v.positions, v.indices, normals);
				v.normals = normals;
			}

			v.applyToMesh(mesh);
			mesh.flipFaces(true);
			mesh.parent = root;

			const mat = new BABYLON.PBRMaterial(`${item.name}-mat`, scene);

			mat.backFaceCulling = false;
			mat.alpha = 1; // 불투명
			mat.sideOrientation = BABYLON.Material.CounterClockWiseSideOrientation;
			mesh.material = mat;
			mat.albedoColor = new BABYLON.Color3(0.6, 0.6, 0.6);
			mat.metallic = 0;
			mat.roughness = 0.5;

			const positions = item.positions;
			const indices = item.indices;
			const edgeSet = new Set<string>();
			const lines: BABYLON.Vector3[][] = [];

			for (let i = 0; i < indices.length; i += 3) {
				const a = indices[i],
					b = indices[i + 1],
					c = indices[i + 2];
				const edges = [
					[a, b],
					[b, c],
					[c, a],
				];

				for (const [v1, v2] of edges) {
					const key = v1 < v2 ? `${v1}_${v2}` : `${v2}_${v1}`;

					if (!edgeSet.has(key)) {
						edgeSet.add(key);
						lines.push([
							new BABYLON.Vector3(positions[v1 * 3], positions[v1 * 3 + 1], positions[v1 * 3 + 2]),
							new BABYLON.Vector3(positions[v2 * 3], positions[v2 * 3 + 1], positions[v2 * 3 + 2]),
						]);
					}
				}
			}

			if (lines.length > 0) {
				const edgeMesh = BABYLON.MeshBuilder.CreateLineSystem(`${item.name}-edges`, { lines }, scene);
				edgeMesh.color = new BABYLON.Color3(0, 0, 0); // 검은색 테두리
				edgeMesh.parent = root;
			}
		}

		const cam = scene.activeCamera as BABYLON.ArcRotateCamera;
		const bounds = scene.meshes.reduce(
			(acc, m) => {
				if (!m.getBoundingInfo) return acc;

				const bb = m.getBoundingInfo().boundingBox;

				acc.min = BABYLON.Vector3.Minimize(acc.min, bb.minimumWorld);
				acc.max = BABYLON.Vector3.Maximize(acc.max, bb.maximumWorld);

				return acc;
			},
			{
				min: new BABYLON.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
				max: new BABYLON.Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
			}
		);
		const center = bounds.min.add(bounds.max).scale(0.5);
		const radius = bounds.max.subtract(bounds.min).length() * 0.6 + 1e-3;

		cam.setTarget(center);
		cam.radius = Math.max(1, radius * 2.2);
	}, [payload]);

	return <Canvas ref={canvasRef} />;
};

export default BabylonCanvas;
