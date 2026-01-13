import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Orcamentos from './pages/Orcamentos'
import OrcamentosStatus from './pages/OrcamentosStatus'
import OrcamentoForm from './pages/OrcamentoForm'
import Produtos from './pages/Produtos'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard - Página inicial */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Orçamentos - Lista completa */}
        <Route path="/orcamentos" element={<Orcamentos />} />
        
        {/* Orçamentos por Status - Lista filtrada */}
        <Route path="/orcamentos/status/:status" element={<OrcamentosStatus />} />
        
        {/* Criar/Editar Orçamento */}
        <Route path="/orcamentos/novo" element={<OrcamentoForm />} />
        <Route path="/orcamentos/editar/:id" element={<OrcamentoForm />} />
        
        {/* Produtos */}
        <Route path="/produtos" element={<Produtos />} />
        
        {/* Redirecionar para dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
