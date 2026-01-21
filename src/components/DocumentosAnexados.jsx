// src/components/DocumentosAnexados.jsx
// =====================================================
// COMPONENTE: Upload e visualização de documentos anexados à proposta
// =====================================================

import React, { useState, useEffect, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Trash2, 
  Download, 
  Eye,
  Paperclip,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'

// Categorias de documentos
const CATEGORIAS = [
  { value: 'aceite_cliente', label: '✅ Aceite do Cliente', cor: 'green' },
  { value: 'pedido_compra', label: '📋 Pedido de Compra', cor: 'blue' },
  { value: 'contrato', label: '📄 Contrato', cor: 'purple' },
  { value: 'nota_fiscal', label: '🧾 Nota Fiscal', cor: 'orange' },
  { value: 'comprovante', label: '💳 Comprovante', cor: 'teal' },
  { value: 'interno', label: '🔒 Documento Interno', cor: 'gray' },
  { value: 'outro', label: '📎 Outro', cor: 'slate' }
]

// Ícone baseado no tipo de arquivo
const getFileIcon = (tipo) => {
  if (!tipo) return <File size={20} />
  if (tipo.startsWith('image/')) return <Image size={20} className="text-purple-500" />
  if (tipo.includes('pdf')) return <FileText size={20} className="text-red-500" />
  if (tipo.includes('word') || tipo.includes('doc')) return <FileText size={20} className="text-blue-500" />
  if (tipo.includes('excel') || tipo.includes('sheet')) return <FileText size={20} className="text-green-500" />
  return <File size={20} className="text-gray-500" />
}

// Formatar tamanho do arquivo
const formatarTamanho = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentosAnexados({ orcamentoId, disabled = false }) {
  const { user, isAdmin, isComercialInterno } = useAuth()
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mostrarUpload, setMostrarUpload] = useState(false)
  const [categoriaUpload, setCategoriaUpload] = useState('interno')
  const [descricaoUpload, setDescricaoUpload] = useState('')
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null)
  const [erro, setErro] = useState(null)
  const fileInputRef = useRef(null)

  // Carregar documentos
  useEffect(() => {
    if (orcamentoId) {
      carregarDocumentos()
    }
  }, [orcamentoId])

  const carregarDocumentos = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('orcamentos_documentos')
        .select('*')
        .eq('orcamento_id', orcamentoId)
        .eq('excluido', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setDocumentos(data || [])
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Upload de arquivo
  const handleUpload = async () => {
    if (!arquivoSelecionado) {
      setErro('Selecione um arquivo')
      return
    }

    try {
      setUploading(true)
      setErro(null)

      const arquivo = arquivoSelecionado
      const extensao = arquivo.name.split('.').pop()
      const nomeUnico = `${orcamentoId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extensao}`

      // 1. Upload para o Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-propostas')
        .upload(nomeUnico, arquivo, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 2. Registrar no banco
      const { data: docData, error: docError } = await supabase
        .from('orcamentos_documentos')
        .insert({
          orcamento_id: orcamentoId,
          nome_arquivo: nomeUnico,
          nome_original: arquivo.name,
          tipo_arquivo: arquivo.type,
          tamanho_bytes: arquivo.size,
          storage_path: uploadData.path,
          categoria: categoriaUpload,
          descricao: descricaoUpload || null,
          enviado_por_id: user?.id,
          enviado_por_nome: user?.nome
        })
        .select()
        .single()

      if (docError) throw docError

      // 3. Atualizar lista
      setDocumentos(prev => [docData, ...prev])
      
      // 4. Limpar form
      setArquivoSelecionado(null)
      setDescricaoUpload('')
      setCategoriaUpload('interno')
      setMostrarUpload(false)
      if (fileInputRef.current) fileInputRef.current.value = ''

      alert('✅ Documento anexado com sucesso!')

    } catch (error) {
      console.error('Erro no upload:', error)
      setErro(error.message)
    } finally {
      setUploading(false)
    }
  }

  // Baixar/visualizar documento
  const handleDownload = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-propostas')
        .createSignedUrl(doc.storage_path, 3600) // URL válida por 1 hora

      if (error) throw error

      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Erro ao baixar:', error)
      alert('Erro ao baixar documento: ' + error.message)
    }
  }

  // Excluir documento
  const handleExcluir = async (doc) => {
    if (!confirm(`Excluir "${doc.nome_original}"?`)) return

    try {
      // Soft delete
      const { error } = await supabase
        .from('orcamentos_documentos')
        .update({
          excluido: true,
          excluido_em: new Date().toISOString(),
          excluido_por: user?.nome
        })
        .eq('id', doc.id)

      if (error) throw error

      setDocumentos(prev => prev.filter(d => d.id !== doc.id))
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir: ' + error.message)
    }
  }

  // Pode excluir?
  const podeExcluir = () => {
    return isAdmin() || isComercialInterno()
  }

  // Obter cor da categoria
  const getCategoriaCor = (categoria) => {
    const cat = CATEGORIAS.find(c => c.value === categoria)
    return cat?.cor || 'gray'
  }

  // Obter label da categoria
  const getCategoriaLabel = (categoria) => {
    const cat = CATEGORIAS.find(c => c.value === categoria)
    return cat?.label || categoria
  }

  if (!orcamentoId) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Paperclip className="text-gray-500" size={20} />
          <h2 className="text-lg font-semibold">Documentos Anexados</h2>
          {documentos.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {documentos.length}
            </span>
          )}
        </div>
        
        {!disabled && (
          <button
            onClick={() => setMostrarUpload(!mostrarUpload)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Upload size={16} />
            Anexar Documento
          </button>
        )}
      </div>

      {/* Formulário de Upload */}
      {mostrarUpload && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-blue-800">Novo Documento</h3>
            <button
              onClick={() => {
                setMostrarUpload(false)
                setArquivoSelecionado(null)
                setErro(null)
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Seleção de arquivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setArquivoSelecionado(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
              {arquivoSelecionado && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {arquivoSelecionado.name} ({formatarTamanho(arquivoSelecionado.size)})
                </p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={categoriaUpload}
                onChange={(e) => setCategoriaUpload(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={descricaoUpload}
                onChange={(e) => setDescricaoUpload(e.target.value)}
                placeholder="Ex: Pedido de compra assinado"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {erro}
              </div>
            )}

            {/* Botão Upload */}
            <button
              onClick={handleUpload}
              disabled={!arquivoSelecionado || uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Enviar Documento
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Documentos */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          Carregando documentos...
        </div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <Paperclip size={32} className="mx-auto mb-2 opacity-50" />
          Nenhum documento anexado
        </div>
      ) : (
        <div className="space-y-2">
          {documentos.map(doc => (
            <div 
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(doc.tipo_arquivo)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {doc.nome_original}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${getCategoriaCor(doc.categoria)}-100 text-${getCategoriaCor(doc.categoria)}-700`}>
                      {getCategoriaLabel(doc.categoria)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{formatarTamanho(doc.tamanho_bytes)}</span>
                    <span>•</span>
                    <span>{doc.enviado_por_nome}</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {doc.descricao && (
                    <p className="text-xs text-gray-600 mt-1">{doc.descricao}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  title="Baixar/Visualizar"
                >
                  <Download size={18} />
                </button>
                
                {podeExcluir() && !disabled && (
                  <button
                    onClick={() => handleExcluir(doc)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legenda de categorias */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Categorias:</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.slice(0, 4).map(cat => (
            <span 
              key={cat.value}
              className={`px-2 py-1 text-xs rounded-full bg-${cat.cor}-50 text-${cat.cor}-600`}
            >
              {cat.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DocumentosAnexados