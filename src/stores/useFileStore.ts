import { create } from "zustand";

interface FileStore {
	file: File | null;
	setFile: (file: File | null) => void;
}

export const useFileStore = create<FileStore>((set) => ({
	file: null,
	setFile: (file) => set({ file }),
}));
