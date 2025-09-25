import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BabylonCanvas } from "@/components";

import type { ScenePayload } from "@/types/geometry";

import * as S from "./styled";

export default function Viewer() {
	const navigate = useNavigate();
	const { state } = useLocation();
	const payload = state as ScenePayload | undefined;

	useEffect(() => {
		if (!payload) navigate("/", { replace: true });
	}, [payload, navigate]);

	if (!payload) return null;

	return (
		<S.Container>
			<S.GoRoot onClick={() => navigate("/")}>Upload another file</S.GoRoot>
			<BabylonCanvas payload={payload} />
		</S.Container>
	);
}
