
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { CreateProperty } from '@/components/CreateProperty';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';

const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const { properties, addProperty, deleteProperty } = useProperties();

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(search.toLowerCase()) ||
    property.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProperty = (newProperty: { name: string; location: string; rooms: string; description: string }) => {
    console.log('Creating property:', newProperty);
    
    const property = addProperty(newProperty);
    setIsCreateModalOpen(false);
    
    toast({
      title: "Propriedade criada",
      description: `${property.name} foi adicionada com sucesso.`,
    });
  };

  const handleDeleteProperty = (propertyId: string) => {
    const propertyToDelete = properties.find(p => p.id === propertyId);
    
    if (window.confirm(`Tem certeza que deseja excluir a propriedade "${propertyToDelete?.name}"?`)) {
      deleteProperty(propertyId);
      
      toast({
        title: "Propriedade excluída",
        description: `${propertyToDelete?.name} foi removida com sucesso.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestão de Propriedades</h1>
              <p className="text-gray-400">Gerencie suas propriedades e acesse os módulos de análise</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/financial')}
                className="bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Módulo Financeiro
              </Button>
              {user?.categoria === 'admin' && (
                <Button 
                  onClick={() => navigate('/users')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Gerenciar Usuários
                </Button>
              )}
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Propriedade
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Buscar propriedade..."
            className="bg-gray-800 border-gray-700 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Lista de Propriedades ({filteredProperties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Nome</TableHead>
                  <TableHead className="text-gray-400">Localização</TableHead>
                  <TableHead className="text-gray-400">Quartos</TableHead>
                  <TableHead className="text-gray-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map(property => (
                  <TableRow key={property.id} className="border-gray-800">
                    <TableCell className="text-white">{property.name}</TableCell>
                    <TableCell className="text-gray-300">{property.location}</TableCell>
                    <TableCell className="text-blue-400">{property.rooms}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:text-green-300"
                          onClick={() => navigate(`/rms/${property.id}`)}
                        >
                          RMS
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Modal */}
        <CreateProperty 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProperty}
        />
      </div>
    </div>
  );
};

export default Properties;
