import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";

import { GlobalStyle } from "@/styles";

const App = () => {
	return (
		<>
			<GlobalStyle />
			<Router>
				<AppRoutes />
			</Router>
		</>
	);
};

export default App;
