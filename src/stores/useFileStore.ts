import { create } from "zustand";

interface FileStore {
	selectedFile: File | null;
	files: File[];
	setFile: (selectedFile: File | null) => void;
	addFile: (inputFiles: FileList | null) => void;
}

export const useFileStore = create<FileStore>((set) => ({
	selectedFile: null,
	files: [],
	setFile: (selectedFile) => set({ selectedFile }),
	addFile: (inputFiles) => {
		if (inputFiles) {
			set((state) => {
				const newFiles = [...inputFiles, ...state.files].filter(
					(f, i, arr) => arr.findIndex((ff) => ff.name === f.name && ff.size === f.size && ff.type === f.type) === i
				);

				return { files: newFiles };
			});
		}
	},
}));
