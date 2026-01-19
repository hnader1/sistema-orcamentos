import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
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
import RelatorioOrcamentos from './pages/RelatorioOrcamentos'
import Conflitos from './pages/Conflitos'
import FormasPagamentoAdmin from './pages/FormasPagamentoAdmin'
import GerenciarCodigosVendedores from './pages/GerenciarCodigosVendedores'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas - Usuários logados */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/conflitos" element={<ProtectedRoute><Conflitos /></ProtectedRoute>} />
          <Route path="/orcamentos/status/:status" element={<ProtectedRoute><OrcamentosStatus /></ProtectedRoute>} />
          <Route path="/orcamentos" element={<ProtectedRoute><Orcamentos /></ProtectedRoute>} />
          <Route path="/orcamentos/novo" element={<ProtectedRoute><OrcamentoForm /></ProtectedRoute>} />
          <Route path="/orcamentos/editar/:id" element={<ProtectedRoute><OrcamentoForm /></ProtectedRoute>} />
          <Route path="/relatorios/orcamentos" element={<ProtectedRoute><RelatorioOrcamentos /></ProtectedRoute>} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Rotas Admin - APENAS ADMINISTRADORES */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/produtos" element={<AdminRoute><AdminProdutos /></AdminRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
          <Route path="/admin/frete" element={<AdminRoute><AdminFrete /></AdminRoute>} />
          <Route path="/admin/codigos-vendedores" element={<AdminRoute><GerenciarCodigosVendedores /></AdminRoute>} />
          <Route path="/admin/formas-pagamento" element={<AdminRoute><FormasPagamentoAdmin /></AdminRoute>} />

          {/* Rota não encontrada */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App