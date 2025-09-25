import { Routes, Route } from "react-router-dom";
import { Home, Viewer } from "@/pages";

const AppRoutes = () => (
	<Routes>
		<Route path="/" element={<Home />} />
		<Route path="/view" element={<Viewer />} />
	</Routes>
);

export default AppRoutes;
