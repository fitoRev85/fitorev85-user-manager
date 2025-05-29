
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface CreatePropertyProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; location: string; rooms: string; description: string }) => void;
}

export const CreateProperty = ({ isOpen, onClose, onSubmit }: CreatePropertyProps) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rooms: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.location || !formData.rooms) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isNaN(Number(formData.rooms)) || Number(formData.rooms) <= 0) {
      alert('Por favor, insira um número válido de quartos.');
      return;
    }

    console.log('Creating property:', formData);
    onSubmit(formData);
    
    // Limpar formulário
    setFormData({ name: '', location: '', rooms: '', description: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    onClose();
    // Limpar formulário ao fechar
    setFormData({ name: '', location: '', rooms: '', description: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Propriedade</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Nome da Propriedade *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Ex: Hotel Paradise"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location" className="text-gray-300">Localização *</Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Ex: Centro da cidade"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="rooms" className="text-gray-300">Número de Quartos *</Label>
            <Input
              id="rooms"
              type="number"
              min="1"
              value={formData.rooms}
              onChange={(e) => handleInputChange('rooms', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Ex: 150"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300">Descrição</Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Breve descrição da propriedade"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Criar Propriedade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
