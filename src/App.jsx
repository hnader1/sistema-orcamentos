import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import OrcamentosStatus from './pages/OrcamentosStatus'
import Orcamentos from './pages/Orcamentos'
import OrcamentoForm from './pages/OrcamentoForm'
import Admin from './pages/Admin'
import AdminProdutos from './pages/AdminProdutos'
import AdminUsuarios from './pages/AdminUsuarios'
import AdminFrete from './pages/AdminFrete'
import AdminDashboard from './pages/AdminDashboard'
import RelatorioOrcamentos from './pages/RelatorioOrcamentos' // ✨ NOVO
import Conflitos from './pages/Conflitos';
import FormasPagamentoAdmin from './pages/FormasPagamentoAdmin'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas - Dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/conflitos" element={
            <ProtectedRoute>
              <Conflitos />
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

          <Route path="/relatorios/orcamentos" element={
            <ProtectedRoute>
              <RelatorioOrcamentos />
            </ProtectedRoute>
          } />

          {/* Rotas protegidas - Admin */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/produtos" element={
            <ProtectedRoute>
              <AdminProdutos />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/usuarios" element={
            <ProtectedRoute>
              <AdminUsuarios />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/frete" element={
            <ProtectedRoute>
              <AdminFrete />
            </ProtectedRoute>
          } />

          {/* ===== ADICIONAR AQUI ===== */}
          <Route path="/admin/formas-pagamento" element={
            <ProtectedRoute>
              <FormasPagamentoAdmin />
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