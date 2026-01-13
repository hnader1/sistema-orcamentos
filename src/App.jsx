import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import OrcamentosStatus from './pages/OrcamentosStatus'
import Orcamentos from './pages/Orcamentos'
import OrcamentoForm from './pages/OrcamentoForm'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/orcamentos/status/:status" element={
            <ProtectedRoute>
              <OrcamentosStatus />
            </ProtectedRoute>
          } />
          
          <Route path="/orcamentos" element={
            <ProtectedRoute>
              <Orcamentos />
            </ProtectedRoute>
          } />
          
          <Route path="/orcamentos/novo" element={
            <ProtectedRoute>
              <OrcamentoForm />
            </ProtectedRoute>
          } />
          
          <Route path="/orcamentos/editar/:id" element={
            <ProtectedRoute>
              <OrcamentoForm />
            </ProtectedRoute>
          } />
          
          {/* Redirecionar qualquer rota não encontrada para login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
