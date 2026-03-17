import './App.css';
import mtgIcon from './mtg_icon.png';

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <img src={mtgIcon} className="App-logo" alt="Magic: The Gathering icon" />
          <p>
            MTG Booster Sim
          </p>
          <p>
            This is a fun tool made in React to simulate opening a pack of MTG cards based on set.
          </p>
      </header>
      
      
    </div>
  );
}

export default App;
