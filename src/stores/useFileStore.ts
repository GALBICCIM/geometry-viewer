import { create } from "zustand";

interface FileStore {
	selectedFile: File | null;
	files: File[];
	setFile: (selectedFile: File | null) => void;
	addFile: (file: File | null) => void;
}

export const useFileStore = create<FileStore>((set) => ({
	selectedFile: null,
	files: [],
	setFile: (selectedFile) => set({ selectedFile }),
	addFile: (file) => {
		if (file !== null) {
			set((state) => ({ files: [file, ...state.files] }));
		}
	},
}));
