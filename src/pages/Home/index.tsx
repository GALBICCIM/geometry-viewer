import { useNavigate } from "react-router-dom";
import { useFileStore } from "@/stores";
import { parseVTP } from "@/lib";

import * as S from "./styled";

const Home = () => {
	const navigator = useNavigate();
	const selectedFile = useFileStore((state) => state.selectedFile);
	const files = useFileStore((state) => state.files);
	const setFile = useFileStore((state) => state.setFile);
	const addFile = useFileStore((state) => state.addFile);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => addFile(event.target.files?.[0] ?? null);

	const handleButtonClick = async () => {
		if (!selectedFile) return;

		const ext = selectedFile.name.split(".").pop()?.toLowerCase();
		if (!ext) return;

		let payload;

		if (ext === "vtp") {
			payload = await parseVTP(selectedFile);
		} else {
			alert(`we not support ${ext}`);

			return;
		}

		navigator("/view", { state: payload });
	};

	return (
		<>
			<S.Container>
				<S.FileSelectMenu>
					<S.Wrapper width="100%" justify="space-around" items="center">
						<S.Text color="black">Geometries ({files.length})</S.Text>
						<S.FileInputLabel htmlFor="input-file">+</S.FileInputLabel>
					</S.Wrapper>
					{files.map((file, index) => (
						<S.FileSelectButton isSelected={selectedFile === file} onClick={() => setFile(files[index])}>
							{file.name}
						</S.FileSelectButton>
					))}
				</S.FileSelectMenu>
				<S.GoViewer onClick={handleButtonClick}>Go!</S.GoViewer>
			</S.Container>
			<S.FileInput type="file" id="input-file" accept=".vtp" onChange={handleFileUpload} />
		</>
	);
};

export default Home;
