import type { Vector3 } from "@babylonjs/core";

import * as S from "./styled";

interface StatusProps {
	name: string;
	alpha: string;
	beta: string;
	radius: string;
	target: Vector3;
}

const CameraStatus = ({ name, alpha, beta, radius, target }: StatusProps) => (
	<S.Container>
		<S.Text size={1.5}>geometry: {name.replace(/\..*$/, "")}</S.Text>
		<S.Wrapper>
			<S.Text size={1}>rotation-x: {alpha}</S.Text>
			<S.Text size={1}>rotation-y: {beta}</S.Text>
			<S.Text size={1}>distance: {radius}</S.Text>
			<S.Text size={1}>
				target: | x: {target._x.toFixed(3)} | y: {target._y.toFixed(3)} | z: {target._z.toFixed(3)} |
			</S.Text>
		</S.Wrapper>
	</S.Container>
);

export default CameraStatus;
