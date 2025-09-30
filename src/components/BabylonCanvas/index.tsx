import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";

import type { ScenePayload } from "@/types";

import CameraStatus from "../CameraStatus";
import { Canvas } from "./styled";

type BabylonCanvasProps = { payload: ScenePayload };

const NAME_SOLID_COLOR: Record<string, BABYLON.Color3> = {
	rbe2: BABYLON.Color3.Yellow(), // yellow
	rbe3: BABYLON.Color3.Blue(), // blue
};

const BabylonCanvas = ({ payload }: BabylonCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<BABYLON.Engine | null>(null);
	const sceneRef = useRef<BABYLON.Scene | null>(null);
	const [cameraInfo, setCameraInfo] = useState<{ alpha: number; beta: number; radius: number; target: BABYLON.Vector3 } | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const engine = new BABYLON.Engine(canvas, true);
		engineRef.current = engine;

		const scene = new BABYLON.Scene(engine);
		sceneRef.current = scene;
		scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

		const camera = new BABYLON.ArcRotateCamera("cam", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
		camera.attachControl(canvas, true);
		camera.lowerBetaLimit = null;
		camera.upperBetaLimit = null;
		camera.lowerRadiusLimit = 25;
		camera.upperRadiusLimit = 450;

		// 메시 중심 계산 후 target 정렬
		setTimeout(() => {
			if (scene.meshes.length > 0) {
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
				camera.setTarget(center);
			}
		}, 0);
		const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
		hemi.intensity = 1.1;
		hemi.groundColor = new BABYLON.Color3(1, 1, 1);

		engine.runRenderLoop(() => {
			scene.render();
			const cam = scene.activeCamera as BABYLON.ArcRotateCamera;
			if (cam) {
				setCameraInfo({
					alpha: cam.alpha,
					beta: cam.beta,
					radius: cam.radius,
					target: cam.target.clone(),
				});
			}
		});
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
		root.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);

		for (const item of payload.items) {
			const mesh = new BABYLON.Mesh(item.name, scene);
			const v = new BABYLON.VertexData();

			v.positions = item.positions;
			v.indices = item.indices;

			// normals
			if (item.normals && item.normals.length === item.positions.length) {
				v.normals = item.normals;
			} else {
				const normals: number[] = [];
				BABYLON.VertexData.ComputeNormals(v.positions, v.indices, normals);
				v.normals = normals;
			}

			const n = item.positions.length / 3;
			const isRGB = !!item.vertexColors && item.vertexColors.length === 3 * n;
			const isRGBA = !!item.vertexColors && item.vertexColors.length === 4 * n;
			const hasVertexColors = isRGB || isRGBA;

			if (hasVertexColors) {
				const colors = new Float32Array(4 * n);
				if (isRGB) {
					for (let i = 0, j = 0; i < item.vertexColors!.length; i += 3, j += 4) {
						colors[j] = item.vertexColors![i];
						colors[j + 1] = item.vertexColors![i + 1];
						colors[j + 2] = item.vertexColors![i + 2];
						colors[j + 3] = 1;
					}
				} else {
					colors.set(item.vertexColors!);
				}
				v.colors = colors;
			}

			v.applyToMesh(mesh);
			mesh.parent = root;

			const solidColor = NAME_SOLID_COLOR[item.name];
			if (solidColor) {
				const mat = new BABYLON.PBRMaterial(`${item.name}-mat`, scene);
				mat.backFaceCulling = false;
				mat.alpha = 1;
				mat.sideOrientation = BABYLON.Material.CounterClockWiseSideOrientation;
				mat.metallic = 0;
				mat.roughness = 0.5;
				mat.albedoColor = solidColor;
				mesh.material = mat;
			} else if (hasVertexColors) {
				const mat = new BABYLON.StandardMaterial(`${item.name}-mat`, scene);
				mat.backFaceCulling = false;
				mat.alpha = 1;
				mat.sideOrientation = BABYLON.Material.CounterClockWiseSideOrientation;
				mat.specularColor = new BABYLON.Color3(0, 0, 0);
				mesh.material = mat;
			} else {
				const mat = new BABYLON.PBRMaterial(`${item.name}-mat`, scene);
				mat.backFaceCulling = false;
				mat.alpha = 1;
				mat.sideOrientation = BABYLON.Material.CounterClockWiseSideOrientation;
				mat.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.8);
				mat.metallic = 0;
				mat.roughness = 0.5;
				mesh.material = mat;
			}

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
				edgeMesh.color = new BABYLON.Color3(0, 0, 0);
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

		// 동적 감도
		const baseAngularSensibility = 400;
		const baseWheelPrecision = 10;
		const basePanningSensibility = 100;
		const cappedRadius = Math.max(1, Math.min(radius, 100));
		const logScale = Math.log10(cappedRadius + 1);
		cam.angularSensibilityX = baseAngularSensibility * logScale;
		cam.angularSensibilityY = baseAngularSensibility * logScale;
		cam.wheelPrecision = baseWheelPrecision / logScale;
		cam.panningSensibility = basePanningSensibility * logScale;
	}, [payload]);

	return (
		<>
			{cameraInfo && (
				<CameraStatus
					alpha={cameraInfo.alpha.toFixed(3)}
					beta={cameraInfo.beta.toFixed(3)}
					radius={cameraInfo.radius.toFixed(0)}
					target={cameraInfo.target}
				/>
			)}
			<Canvas ref={canvasRef} />
		</>
	);
};

export default BabylonCanvas;
