import { useRef, useEffect } from "react";
import * as BABYLON from "@babylonjs/core";

import { Canvas } from "./styled";

const SceneCanvas = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		const engine = new BABYLON.Engine(canvasRef.current, true);
		const scene = new BABYLON.Scene(engine);
		const camera = new BABYLON.ArcRotateCamera(
			"camera",
			BABYLON.Tools.ToRadians(90),
			BABYLON.Tools.ToRadians(65),
			10,
			BABYLON.Vector3.Zero(),
			scene
		);
		camera.attachControl(canvasRef.current, true);
		camera.setTarget(BABYLON.Vector3.Zero());

		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
		light.intensity = 0.7;

		const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3, segments: 32 }, scene);
		sphere.position.y = 2;

		const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

		engine.runRenderLoop(() => {
			scene.render();
		});

		window.addEventListener("resize", () => {
			engine.resize();
		});

		return () => {
			engine.dispose();
		};
	}, []);

	return <Canvas ref={canvasRef} />;
};

export default SceneCanvas;
