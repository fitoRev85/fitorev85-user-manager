
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, MapPin, Star, Users, Calendar, DollarSign, TrendingUp, Eye, Bed, Wifi, Car, Coffee, Dumbbell, Waves, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function HotelManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([
    {
      id: 1,
      name: 'Hotel Luxo Imperial',
      category: 'Luxo',
      location: 'Copacabana, Rio de Janeiro',
      rating: 5,
      rooms: 120,
      occupancy: 85,
      revenue: 450000,
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop',
      amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking'],
      priceRange: { min: 800, max: 2500 },
      status: 'Ativo'
    },
    {
      id: 2,
      name: 'Boutique Casa Colonial',
      category: 'Boutique',
      location: 'Pelourinho, Salvador',
      rating: 4,
      rooms: 25,
      occupancy: 92,
      revenue: 180000,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop',
      amenities: ['wifi', 'restaurant', 'spa'],
      priceRange: { min: 350, max: 850 },
      status: 'Ativo'
    },
    {
      id: 3,
      name: 'Cabanas Vista Mar',
      category: 'Cabanas',
      location: 'Jericoacoara, Ceará',
      rating: 4,
      rooms: 15,
      occupancy: 78,
      revenue: 95000,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
      amenities: ['wifi', 'pool', 'restaurant'],
      priceRange: { min: 250, max: 600 },
      status: 'Ativo'
    },
    {
      id: 4,
      name: 'Business Center SP',
      category: 'Corporativo',
      location: 'Faria Lima, São Paulo',
      rating: 4,
      rooms: 200,
      occupancy: 65,
      revenue: 320000,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
      amenities: ['wifi', 'gym', 'restaurant', 'parking', 'business'],
      priceRange: { min: 280, max: 750 },
      status: 'Ativo'
    }
  ]);

  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [locationFilter, setLocationFilter] = useState('Todas');

  const categories = ['Luxo', 'Boutique', 'Cabanas', 'Turismo', 'Corporativo'];
  const locations = [...new Set(properties.map(p => p.location.split(', ')[1]))];

  const [newProperty, setNewProperty] = useState({
    name: '',
    category: 'Luxo',
    location: '',
    rooms: '',
    description: '',
    amenities: [],
    priceMin: '',
    priceMax: '',
    images: []
  });

  // Dados do Dashboard
  const totalProperties = properties.length;
  const totalRooms = properties.reduce((sum, p) => sum + p.rooms, 0);
  const averageOccupancy = Math.round(properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length);
  const totalRevenue = properties.reduce((sum, p) => sum + p.revenue, 0);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || property.category === categoryFilter;
    const matchesLocation = locationFilter === 'Todas' || property.location.includes(locationFilter);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleSaveProperty = () => {
    if (editingProperty) {
      setProperties(properties.map(p => 
        p.id === editingProperty.id 
          ? { 
              ...editingProperty, 
              ...newProperty,
              id: editingProperty.id,
              occupancy: editingProperty.occupancy,
              revenue: editingProperty.revenue,
              rating: editingProperty.rating,
              status: editingProperty.status,
              image: editingProperty.image,
              priceRange: { min: parseInt(newProperty.priceMin), max: parseInt(newProperty.priceMax) },
              rooms: parseInt(newProperty.rooms)
            }
          : p
      ));
    } else {
      const newId = Math.max(...properties.map(p => p.id)) + 1;
      setProperties([...properties, {
        id: newId,
        ...newProperty,
        rooms: parseInt(newProperty.rooms),
        occupancy: Math.floor(Math.random() * 40) + 60,
        revenue: Math.floor(Math.random() * 200000) + 50000,
        rating: Math.floor(Math.random() * 2) + 4,
        status: 'Ativo',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop',
        priceRange: { min: parseInt(newProperty.priceMin), max: parseInt(newProperty.priceMax) }
      }]);
    }
    setShowPropertyModal(false);
    setEditingProperty(null);
    setNewProperty({
      name: '',
      category: 'Luxo',
      location: '',
      rooms: '',
      description: '',
      amenities: [],
      priceMin: '',
      priceMax: '',
      images: []
    });
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setNewProperty({
      name: property.name,
      category: property.category,
      location: property.location,
      rooms: property.rooms.toString(),
      description: property.description || '',
      amenities: property.amenities,
      priceMin: property.priceRange.min.toString(),
      priceMax: property.priceRange.max.toString(),
      images: property.images || []
    });
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const toggleAmenity = (amenity) => {
    setNewProperty(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const amenityIcons = {
    wifi: <Wifi className="w-4 h-4" />,
    pool: <Waves className="w-4 h-4" />,
    gym: <Dumbbell className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    restaurant: <Coffee className="w-4 h-4" />,
    spa: <Star className="w-4 h-4" />,
    business: <Users className="w-4 h-4" />
  };

  const PropertyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-white">
          {editingProperty ? 'Editar Propriedade' : 'Nova Propriedade'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Nome da Propriedade</label>
            <input
              type="text"
              value={newProperty.name}
              onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder:text-slate-400"
              placeholder="Ex: Hotel Luxo Imperial"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Categoria</label>
            <select
              value={newProperty.category}
              onChange={(e) => setNewProperty({...newProperty, category: e.target.value})}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Localização</label>
            <input
              type="text"
              value={newProperty.location}
              onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder:text-slate-400"
              placeholder="Ex: Copacabana, Rio de Janeiro"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Número de UH</label>
            <input
              type="number"
              value={newProperty.rooms}
              onChange={(e) => setNewProperty({...newProperty, rooms: e.target.value})}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder:text-slate-400"
              placeholder="Ex: 120"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Preço Mínimo (R$)</label>
            <input
              type="number"
              value={newProperty.priceMin}
              onChange={(e) => setNewProperty({...newProperty, priceMin: e.target.value})}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder:text-slate-400"
              placeholder="Ex: 250"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Preço Máximo (R$)</label>
            <input
              type="number"
              value={newProperty.priceMax}
              onChange={(e) => setNewProperty({...newProperty, priceMax: e.target.value})}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder:text-slate-400"
              placeholder="Ex: 800"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2 text-slate-300">Comodidades</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(amenityIcons).map(([amenity, icon]) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`p-2 border rounded flex items-center justify-center gap-1 text-sm transition-colors ${
                  newProperty.amenities.includes(amenity)
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                {icon}
                {amenity}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1 text-slate-300">Descrição</label>
          <textarea
            value={newProperty.description}
            onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded h-20 text-white placeholder:text-slate-400"
            placeholder="Descreva a propriedade..."
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowPropertyModal(false)}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveProperty}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {editingProperty ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-white">Sistema de Reservas Hoteleiras</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('dashboard')}
                className={activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === 'properties' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('properties')}
                className={activeTab === 'properties' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
              >
                Propriedades
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total de Propriedades</p>
                    <p className="text-3xl font-bold text-white">{totalProperties}</p>
                  </div>
                  <div className="bg-blue-600/20 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total de UH</p>
                    <p className="text-3xl font-bold text-white">{totalRooms}</p>
                  </div>
                  <div className="bg-green-600/20 p-3 rounded-lg">
                    <Bed className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Ocupação Média</p>
                    <p className="text-3xl font-bold text-white">{averageOccupancy}%</p>
                  </div>
                  <div className="bg-yellow-600/20 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Receita Total</p>
                    <p className="text-3xl font-bold text-white">R$ {(totalRevenue / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="bg-purple-600/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos e Informações Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 text-white">Propriedades por Categoria</h3>
                <div className="space-y-3">
                  {categories.map(category => {
                    const count = properties.filter(p => p.category === category).length;
                    const percentage = totalProperties > 0 ? (count / totalProperties) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-400">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 text-white">Top Propriedades por Ocupação</h3>
                <div className="space-y-3">
                  {properties
                    .sort((a, b) => b.occupancy - a.occupancy)
                    .slice(0, 5)
                    .map(property => (
                      <div key={property.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {property.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{property.name}</p>
                            <p className="text-xs text-slate-400">{property.category}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-green-400">
                          {property.occupancy}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Controles de Busca e Filtros */}
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar propriedades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Todas">Todas as Categorias</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Todas">Todas as Localizações</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <Button
                  onClick={() => setShowPropertyModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Propriedade
                </Button>
              </div>
            </div>

            {/* Lista de Propriedades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <div key={property.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{property.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.category === 'Luxo' ? 'bg-purple-600/20 text-purple-400' :
                        property.category === 'Boutique' ? 'bg-pink-600/20 text-pink-400' :
                        property.category === 'Cabanas' ? 'bg-green-600/20 text-green-400' :
                        property.category === 'Corporativo' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-slate-600/20 text-slate-400'
                      }`}>
                        {property.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{property.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-slate-300">{property.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{property.rooms} UH</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{property.occupancy}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {property.amenities.slice(0, 4).map(amenity => (
                        <div key={amenity} className="text-slate-400">
                          {amenityIcons[amenity]}
                        </div>
                      ))}
                      {property.amenities.length > 4 && (
                        <span className="text-xs text-slate-500">+{property.amenities.length - 4}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-green-400">
                          R$ {property.priceRange.min} - {property.priceRange.max}
                        </span>
                        <p className="text-xs text-slate-500">por noite</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProperty(property)}
                          className="text-slate-400 hover:text-blue-400 hover:bg-slate-700/50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showPropertyModal && <PropertyModal />}
    </div>
  );
}
