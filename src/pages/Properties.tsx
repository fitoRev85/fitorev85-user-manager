
import React, { useState } from 'react';
import { Building2, LogOut, ArrowRight, TrendingUp, Users, DollarSign, Percent, MapPin, Star, Plus, Trash2, Edit, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Properties = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [properties, setProperties] = useState([
    { 
      id: '1', 
      name: 'Grand Hotel Luxo', 
      category: 'Luxo', 
      uh: 120, 
      city: 'São Paulo',
      address: 'Av. Paulista, 1000',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop',
      revpar: 285.50,
      occupancy: 78,
      adr: 365,
      revenue: 342000,
      rating: 4.8,
      trend: 'up'
    },
    { 
      id: '2', 
      name: 'Boutique Charm', 
      category: 'Boutique', 
      uh: 45, 
      city: 'Rio de Janeiro',
      address: 'Rua das Laranjeiras, 500',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop',
      revpar: 195.30,
      occupancy: 85,
      adr: 230,
      revenue: 87900,
      rating: 4.6,
      trend: 'up'
    },
    { 
      id: '3', 
      name: 'Resort Paradise', 
      category: 'Resort', 
      uh: 200, 
      city: 'Florianópolis',
      address: 'Praia do Campeche, 2000',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop',
      revpar: 220.75,
      occupancy: 82,
      adr: 269,
      revenue: 441500,
      rating: 4.7,
      trend: 'stable'
    },
    { 
      id: '4', 
      name: 'Business Center', 
      category: 'Corporativo', 
      uh: 80, 
      city: 'Brasília',
      address: 'SAS Quadra 1, Bloco A',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
      revpar: 165.40,
      occupancy: 72,
      adr: 230,
      revenue: 132320,
      rating: 4.4,
      trend: 'down'
    }
  ]);

  const [newProperty, setNewProperty] = useState({
    name: '',
    category: 'Luxo',
    uh: '',
    city: '',
    address: '',
    image: '',
    rating: 4.0
  });

  const handleCreateProperty = () => {
    const property = {
      id: (properties.length + 1).toString(),
      ...newProperty,
      uh: parseInt(newProperty.uh),
      revpar: Math.random() * 200 + 100,
      occupancy: Math.random() * 30 + 60,
      adr: Math.random() * 200 + 200,
      revenue: Math.random() * 300000 + 100000,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    setProperties([...properties, property]);
    setNewProperty({
      name: '',
      category: 'Luxo',
      uh: '',
      city: '',
      address: '',
      image: '',
      rating: 4.0
    });
    setShowCreateModal(false);
  };

  const handleDeleteProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-yellow-400 rounded-full" />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Luxo':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Boutique':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Resort':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Corporativo':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  FitoRev85
                </h1>
                <p className="text-xs text-slate-400">Revenue Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.nome}</p>
                <p className="text-xs text-slate-400">Revenue Manager</p>
              </div>
              {user?.categoria === 'admin' && (
                <button
                  onClick={() => navigate('/users')}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors border border-slate-600/50"
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  Usuários
                </button>
              )}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Suas Propriedades</h2>
              <p className="text-slate-400">Selecione uma propriedade para acessar os módulos de Revenue Management</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Propriedade
            </button>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {properties.map((property) => (
              <div 
                key={property.id}
                className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:bg-slate-700/50 transition-all duration-300 relative"
              >
                {/* Property Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(property.category)}`}>
                      {property.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2">
                      {getTrendIcon(property.trend)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProperty(property.id);
                      }}
                      className="bg-red-600/80 backdrop-blur-sm rounded-lg p-2 hover:bg-red-700/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                </div>

                {/* Property Info */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => navigate(`/rms/${property.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{property.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{property.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{property.rating}</span>
                        <span>•</span>
                        <span>{property.uh} UH</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* KPIs Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-slate-400">RevPAR</span>
                      </div>
                      <div className="text-lg font-bold text-white">R$ {property.revpar.toFixed(2)}</div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Percent className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-400">Ocupação</span>
                      </div>
                      <div className="text-lg font-bold text-white">{property.occupancy}%</div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-400">ADR</span>
                      </div>
                      <div className="text-lg font-bold text-white">R$ {property.adr}</div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-slate-400">Receita</span>
                      </div>
                      <div className="text-lg font-bold text-white">R$ {(property.revenue / 1000).toFixed(0)}k</div>
                    </div>
                  </div>

                  {/* Performance Indicator */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Performance vs Meta</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              property.occupancy >= 85 ? 'bg-green-500' :
                              property.occupancy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(property.occupancy, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          property.occupancy >= 85 ? 'text-green-400' :
                          property.occupancy >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {property.occupancy >= 85 ? 'Excelente' :
                           property.occupancy >= 70 ? 'Bom' : 'Atenção'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="mt-12 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Resumo Geral do Portfolio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {properties.length}
                </div>
                <div className="text-sm text-slate-400">Propriedades Ativas</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {properties.reduce((sum, p) => sum + p.uh, 0)}
                </div>
                <div className="text-sm text-slate-400">Total de UH</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {Math.round(properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length)}%
                </div>
                <div className="text-sm text-slate-400">Ocupação Média</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  R$ {(properties.reduce((sum, p) => sum + p.revenue, 0) / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-slate-400">Receita Total</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Property Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nova Propriedade</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da propriedade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
                <select
                  value={newProperty.category}
                  onChange={(e) => setNewProperty({...newProperty, category: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Luxo">Luxo</option>
                  <option value="Boutique">Boutique</option>
                  <option value="Resort">Resort</option>
                  <option value="Corporativo">Corporativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Unidades Habitacionais</label>
                <input
                  type="number"
                  value={newProperty.uh}
                  onChange={(e) => setNewProperty({...newProperty, uh: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de quartos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                <input
                  type="text"
                  value={newProperty.city}
                  onChange={(e) => setNewProperty({...newProperty, city: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Endereço</label>
                <input
                  type="text"
                  value={newProperty.address}
                  onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL da Imagem</label>
                <input
                  type="url"
                  value={newProperty.image}
                  onChange={(e) => setNewProperty({...newProperty, image: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateProperty}
                disabled={!newProperty.name || !newProperty.uh || !newProperty.city}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Criar Propriedade
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
