import car from './images/car.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={car} className="App-logo" alt="logo" />
        <p>
          Bienvenido a CouchGarage
        </p>
      </header>
    </div>
  );
}

export default App;
