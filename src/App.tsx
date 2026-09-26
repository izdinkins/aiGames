import { BrowserRouter, Route, Routes } from 'react-router-dom'
import BootSequence from './components/BootSequence'
import RouteFlash from './components/RouteFlash'
import SoundToggle from './components/SoundToggle'
import ConnectFour from './games/connect-four/ConnectFour'
import DotsAndBoxes from './games/dots-and-boxes/DotsAndBoxes'
import TicTacToe from './games/tic-tac-toe/TicTacToe'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <BootSequence />
      <RouteFlash />
      <SoundToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/connect-four" element={<ConnectFour />} />
        <Route path="/dots-and-boxes" element={<DotsAndBoxes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
