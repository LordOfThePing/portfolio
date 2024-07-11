import { Route, Switch, Router } from 'wouter';

import './App.css';
import Home from './components/pages/Home';
import Navbar from './components/Navbar';

function App() {
	return (
		<>
			<Router>
				<Navbar />

				<Switch>
					<Route
						path="/"
						exact
						component={Home}
					/>
				</Switch>
			</Router>
		</>
	);
}

export default App;
