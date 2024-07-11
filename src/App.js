import { Route, Switch, Router} from 'wouter';
import './App.css';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
    <Router>

      <Navbar />
      <Switch>
        <Route path="/" exact/>
      </Switch>
    </Router>
    </>
  );
}

export default App;
