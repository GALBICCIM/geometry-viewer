import { vtpParser } from "./vtpParser";
import { h5Parser } from "./h5Parser";

import type { ScenePayload } from "@/types";

export async function sceneRouter(file: File): Promise<ScenePayload> {
	const ext = file.name.split(".").pop()?.toLowerCase();

	if (ext === "vtp") return vtpParser(file);
	if (ext === "h5" || ext === "hdf5") return h5Parser(file);

	throw new Error(`Unsupported file type: ${ext ?? "unknown"}`);
}
