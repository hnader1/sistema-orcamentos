// ====================================================================================
// MUDANÇAS PARA OrcamentosStatus.jsx - ADICIONAR STATUS "FINALIZADO"
// ====================================================================================

// ====================================================================================
// 1. ATUALIZAR getStatusInfo (linha ~180)
// ====================================================================================
const getStatusInfo = (statusName) => {
  const statusMap = {
    'rascunho': {
      titulo: 'Rascunhos',
      icone: Edit,
      cor: 'text-gray-600',
      corFundo: 'bg-gray-100'
    },
    'enviado': {
      titulo: 'Enviados',
      icone: Send,
      cor: 'text-blue-600',
      corFundo: 'bg-blue-100'
    },
    'aprovado': {
      titulo: 'Aprovados',
      icone: CheckCircle,
      cor: 'text-green-600',
      corFundo: 'bg-green-100'
    },
    'lancado': {
      titulo: 'Lançados',
      icone: Briefcase,
      cor: 'text-purple-600',
      corFundo: 'bg-purple-100'
    },
    // ← ADICIONAR ESTE BLOCO
    'finalizado': {
      titulo: 'Finalizados',
      icone: PackageCheck,
      cor: 'text-teal-600',
      corFundo: 'bg-teal-100'
    },
    'cancelado': {
      titulo: 'Cancelados',
      icone: XCircle,
      cor: 'text-red-600',
      corFundo: 'bg-red-100'
    }
  }
  return statusMap[statusName] || statusMap.rascunho
}

// ====================================================================================
// 2. ATUALIZAR getStatusBadge (linha ~210)
// ====================================================================================
const getStatusBadge = (statusName) => {
  const styles = {
    'rascunho': 'bg-gray-100 text-gray-700 border border-gray-200',
    'enviado': 'bg-blue-100 text-blue-700 border border-blue-200',
    'aprovado': 'bg-green-100 text-green-700 border border-green-200',
    'lancado': 'bg-purple-100 text-purple-700 border border-purple-200',
    'finalizado': 'bg-teal-100 text-teal-700 border border-teal-200',  // ← ADICIONAR ESTA LINHA
    'cancelado': 'bg-red-100 text-red-700 border border-red-200'
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[statusName] || styles.rascunho}`}>
      {statusName?.toUpperCase() || 'RASCUNHO'}
    </span>
  )
}

// ====================================================================================
// 3. ATUALIZAR IMPORTS (linha ~6)
// ====================================================================================
import { 
  ArrowLeft, Search, Edit2, Copy, FileText, Calendar, User, DollarSign,
  Edit, Send, CheckCircle, XCircle, Briefcase, MapPin, PackageCheck  // ← ADICIONAR PackageCheck
} from 'lucide-react'

// ====================================================================================
// RESUMO DAS MUDANÇAS:
// ====================================================================================
/*
✅ 1. getStatusInfo: adicionar config para "finalizado"
✅ 2. getStatusBadge: cor teal para "finalizado"
✅ 3. Import: PackageCheck do lucide-react
*/