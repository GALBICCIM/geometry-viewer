import styled from "styled-components";

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.75rem;
	padding: 1rem;
	position: absolute;
	top: 16%;
	left: 6%;
	z-index: 10;
	border: 2px solid black;
	border-radius: 10px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	pointer-events: none;
`;

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
`;

export const Text = styled.p<{ size: number }>`
	font-family: monospace;
	font-size: ${({ size }) => size}rem;
	color: black;
`;
