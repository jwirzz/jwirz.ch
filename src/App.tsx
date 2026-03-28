import './App.css'
import Lanyard from './Lanyard'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
      <Lanyard position={[0, 0, 12]} gravity={[0, -40, 0]} />
    </div>
  )
}

export default App
