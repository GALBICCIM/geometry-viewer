import { createGlobalStyle } from "styled-components";

import { reset } from "./reset";

const styled = { createGlobalStyle };

export const GlobalStyle = styled.createGlobalStyle`
	${reset}

	* {
		box-sizing: border-box;
		&:focus {
			outline: none;
		}
	}

	html {
		font-size: 10px;
		width: 100vw;
		scroll-behavior: smooth;
		overflow: hidden;
	}

	html,
	body,
	#app,
	#root,
	#__next {
		width: 100%;
		height: 100%;
	}

	html,
	body {
		@media screen and (max-width: 2600px) and (min-width: 2000px) {
			font-size: 18px;
		}

		@media screen and (max-width: 2000px) and (min-width: 1500px) {
			font-size: 16px;
		}

		@media screen and (max-width: 1500px) and (min-width: 1000px) {
			font-size: 15px;
		}

		@media screen and (max-width: 1000px) and (min-width: 700px) {
			font-size: 13px;
		}

		@media screen and (max-width: 700px) and (min-width: 500px) {
			font-size: 12px;
		}

		@media screen and (max-width: 500px) and (min-width: 300px) {
			font-size: 14px;
		}
	}
`;
