import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProperties, Property } from "@/hooks/useProperties";
import { BarChart3, DollarSign, Edit, Trash2, Plus, TrendingUp, FileText } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const PropertyCard = ({ property }: { property: Property }) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{property.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p>Localização: {property.location}</p>
        <p>Quartos: {property.rooms}</p>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/rms/${property.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            RMS Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate(`/pricing/${property.id}`)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function Properties() {
  const navigate = useNavigate();
  const { properties, addProperty, updateProperty, deleteProperty } = useProperties();
  const [open, setOpen] = React.useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [newProperty, setNewProperty] = useState({
    name: '',
    location: '',
    rooms: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProperty({
      ...newProperty,
      [e.target.name]: e.target.value
    });
  };

  const handleAddProperty = () => {
    addProperty(newProperty);
    setNewProperty({ name: '', location: '', rooms: '', description: '' });
    setOpen(false);
  };

  const handleEditProperty = (property: Property) => {
    setIsEditing(true);
    setSelectedProperty(property);
    setNewProperty({
      name: property.name,
      location: property.location,
      rooms: property.rooms.toString(),
      description: property.description || ''
    });
    setOpen(true);
  };

  const handleUpdateProperty = () => {
    if (selectedProperty) {
      const updatedProperty: Property = {
        ...selectedProperty,
        name: newProperty.name,
        location: newProperty.location,
        rooms: parseInt(newProperty.rooms),
        description: newProperty.description
      };
      updateProperty(updatedProperty);
      setNewProperty({ name: '', location: '', rooms: '', description: '' });
      setOpen(false);
      setIsEditing(false);
      setSelectedProperty(null);
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    deleteProperty(propertyId);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Propriedades</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Propriedade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Propriedade' : 'Adicionar Propriedade'}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Atualize os detalhes da propriedade.'
                  : 'Adicione uma nova propriedade ao sistema.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={newProperty.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Localização
                </Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={newProperty.location}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rooms" className="text-right">
                  Quartos
                </Label>
                <Input
                  type="number"
                  id="rooms"
                  name="rooms"
                  value={newProperty.rooms}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={newProperty.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              {isEditing ? (
                <Button onClick={handleUpdateProperty}>Atualizar</Button>
              ) : (
                <Button onClick={handleAddProperty}>Salvar</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{property.name}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p>Localização: {property.location}</p>
              <p>Quartos: {property.rooms}</p>
            </CardContent>
            
            <CardFooter className="space-y-3">
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => navigate(`/rms/${property.id}`)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  RMS & Forecast
                </Button>
                
                <Button
                  onClick={() => navigate(`/pricing/${property.id}`)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Pricing
                </Button>
              </div>
              
              <Button
                onClick={() => navigate('/reports')}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Lista de Propriedades</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Quartos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.rooms}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>Total de propriedades: {properties.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Properties;
