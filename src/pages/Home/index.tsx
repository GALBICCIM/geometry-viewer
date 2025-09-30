import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFileStore } from "@/stores";
import { sceneRouter } from "@/loaders";

import { SAMPLE_FILES } from "@/constants";

import * as S from "./styled";

const Home = () => {
	const [isLoading, setIsLoading] = useState(true);
	const navigator = useNavigate();
	const selectedFile = useFileStore((state) => state.selectedFile);
	const files = useFileStore((state) => state.files);
	const setFile = useFileStore((state) => state.setFile);
	const addFile = useFileStore((state) => state.addFile);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => addFile(event.target.files ?? null);

	const handleSelectGeometry = (index: number) => setFile(files[index]);

	const handleButtonClick = async () => {
		if (!selectedFile) return;

		try {
			const payload = await sceneRouter(selectedFile);

			navigator("/view", { state: payload });
		} catch (e) {
			console.error(e);

			return;
		}
	};

	useEffect(() => {
		(async () => {
			const dt = new DataTransfer();

			try {
				for (const fname of SAMPLE_FILES) {
					const res = await fetch(`/sample_geometries/${fname}`);
					const blob = await res.blob();
					const file = new File([blob], fname);

					dt.items.add(file);
				}

				addFile(dt.files);
			} catch (e) {
				console.error(e);
			} finally {
				setIsLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<S.Container>
				{isLoading ? (
					<S.Text color="white">Loading geometries...</S.Text>
				) : (
					<>
						<S.FileSelectMenu>
							<S.Wrapper width="45%" justify="space-around" items="center">
								<S.Text color="black">Geometries ({files.length})</S.Text>
								<S.FileInputLabel htmlFor="input-file">
									<span style={{ transform: "translateY(5px)" }}>+</span>
								</S.FileInputLabel>
							</S.Wrapper>
							<S.ItemWrapper>
								{files &&
									files.map((file, index) => (
										<S.FileSelectButton key={index} isSelected={selectedFile === file} onClick={() => handleSelectGeometry(index)}>
											{file.name}
										</S.FileSelectButton>
									))}
							</S.ItemWrapper>
						</S.FileSelectMenu>
						<S.GoViewer onClick={handleButtonClick}>Go!</S.GoViewer>
					</>
				)}
			</S.Container>
			<S.FileInput type="file" id="input-file" accept=".vtp,.h5" multiple onChange={handleFileUpload} />
		</>
	);
};

export default Home;
