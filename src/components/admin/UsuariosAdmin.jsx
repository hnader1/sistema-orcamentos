import { useState, useEffect } from 'react'
import { Plus, Edit2, Power, Search, X, Save, AlertCircle, Eye, EyeOff, Key, RefreshCw } from 'lucide-react'
import { supabase } from '../../services/supabase'

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false)
  const [editando, setEditando] = useState(null)
  const [usuarioSenha, setUsuarioSenha] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'vendedor',
    telefone: '',
    ativo: true,
    codigo_vendedor: ''
  })

  const [erros, setErros] = useState({})

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      console.log('👥 Carregando usuários...')

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error

      console.log('✅ Usuários carregados:', data?.length || 0)
      setUsuarios(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      alert('Erro ao carregar usuários: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    if (!busca) return true
    const buscaLower = busca.toLowerCase()
    return (
      u.nome?.toLowerCase().includes(buscaLower) ||
      u.email?.toLowerCase().includes(buscaLower) ||
      u.tipo?.toLowerCase().includes(buscaLower) ||
      u.telefone?.toLowerCase().includes(buscaLower) ||
      u.codigo_vendedor?.toLowerCase().includes(buscaLower)
    )
  })

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setEditando(usuario)
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        tipo: usuario.tipo || 'vendedor',
        telefone: usuario.telefone || '',
        ativo: usuario.ativo !== false,
        codigo_vendedor: usuario.codigo_vendedor || ''
      })
    } else {
      setEditando(null)
      setFormData({
        nome: '',
        email: '',
        senha: '',
        tipo: 'vendedor',
        telefone: '',
        ativo: true,
        codigo_vendedor: ''
      })
    }
    setErros({})
    setMostrarSenha(false)
    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setEditando(null)
    setErros({})
    setMostrarSenha(false)
  }

  // Modal de Reset de Senha
  const abrirModalSenha = (usuario) => {
    setUsuarioSenha(usuario)
    setNovaSenha('')
    setConfirmarNovaSenha('')
    setMostrarSenha(false)
    setMostrarModalSenha(true)
  }

  const fecharModalSenha = () => {
    setMostrarModalSenha(false)
    setUsuarioSenha(null)
    setNovaSenha('')
    setConfirmarNovaSenha('')
  }

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validarCodigoVendedor = (codigo) => {
    if (!codigo) return true
    const codigoUpper = codigo.toUpperCase()
    if (codigoUpper.length < 2 || codigoUpper.length > 3) return false
    if (!/^[A-Z]{2,3}$/.test(codigoUpper)) return false
    return true
  }

  const validarForm = () => {
    const novosErros = {}

    if (!formData.nome?.trim()) {
      novosErros.nome = 'Campo obrigatório'
    }

    if (!formData.email?.trim()) {
      novosErros.email = 'Campo obrigatório'
    } else if (!validarEmail(formData.email)) {
      novosErros.email = 'Email inválido'
    }

    // Senha obrigatória apenas ao criar novo usuário
    if (!editando) {
      if (!formData.senha) {
        novosErros.senha = 'Campo obrigatório'
      } else if (formData.senha.length < 6) {
        novosErros.senha = 'Senha deve ter no mínimo 6 caracteres'
      }
    }

    if (!formData.tipo) {
      novosErros.tipo = 'Campo obrigatório'
    }

    if (formData.codigo_vendedor && !validarCodigoVendedor(formData.codigo_vendedor)) {
      novosErros.codigo_vendedor = 'Código deve ter 2 ou 3 letras (apenas A-Z)'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const salvar = async () => {
    if (!validarForm()) return

    try {
      setSalvando(true)

      const codigo = formData.codigo_vendedor?.trim().toUpperCase() || null
      const emailLower = formData.email.trim().toLowerCase()

      // Verificar duplicata de código
      if (codigo) {
        const { data: duplicatas } = await supabase
          .from('usuarios')
          .select('id, nome')
          .eq('codigo_vendedor', codigo)
          .neq('id', editando?.id || '00000000-0000-0000-0000-000000000000')

        if (duplicatas && duplicatas.length > 0) {
          alert(`Este código já está em uso por: ${duplicatas[0].nome}`)
          setSalvando(false)
          return
        }
      }

      if (editando) {
        // ========== EDITANDO USUÁRIO EXISTENTE ==========
        console.log('📝 Atualizando usuário:', editando.id)
        
        const dadosUpdate = {
          nome: formData.nome.trim(),
          tipo: formData.tipo,
          telefone: formData.telefone?.trim() || null,
          ativo: formData.ativo,
          codigo_vendedor: codigo
        }

        const { error } = await supabase
          .from('usuarios')
          .update(dadosUpdate)
          .eq('id', editando.id)

        if (error) throw error
        
        console.log('✅ Usuário atualizado!')
        alert('Usuário atualizado com sucesso!')

      } else {
        // ========== CRIANDO NOVO USUÁRIO ==========
        console.log('✨ Criando novo usuário...')
        
        // Verificar se email já existe
        const { data: existente } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', emailLower)
          .single()

        if (existente) {
          alert('Este email já está cadastrado!')
          setSalvando(false)
          return
        }

        // Criar usuário na tabela
        const dadosInsert = {
          email: emailLower,
          senha: formData.senha, // Senha em texto (sistema atual)
          senha_hash: formData.senha, // Preenche também para NOT NULL constraint
          nome: formData.nome.trim(),
          tipo: formData.tipo,
          telefone: formData.telefone?.trim() || null,
          ativo: formData.ativo,
          codigo_vendedor: codigo
        }

        const { error } = await supabase
          .from('usuarios')
          .insert([dadosInsert])

        if (error) throw error

        console.log('✅ Usuário criado!')
        alert('Usuário criado com sucesso! Já pode fazer login.')
      }

      fecharModal()
      carregarUsuarios()
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar usuário: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  // ========== RESETAR SENHA (direto na tabela) ==========
  const resetarSenha = async () => {
    if (!novaSenha) {
      alert('Digite a nova senha')
      return
    }
    
    if (novaSenha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres')
      return
    }
    
    if (novaSenha !== confirmarNovaSenha) {
      alert('As senhas não conferem')
      return
    }

    try {
      setSalvando(true)
      console.log('🔑 Resetando senha para:', usuarioSenha.email)

      const { error } = await supabase
        .from('usuarios')
        .update({ senha: novaSenha, senha_hash: novaSenha })
        .eq('id', usuarioSenha.id)

      if (error) throw error

      console.log('✅ Senha resetada com sucesso!')
      alert(`Senha alterada com sucesso para ${usuarioSenha.nome}!`)
      fecharModalSenha()
    } catch (error) {
      console.error('❌ Erro ao resetar senha:', error)
      alert('Erro ao resetar senha: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  const toggleAtivo = async (usuario) => {
    const novoStatus = !usuario.ativo
    const acao = novoStatus ? 'ativar' : 'desativar'
    
    if (!confirm(`Deseja ${acao} o usuário "${usuario.nome}"?`)) return

    try {
      console.log(`🔄 ${acao} usuário:`, usuario.id)
      
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: novoStatus })
        .eq('id', usuario.id)

      if (error) throw error

      console.log(`✅ Usuário ${novoStatus ? 'ativado' : 'desativado'}!`)
      carregarUsuarios()
    } catch (error) {
      console.error('❌ Erro:', error)
      alert(`Erro ao ${acao} usuário: ` + error.message)
    }
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      admin: 'Administrador',
      comercial: 'Comercial',
      comercial_interno: 'Comercial Interno',
      vendedor: 'Vendedor'
    }
    return labels[tipo] || tipo
  }

  const getTipoColor = (tipo) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      comercial: 'bg-blue-100 text-blue-800',
      comercial_interno: 'bg-indigo-100 text-indigo-800',
      vendedor: 'bg-green-100 text-green-800'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gerenciar Usuários</h2>
          <p className="text-sm text-gray-600">
            {usuarios.length} usuários cadastrados ({usuarios.filter(u => u.ativo).length} ativos)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={carregarUsuarios}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, email, tipo, telefone ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando usuários...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {usuariosFiltrados.map((usuario) => (
            <div
              key={usuario.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                usuario.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {usuario.nome}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(usuario.tipo)}`}>
                      {getTipoLabel(usuario.tipo)}
                    </span>
                    {usuario.codigo_vendedor && (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-800">
                        {usuario.codigo_vendedor}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        usuario.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">📧 Email:</span>
                      <p className="font-medium">{usuario.email}</p>
                    </div>
                    {usuario.telefone && (
                      <div>
                        <span className="text-gray-600">📞 Telefone:</span>
                        <p className="font-medium">{usuario.telefone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => abrirModalSenha(usuario)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Resetar Senha"
                  >
                    <Key size={20} />
                  </button>
                  <button
                    onClick={() => abrirModal(usuario)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => toggleAtivo(usuario)}
                    className={`p-2 rounded-lg transition-colors ${
                      usuario.ativo
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={usuario.ativo ? 'Desativar' : 'Ativar'}
                  >
                    <Power size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar Usuário */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editando ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={fecharModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    erros.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: João Silva"
                />
                {erros.nome && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {erros.nome}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    erros.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="usuario@email.com"
                  disabled={editando}
                />
                {erros.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {erros.email}
                  </p>
                )}
                {editando && (
                  <p className="text-gray-500 text-xs mt-1">Email não pode ser alterado</p>
                )}
              </div>

              {/* Senha - Apenas ao criar */}
              {!editando && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 pr-10 ${
                        erros.senha ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {erros.senha && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {erros.senha}
                    </p>
                  )}
                </div>
              )}

              {/* Tipo e Telefone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Usuário *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      erros.tipo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="vendedor">Vendedor</option>
                    <option value="comercial_interno">Comercial Interno</option>
                    <option value="admin">Administrador</option>
                  </select>
                  {erros.tipo && (
                    <p className="text-red-600 text-sm mt-1">{erros.tipo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="(31) 99999-9999"
                  />
                </div>
              </div>

              {/* Código do Vendedor */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código do Vendedor (Propostas)
                  <span className="text-xs text-gray-500 ml-2">(2 ou 3 letras - opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.codigo_vendedor}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    codigo_vendedor: e.target.value.toUpperCase() 
                  })}
                  placeholder="Ex: NP, CF, MSS"
                  maxLength={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 uppercase font-bold text-center ${
                    erros.codigo_vendedor ? 'border-red-500 bg-red-50' : 'border-purple-300'
                  }`}
                />
                {erros.codigo_vendedor && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {erros.codigo_vendedor}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  💡 Usado na numeração automática das propostas
                </p>
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Usuário ativo (pode acessar o sistema)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={fecharModal}
                disabled={salvando}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reset de Senha */}
      {mostrarModalSenha && usuarioSenha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                🔑 Resetar Senha
              </h3>
              <button
                onClick={fecharModalSenha}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Usuário:</p>
                <p className="font-semibold text-gray-900">{usuarioSenha.nome}</p>
                <p className="text-sm text-gray-500">{usuarioSenha.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={fecharModalSenha}
                disabled={salvando}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={resetarSenha}
                disabled={salvando || !novaSenha}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Key size={20} />
                {salvando ? 'Salvando...' : 'Resetar Senha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
