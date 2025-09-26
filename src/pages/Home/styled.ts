import styled from "styled-components";

import type * as T from "./styled.type";

export const Container = styled.div`
	width: 100vw;
	height: 100vh;
	background-color: black;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 4rem;
`;

export const Wrapper = styled.div<T.WrapperProps>`
	width: ${({ width }) => width || "auto"};
	height: ${({ height }) => height || "auto"};
	display: flex;
	flex-direction: ${({ direction }) => direction || "row"};
	justify-content: ${({ justify }) => justify || "normal"};
	align-items: ${({ items }) => items || "normal"};
	gap: ${({ gap }) => `${gap}` || 0}px;
`;

export const Text = styled.p<T.TextProps>`
	color: ${({ color }) => color};
	font-size: 3rem;
`;

export const FileInput = styled.input`
	display: none;
`;

export const FileInputLabel = styled.label`
	width: 4rem;
	height: 4rem;
	background-color: ghostwhite;
	display: flex;
	justify-content: center;
	align-items: center;
	border: none;
	border-radius: 1.25rem;
	font-size: 4rem;
	font-weight: 700;
	cursor: pointer;
`;

export const FileSelectMenu = styled.div`
	width: 32rem;
	background-color: white;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 10px;
	border: none;
	border-radius: 15px;
	padding: 20px;
`;

export const FileSelectButton = styled.button<T.FileSelectButtonProps>`
	width: 100%;
	background-color: ${({ isSelected }) => (isSelected ? "azure" : "ghostwhite")};
	padding: 20px 40px;
	border: none;
	border-radius: 20px;
	font-size: 1.75rem;
	text-align: center;
	cursor: pointer;
`;

export const GoViewer = styled.button`
	text-align: center;
	background-color: white;
	font-size: 4rem;
	font-weight: 700;
	border: none;
	border-radius: 1.25rem;
	padding: 1.25rem 2.5rem;
	cursor: pointer;
`;
