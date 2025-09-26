import type { Vector3 } from "@babylonjs/core";

import * as S from "./styled";

interface StatusProps {
	alpha: string;
	beta: string;
	radius: string;
	target: Vector3;
}

const CameraStatus = ({ alpha, beta, radius, target }: StatusProps) => (
	<S.Container>
		<S.Text>alpha: {alpha}</S.Text>
		<S.Text>beta: {beta}</S.Text>
		<S.Text>radius: {radius}</S.Text>
		<S.Text>
			target: [{target._x}, {target._y}, {target._z}]
		</S.Text>
	</S.Container>
);

export default CameraStatus;
