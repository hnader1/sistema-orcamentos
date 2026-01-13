import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import OrcamentosStatus from './pages/OrcamentosStatus'
import Orcamentos from './pages/Orcamentos'
import OrcamentoForm from './pages/OrcamentoForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard - Página inicial */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Lista por status */}
        <Route path="/orcamentos/status/:status" element={<OrcamentosStatus />} />
        
        {/* Lista completa */}
        <Route path="/orcamentos" element={<Orcamentos />} />
        
        {/* Criar/Editar */}
        <Route path="/orcamentos/novo" element={<OrcamentoForm />} />
        <Route path="/orcamentos/editar/:id" element={<OrcamentoForm />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
