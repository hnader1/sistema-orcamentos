import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Criar cliente Supabase diretamente aqui
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const SearchableSelectFormaPagamento = ({ value, onChange, placeholder = "Selecione a forma de pagamento..." }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [formasPagamento, setFormasPagamento] = useState([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    carregarFormasPagamento()
  }, [])

  const carregarFormasPagamento = async () => {
  try {
    console.log('🔍 Carregando formas de pagamento...')
    
    const { data, error } = await supabase
      .from('formas_pagamento')
      .select('*')
      // REMOVI O .eq('ativo', true) temporariamente
      .order('ordem', { ascending: true })

    console.log('Resultado:', { data, error })

    if (error) throw error
    
    setFormasPagamento(data || [])
    console.log(`✅ ${data?.length || 0} formas carregadas`)
  } catch (error) {
    console.error('❌ Erro ao carregar:', error)
  } finally {
    setLoading(false)
  }
}
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const filteredOptions = formasPagamento.filter(option => {
    const normalizedDesc = normalizeText(option.descricao)
    const normalizedSearch = normalizeText(searchTerm)
    return normalizedDesc.includes(normalizedSearch)
  })

  const selectedOption = formasPagamento.find(opt => opt.id === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchTerm])

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => prev < filteredOptions.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        break
    }
  }

  const handleSelect = (option) => {
    onChange(option.id)
    setIsOpen(false)
    setSearchTerm('')
  }

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const listElement = dropdownRef.current?.querySelector('.options-list')
      const highlightedElement = listElement?.children[highlightedIndex]
      
      if (highlightedElement && listElement) {
        const listRect = listElement.getBoundingClientRect()
        const itemRect = highlightedElement.getBoundingClientRect()
        
        if (itemRect.bottom > listRect.bottom) {
          highlightedElement.scrollIntoView({ block: 'end', behavior: 'smooth' })
        } else if (itemRect.top < listRect.top) {
          highlightedElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
        }
      }
    }
  }, [highlightedIndex, isOpen])

  if (loading) {
    return (
      <div className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500">
        Carregando formas de pagamento...
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full p-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={selectedOption ? selectedOption.descricao : placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {filteredOptions.length > 0 ? (
            <ul className="options-list overflow-y-auto max-h-80">
              {filteredOptions.map((option, index) => (
                <li
                  key={option.id}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  } ${value === option.id ? 'bg-blue-50 font-semibold' : ''}`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span>{option.descricao}</span>
                      <span className="text-xs text-gray-500 ml-2">({option.categoria})</span>
                    </div>
                    {value === option.id && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-gray-500">
              Nenhuma forma de pagamento encontrada
            </div>
          )}
          
          {searchTerm && filteredOptions.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
              {filteredOptions.length} resultado{filteredOptions.length !== 1 ? 's' : ''} encontrado{filteredOptions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchableSelectFormaPagamento