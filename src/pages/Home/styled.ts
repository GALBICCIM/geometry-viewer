import styled from "styled-components";

export const Container = styled.div`
	width: 100vw;
	height: 100vh;
	background-color: black;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 4rem;
`;

export const Text = styled.p`
	color: white;
	font-size: 3rem;
`;

export const FileInput = styled.input`
	display: none;
`;

export const FileInputLabel = styled.label`
	text-align: center;
	background-color: white;
	font-size: 8rem;
	font-weight: 700;
	border-radius: 1.25rem;
	padding: 1.25rem 3.75rem;
	cursor: pointer;
`;

export const GoViewer = styled.button`
	text-align: center;
	background-color: white;
	font-size: 4rem;
	font-weight: 700;
	border-radius: 1.25rem;
	padding: 1.25rem 2.5rem;
	cursor: pointer;
`;
