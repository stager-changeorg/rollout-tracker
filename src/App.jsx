import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Agentation } from 'agentation';
import V1 from './components/V1';
import V2 from './components/V2';
import Rollout from './components/Rollout';
import MarketDetail from './components/MarketDetail';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/rollout" replace />} />
        <Route path="/v1" element={<V1 />} />
        <Route path="/v2" element={<V2 />} />
        <Route path="/rollout" element={<Rollout />} />
        <Route path="/rollout/:market" element={<MarketDetail />} />
      </Routes>
      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
    </HashRouter>
  );
}

export default App;
