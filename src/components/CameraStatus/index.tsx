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
			target: [ x: {target._x.toFixed(3)}, y: {target._y.toFixed(3)}, z: {target._z.toFixed(3)} ]
		</S.Text>
	</S.Container>
);

export default CameraStatus;
