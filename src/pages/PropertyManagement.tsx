
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Star, Users, DollarSign, Save, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Property {
  id: number;
  nome: string;
  categoria: string;
  unidades: number;
  localizacao: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  valorMedio: number;
  ocupacao: number;
  avaliacao: number;
  descricao: string;
  comodidades: string[];
  contato: {
    telefone: string;
    email: string;
    gerente: string;
  };
  status: string;
}

export default function PropertyManagement() {
  const [propriedades, setPropriedades] = useState<Property[]>([
    {
      id: 1,
      nome: "Resort Paradise Bay",
      categoria: "Luxo",
      unidades: 45,
      localizacao: "Florianópolis, SC",
      endereco: "Rua das Palmeiras, 1000",
      cep: "88000-000",
      cidade: "Florianópolis",
      estado: "SC",
      valorMedio: 850,
      ocupacao: 92,
      avaliacao: 4.8,
      descricao: "Resort de luxo com vista para o mar",
      comodidades: ["Piscina", "Spa", "Restaurante", "Academia"],
      contato: {
        telefone: "(48) 3333-4444",
        email: "contato@paradisebay.com",
        gerente: "Ana Silva"
      },
      status: "Ativo"
    },
    {
      id: 2,
      nome: "Pousada Villa Boutique",
      categoria: "Boutique",
      unidades: 12,
      localizacao: "Gramado, RS",
      endereco: "Rua Coberta, 234",
      cep: "95670-000",
      cidade: "Gramado",
      estado: "RS",
      valorMedio: 420,
      ocupacao: 88,
      avaliacao: 4.6,
      descricao: "Pousada boutique aconchegante no centro de Gramado",
      comodidades: ["Café da manhã", "Lareira", "Wi-Fi", "Estacionamento"],
      contato: {
        telefone: "(54) 3286-5555",
        email: "reservas@villaboutique.com",
        gerente: "Carlos Mendes"
      },
      status: "Ativo"
    }
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Luxo',
    unidades: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    valorMedio: '',
    descricao: '',
    telefone: '',
    email: '',
    gerente: '',
    comodidades: [] as string[]
  });

  const categorias = [
    { value: 'Luxo', label: 'Luxo', color: 'from-purple-600 to-indigo-600' },
    { value: 'Boutique', label: 'Boutique', color: 'from-pink-600 to-rose-600' },
    { value: 'Cabanas', label: 'Cabanas', color: 'from-green-600 to-emerald-600' },
    { value: 'Turismo', label: 'Turismo', color: 'from-blue-600 to-cyan-600' },
    { value: 'Corporativo', label: 'Corporativo', color: 'from-gray-600 to-slate-600' }
  ];

  const comodidadesDisponiveis = [
    'Piscina', 'Spa', 'Restaurante', 'Academia', 'Wi-Fi', 'Estacionamento',
    'Café da manhã', 'Lareira', 'Bar', 'Sala de reuniões', 'Pet-friendly',
    'Transfer', 'Praia privativa', 'Campo de golf', 'Kids club'
  ];

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: 'Luxo',
      unidades: '',
      endereco: '',
      cep: '',
      cidade: '',
      estado: '',
      valorMedio: '',
      descricao: '',
      telefone: '',
      email: '',
      gerente: '',
      comodidades: []
    });
  };

  const abrirModal = (propriedade: Property | null = null) => {
    if (propriedade) {
      setEditando(propriedade.id);
      setFormData({
        nome: propriedade.nome,
        categoria: propriedade.categoria,
        unidades: propriedade.unidades.toString(),
        endereco: propriedade.endereco,
        cep: propriedade.cep,
        cidade: propriedade.cidade,
        estado: propriedade.estado,
        valorMedio: propriedade.valorMedio.toString(),
        descricao: propriedade.descricao,
        telefone: propriedade.contato.telefone,
        email: propriedade.contato.email,
        gerente: propriedade.contato.gerente,
        comodidades: propriedade.comodidades
      });
    } else {
      setEditando(null);
      resetForm();
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    resetForm();
  };

  const handleSubmit = () => {
    const novaPropriedade: Property = {
      id: editando || Date.now(),
      nome: formData.nome,
      categoria: formData.categoria,
      unidades: parseInt(formData.unidades),
      localizacao: `${formData.cidade}, ${formData.estado}`,
      endereco: formData.endereco,
      cep: formData.cep,
      cidade: formData.cidade,
      estado: formData.estado,
      valorMedio: parseFloat(formData.valorMedio),
      ocupacao: Math.floor(Math.random() * 30) + 70,
      avaliacao: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      descricao: formData.descricao,
      comodidades: formData.comodidades,
      contato: {
        telefone: formData.telefone,
        email: formData.email,
        gerente: formData.gerente
      },
      status: "Ativo"
    };

    if (editando) {
      setPropriedades(props => props.map(p => p.id === editando ? novaPropriedade : p));
    } else {
      setPropriedades(props => [...props, novaPropriedade]);
    }

    fecharModal();
  };

  const excluirPropriedade = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta propriedade?')) {
      setPropriedades(props => props.filter(p => p.id !== id));
    }
  };

  const toggleComodidade = (comodidade: string) => {
    setFormData(prev => ({
      ...prev,
      comodidades: prev.comodidades.includes(comodidade)
        ? prev.comodidades.filter(c => c !== comodidade)
        : [...prev.comodidades, comodidade]
    }));
  };

  const getCorCategoria = (categoria: string) => {
    return categorias.find(c => c.value === categoria)?.color || 'from-gray-600 to-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Home className="mr-3 text-blue-400" />
                Gestão de Propriedades
              </h1>
              <p className="text-slate-400 mt-2">Cadastro e gerenciamento completo de propriedades</p>
            </div>
            <Button
              onClick={() => abrirModal()}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="mr-2" size={20} />
              Nova Propriedade
            </Button>
          </div>
        </div>

        {/* Lista de Propriedades */}
        <div className="grid gap-6">
          {propriedades.map((propriedade) => (
            <div key={propriedade.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <h3 className="text-xl font-semibold text-white mr-3">{propriedade.nome}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCorCategoria(propriedade.categoria)} text-white`}>
                      {propriedade.categoria}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-slate-300">
                      <MapPin size={16} className="mr-2 text-blue-400" />
                      <span>{propriedade.localizacao}</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Users size={16} className="mr-2 text-green-400" />
                      <span>{propriedade.unidades} unidades</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <DollarSign size={16} className="mr-2 text-yellow-400" />
                      <span>R$ {propriedade.valorMedio}/noite</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Star size={16} className="mr-2 text-yellow-500" />
                      <span>{propriedade.avaliacao}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-slate-400 mb-2">{propriedade.descricao}</p>
                    <div className="flex flex-wrap gap-2">
                      {propriedade.comodidades.slice(0, 4).map((comodidade, index) => (
                        <span key={index} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-sm">
                          {comodidade}
                        </span>
                      ))}
                      {propriedade.comodidades.length > 4 && (
                        <span className="text-slate-500 text-sm">+{propriedade.comodidades.length - 4} mais</span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400">
                    <p><strong className="text-slate-300">Gerente:</strong> {propriedade.contato.gerente}</p>
                    <p><strong className="text-slate-300">Contato:</strong> {propriedade.contato.telefone} | {propriedade.contato.email}</p>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => abrirModal(propriedade)}
                    className="text-slate-400 hover:text-blue-400 hover:bg-slate-700/50"
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => excluirPropriedade(propriedade.id)}
                    className="text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Cadastro/Edição */}
        <Dialog open={modalAberto} onOpenChange={fecharModal}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editando ? 'Editar Propriedade' : 'Nova Propriedade'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">Informações Básicas</h3>
                
                <div>
                  <Label className="text-slate-300">Nome da Propriedade *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Categoria *</Label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({...prev, categoria: e.target.value}))}
                    className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-slate-300">Número de Unidades *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.unidades}
                    onChange={(e) => setFormData(prev => ({...prev, unidades: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Valor Médio por Noite (R$) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valorMedio}
                    onChange={(e) => setFormData(prev => ({...prev, valorMedio: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Descrição</Label>
                  <textarea
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                    className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Localização e Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">Localização</h3>
                
                <div>
                  <Label className="text-slate-300">Endereço *</Label>
                  <Input
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({...prev, endereco: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">CEP *</Label>
                    <Input
                      value={formData.cep}
                      onChange={(e) => setFormData(prev => ({...prev, cep: e.target.value}))}
                      className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Estado *</Label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({...prev, estado: e.target.value}))}
                      className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Cidade *</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => setFormData(prev => ({...prev, cidade: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2 mt-6">Contato</h3>
                
                <div>
                  <Label className="text-slate-300">Telefone *</Label>
                  <Input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({...prev, telefone: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">E-mail *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Gerente Responsável *</Label>
                  <Input
                    value={formData.gerente}
                    onChange={(e) => setFormData(prev => ({...prev, gerente: e.target.value}))}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Comodidades */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2 mb-4">Comodidades</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {comodidadesDisponiveis.map((comodidade) => (
                  <div key={comodidade} className="flex items-center space-x-2">
                    <Checkbox
                      id={comodidade}
                      checked={formData.comodidades.includes(comodidade)}
                      onCheckedChange={() => toggleComodidade(comodidade)}
                    />
                    <Label htmlFor={comodidade} className="text-sm text-slate-300 cursor-pointer">
                      {comodidade}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-600">
              <Button
                variant="secondary"
                onClick={fecharModal}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Save className="mr-2" size={20} />
                {editando ? 'Salvar Alterações' : 'Cadastrar Propriedade'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
