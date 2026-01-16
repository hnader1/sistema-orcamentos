import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function FormasPagamentoAdmin() {
  const navigate = useNavigate()
  const { podeAcessarLancamento } = useAuth()
  const [formasPagamento, setFormasPagamento] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todas')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [formaSelecionada, setFormaSelecionada] = useState(null)

  // Verificar permissão
  useEffect(() => {
    if (!podeAcessarLancamento()) {
      navigate('/orcamentos')
    } else {
      carregarFormas()
    }
  }, [])

  const carregarFormas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('formas_pagamento')
        .select('*')
        .order('ordem', { ascending: true })

      if (error) throw error
      setFormasPagamento(data || [])
    } catch (error) {
      console.error('Erro ao carregar formas:', error)
      alert('Erro ao carregar formas de pagamento')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar formas
  const formasFiltradas = formasPagamento.filter(forma => {
    const matchCategoria = filtroCategoria === 'todas' || forma.categoria === filtroCategoria
    const matchStatus = filtroStatus === 'todas' || 
      (filtroStatus === 'ativas' && forma.ativo) ||
      (filtroStatus === 'inativas' && !forma.ativo)
    return matchCategoria && matchStatus
  })

  // Categorias únicas
  const categorias = [...new Set(formasPagamento.map(f => f.categoria))].sort()

  // Alternar status ativo/inativo
  const toggleAtivo = async (id, ativoAtual) => {
    try {
      const { error } = await supabase
        .from('formas_pagamento')
        .update({ ativo: !ativoAtual })
        .eq('id', id)

      if (error) throw error
      
      alert(ativoAtual ? 'Forma desativada!' : 'Forma ativada!')
      carregarFormas()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status')
    }
  }

  // Deletar forma
  const deletar = async (id, descricao) => {
    if (!confirm(`Tem certeza que deseja DELETAR a forma "${descricao}"?\n\nEsta ação não pode ser desfeita!`)) return

    try {
      const { error } = await supabase
        .from('formas_pagamento')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('Forma deletada com sucesso!')
      carregarFormas()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar: ' + error.message)
    }
  }

  // Reordenar
  const moverOrdem = async (id, ordemAtual, direcao) => {
    const novaOrdem = direcao === 'up' ? ordemAtual - 1 : ordemAtual + 1
    
    try {
      const { error } = await supabase
        .from('formas_pagamento')
        .update({ ordem: novaOrdem })
        .eq('id', id)

      if (error) throw error
      carregarFormas()
    } catch (error) {
      console.error('Erro ao reordenar:', error)
      alert('Erro ao reordenar')
    }
  }

  if (!podeAcessarLancamento()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                💳 Formas de Pagamento
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie as formas de pagamento disponíveis no sistema
              </p>
            </div>
            <button
              onClick={() => {
                setFormaSelecionada(null)
                setMostrarModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Nova Forma
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="todas">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="todas">Todas</option>
                <option value="ativas">Apenas Ativas</option>
                <option value="inativas">Apenas Inativas</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <strong>{formasFiltradas.length}</strong> forma(s) encontrada(s)
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : formasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma forma de pagamento encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Ordem
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                      Dias
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                      Parcelas
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formasFiltradas.map((forma) => (
                    <tr key={forma.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            {forma.ordem}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => moverOrdem(forma.id, forma.ordem, 'up')}
                              className="p-0.5 text-gray-400 hover:text-blue-600"
                              title="Mover para cima"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moverOrdem(forma.id, forma.ordem, 'down')}
                              className="p-0.5 text-gray-400 hover:text-blue-600"
                              title="Mover para baixo"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {forma.descricao}
                        </div>
                        <div className="text-xs text-gray-500">
                          {forma.codigo}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {forma.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {forma.dias_total || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {forma.parcelas || 1}x
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleAtivo(forma.id, forma.ativo)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                            forma.ativo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {forma.ativo ? (
                            <>
                              <CheckCircle size={14} />
                              Ativa
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              Inativa
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setFormaSelecionada(forma)
                              setMostrarModal(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deletar(forma.id, forma.descricao)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar - Vamos criar no próximo passo */}
      {mostrarModal && (
        <ModalFormaPagamento
          forma={formaSelecionada}
          onClose={() => {
            setMostrarModal(false)
            setFormaSelecionada(null)
          }}
          onSave={() => {
            setMostrarModal(false)
            setFormaSelecionada(null)
            carregarFormas()
          }}
        />
      )}
    </div>
  )
}
// COMPONENTE MODAL
function ModalFormaPagamento({ forma, onClose, onSave }) {
  const [formData, setFormData] = useState({
    codigo: forma?.codigo || '',
    descricao: forma?.descricao || '',
    categoria: forma?.categoria || 'Boleto',
    dias_total: forma?.dias_total || null,
    parcelas: forma?.parcelas || 1,
    ordem: forma?.ordem || 100,
    ativo: forma?.ativo ?? true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.codigo || !formData.descricao || !formData.categoria) {
      alert('Preencha os campos obrigatórios!')
      return
    }

    try {
      setSaving(true)

      if (forma) {
        // Editar
        const { error } = await supabase
          .from('formas_pagamento')
          .update({
            codigo: formData.codigo,
            descricao: formData.descricao,
            categoria: formData.categoria,
            dias_total: formData.dias_total || null,
            parcelas: parseInt(formData.parcelas) || 1,
            ordem: parseInt(formData.ordem) || 100,
            ativo: formData.ativo
          })
          .eq('id', forma.id)

        if (error) throw error
        alert('Forma de pagamento atualizada!')
      } else {
        // Criar
        const { error } = await supabase
          .from('formas_pagamento')
          .insert([{
            codigo: formData.codigo,
            descricao: formData.descricao,
            categoria: formData.categoria,
            dias_total: formData.dias_total || null,
            parcelas: parseInt(formData.parcelas) || 1,
            ordem: parseInt(formData.ordem) || 100,
            ativo: formData.ativo
          }])

        if (error) throw error
        alert('Forma de pagamento criada!')
      }

      onSave()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">
            {forma ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código * <span className="text-xs text-gray-500">(identificador único)</span>
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: boleto_30d"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição * <span className="text-xs text-gray-500">(aparece para o usuário)</span>
              </label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Boleto 30 dias"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="À Vista">À Vista</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Boleto">Boleto</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            {/* Grid: Dias Total + Parcelas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias Total <span className="text-xs text-gray-500">(opcional)</span>
                </label>
                <input
                  type="number"
                  value={formData.dias_total || ''}
                  onChange={(e) => setFormData({ ...formData, dias_total: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Ex: 30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parcelas
                </label>
                <input
                  type="number"
                  value={formData.parcelas}
                  onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Grid: Ordem + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem <span className="text-xs text-gray-500">(para ordenação)</span>
                </label>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center h-10">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativa</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : (forma ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </div>
    </div>
  )
}
