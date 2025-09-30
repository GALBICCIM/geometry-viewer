import type { CameraStatusProps } from "@/types";

import * as S from "./styled";

const CameraStatus = ({ name, alpha, beta, radius, target }: CameraStatusProps) => (
	<S.Container>
		<S.Text size={1.5}>geometry: {name.replace(/\..*$/, "")}</S.Text>
		<S.Wrapper>
			<S.Text size={1}>rotation-x: {alpha.toFixed(2)}</S.Text>
			<S.Text size={1}>rotation-y: {beta.toFixed(2)}</S.Text>
			<S.Text size={1}>distance: {radius.toFixed(0)}</S.Text>
			<S.Text size={1}>
				target: | x: {target._x.toFixed(0)} | y: {target._y.toFixed(0)} | z: {target._z.toFixed(0)} |
			</S.Text>
		</S.Wrapper>
	</S.Container>
);

export default CameraStatus;
