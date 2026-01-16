// ====================================================================================
// MUDANÇAS PARA ADICIONAR STATUS "FINALIZADO"
// ====================================================================================
// 
// Este arquivo contém apenas as partes que precisam ser atualizadas
// Copie e cole no lugar correto do seu Orcamentos.jsx
//
// ====================================================================================

// ====================================================================================
// 1. ATUALIZAR O ESTADO DE ESTATÍSTICAS (linha ~24)
// ====================================================================================
const [estatisticas, setEstatisticas] = useState({
  rascunho: 0,
  enviado: 0,
  aprovado: 0,
  lancado: 0,
  finalizado: 0,    // ← ADICIONAR ESTA LINHA
  cancelado: 0
})

// ====================================================================================
// 2. ATUALIZAR O CÁLCULO DE ESTATÍSTICAS (dentro de carregarOrcamentos, linha ~60)
// ====================================================================================
// Calcular estatísticas por status
const stats = {
  rascunho: data?.filter(o => o.status === 'rascunho').length || 0,
  enviado: data?.filter(o => o.status === 'enviado').length || 0,
  aprovado: data?.filter(o => o.status === 'aprovado').length || 0,
  lancado: data?.filter(o => o.status === 'lancado').length || 0,
  finalizado: data?.filter(o => o.status === 'finalizado').length || 0,  // ← ADICIONAR ESTA LINHA
  cancelado: data?.filter(o => o.status === 'cancelado').length || 0
}
setEstatisticas(stats)

// ====================================================================================
// 3. ADICIONAR NO getStatusBadge (linha ~210)
// ====================================================================================
const getStatusBadge = (status) => {
  const styles = {
    'rascunho': 'bg-gray-100 text-gray-700 border border-gray-200',
    'enviado': 'bg-blue-100 text-blue-700 border border-blue-200',
    'aprovado': 'bg-green-100 text-green-700 border border-green-200',
    'lancado': 'bg-purple-100 text-purple-700 border border-purple-200',
    'finalizado': 'bg-teal-100 text-teal-700 border border-teal-200',  // ← ADICIONAR ESTA LINHA (cor verde-azulada)
    'rejeitado': 'bg-red-100 text-red-700 border border-red-200',
    'cancelado': 'bg-red-100 text-red-700 border border-red-200'
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.rascunho}`}>
      {status?.toUpperCase() || 'RASCUNHO'}
    </span>
  )
}

// ====================================================================================
// 4. ADICIONAR NOVO CARD NO statusCards (após o card "lancado", linha ~250)
// ====================================================================================
import { PackageCheck } from 'lucide-react'  // ← ADICIONAR NO IMPORT LÁ EM CIMA

const statusCards = [
  {
    status: 'rascunho',
    titulo: 'Rascunhos',
    icone: Edit,
    cor: 'from-gray-500 to-gray-600',
    corFundo: 'bg-gray-50',
    corBorda: 'border-gray-200',
    quantidade: estatisticas.rascunho
  },
  {
    status: 'enviado',
    titulo: 'Enviados',
    icone: Send,
    cor: 'from-blue-500 to-blue-600',
    corFundo: 'bg-blue-50',
    corBorda: 'border-blue-200',
    quantidade: estatisticas.enviado
  },
  {
    status: 'aprovado',
    titulo: 'Aprovados',
    icone: CheckCircle,
    cor: 'from-green-500 to-green-600',
    corFundo: 'bg-green-50',
    corBorda: 'border-green-200',
    quantidade: estatisticas.aprovado
  },
  {
    status: 'lancado',
    titulo: 'Lançados',
    icone: Briefcase,
    cor: 'from-purple-500 to-purple-600',
    corFundo: 'bg-purple-50',
    corBorda: 'border-purple-200',
    quantidade: estatisticas.lancado
  },
  // ← ADICIONAR ESTE CARD AQUI
  {
    status: 'finalizado',
    titulo: 'Finalizados',
    icone: PackageCheck,
    cor: 'from-teal-500 to-teal-600',
    corFundo: 'bg-teal-50',
    corBorda: 'border-teal-200',
    quantidade: estatisticas.finalizado
  },
  {
    status: 'cancelado',
    titulo: 'Cancelados',
    icone: XCircle,
    cor: 'from-red-500 to-red-600',
    corFundo: 'bg-red-50',
    corBorda: 'border-red-200',
    quantidade: estatisticas.cancelado
  }
]

// ====================================================================================
// 5. ATUALIZAR O SELECT DE FILTRO (linha ~370)
// ====================================================================================
<select
  value={filtroStatus}
  onChange={(e) => setFiltroStatus(e.target.value)}
  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="todos">Todos os Status</option>
  <option value="rascunho">Rascunho</option>
  <option value="enviado">Enviado</option>
  <option value="aprovado">Aprovado</option>
  <option value="lancado">Lançado</option>
  <option value="finalizado">Finalizado</option>  {/* ← ADICIONAR ESTA LINHA */}
  <option value="rejeitado">Rejeitado</option>
  <option value="cancelado">Cancelado</option>
</select>

// ====================================================================================
// 6. ATUALIZAR IMPORTS NO TOPO DO ARQUIVO (linha ~6)
// ====================================================================================
import { 
  ArrowLeft, FileText, Plus, Search, Edit2, Copy, Ban, Calendar, User, DollarSign,
  Edit, Send, CheckCircle, XCircle, Briefcase, TrendingUp, MapPin, PackageCheck  // ← ADICIONAR PackageCheck
} from 'lucide-react'

// ====================================================================================
// 7. ATUALIZAR GRID DE CARDS (linha ~320)
// ====================================================================================
// Mude de grid-cols-5 para grid-cols-6 para acomodar o novo card
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
  {/* era lg:grid-cols-5, agora é lg:grid-cols-6 */}

// ====================================================================================
// RESUMO DAS MUDANÇAS:
// ====================================================================================
/*
✅ 1. Estado inicial: adicionado finalizado: 0
✅ 2. Cálculo de stats: filtro para contar finalizados
✅ 3. Badge: cor teal (verde-azulada) para finalizado
✅ 4. Novo card: PackageCheck com cor teal
✅ 5. Select de filtro: opção "Finalizado"
✅ 6. Import: PackageCheck do lucide-react
✅ 7. Grid: 6 colunas em vez de 5
*/