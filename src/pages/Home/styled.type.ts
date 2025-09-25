export interface WrapperProps {
	width?: string;
	height?: string;
	direction?: "column" | "row";
	justify?: "center" | "space-around" | "space-between" | "space-evenly" | "normal";
	items?: "center" | "normal";
	gap?: number;
}

export interface FileSelectButtonProps {
	isSelected: boolean;
}

export interface TextProps {
	color: string;
}
