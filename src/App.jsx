import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Produtos from './pages/Produtos'
import Orcamentos from './pages/Orcamentos'
import OrcamentoForm from './pages/OrcamentoForm'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/orcamentos/novo" element={<OrcamentoForm />} />
        <Route path="/orcamentos/editar/:id" element={<OrcamentoForm />} />
      </Routes>
    </Router>
  )
}

export default App
