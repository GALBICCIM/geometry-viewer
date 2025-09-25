import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";
import vtkTriangleFilter from "@kitware/vtk.js/Filters/General/TriangleFilter";

import type { ScenePayload, GeometryPayload } from "@/types";

export const vtpParser = async (file: File): Promise<ScenePayload> => {
	const buf = new Uint8Array(await file.arrayBuffer());
	const reader = vtkXMLPolyDataReader.newInstance();
	reader.parseAsArrayBuffer(buf.buffer);

	let poly = reader.getOutputData();

	const tri = vtkTriangleFilter.newInstance();
	tri.setInputData(poly);
	tri.update();
	poly = tri.getOutputData();

	const pts = Array.from(poly.getPoints().getData()) as number[];
	const cells = poly.getPolys().getData();

	const indices: number[] = [];
	for (let i = 0; i < cells.length; ) {
		const n = cells[i++];
		const base = i;

		for (let k = 1; k < n - 1; k++) {
			indices.push(cells[base], cells[base + k], cells[base + k + 1]);
		}

		i += n;
	}

	const geom: GeometryPayload = {
		name: file.name,
		positions: pts,
		indices,
	};

	return { items: [geom] };
};
