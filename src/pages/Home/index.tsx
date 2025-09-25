import { useNavigate } from "react-router-dom";
import { useFileStore } from "@/stores";
import { parseVTP } from "@/lib";

import * as S from "./styled";

export default function Home() {
	const file = useFileStore((state) => state.file);
	const setFile = useFileStore((state) => state.setFile);
	const navigator = useNavigate();

	const handleButtonClick = async () => {
		if (!file) return;

		const ext = file.name.split(".").pop()?.toLowerCase();
		if (!ext) return;

		let payload;

		if (ext === "vtp") {
			payload = await parseVTP(file);
		} else {
			alert(`we not support ${ext}`);

			return;
		}

		navigator("/view", { state: payload });
	};

	return (
		<S.Container>
			<>
				<S.FileInput type="file" id="input-file" accept=".vtp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
				<S.FileInputLabel htmlFor="input-file">File Upload</S.FileInputLabel>
			</>
			{file && <S.Text>selected: {file.name}</S.Text>}
			<S.GoViewer onClick={handleButtonClick}>Go!</S.GoViewer>
		</S.Container>
	);
}
