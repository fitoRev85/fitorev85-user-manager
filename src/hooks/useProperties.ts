
import { useState, useEffect } from 'react';

export interface Property {
  id: string;
  name: string;
  location: string;
  rooms: number;
  description?: string;
  category?: string;
  city?: string;
  image?: string;
  revpar?: number;
  occupancy?: number;
  adr?: number;
}

const STORAGE_KEY = 'fitorev85_properties';

const defaultProperties: Property[] = [
  { 
    id: '1', 
    name: 'Grand Hotel Luxo', 
    location: 'São Paulo',
    rooms: 120,
    category: 'Luxo', 
    city: 'São Paulo',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop',
    revpar: 285.50,
    occupancy: 78,
    adr: 365
  },
  { 
    id: '2', 
    name: 'Boutique Charm', 
    location: 'Rio de Janeiro',
    rooms: 45,
    category: 'Boutique', 
    city: 'Rio de Janeiro',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop',
    revpar: 195.30,
    occupancy: 85,
    adr: 230
  },
  { 
    id: '3', 
    name: 'Resort Paradise', 
    location: 'Florianópolis',
    rooms: 200,
    category: 'Resort', 
    city: 'Florianópolis',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop',
    revpar: 220.75,
    occupancy: 82,
    adr: 269
  }
];

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProperties(JSON.parse(stored));
      } catch {
        setProperties(defaultProperties);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProperties));
      }
    } else {
      setProperties(defaultProperties);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProperties));
    }
  }, []);

  const saveProperties = (newProperties: Property[]) => {
    setProperties(newProperties);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProperties));
  };

  const addProperty = (propertyData: { name: string; location: string; rooms: string; description: string }) => {
    const newProperty: Property = {
      id: Date.now().toString(),
      name: propertyData.name,
      location: propertyData.location,
      rooms: parseInt(propertyData.rooms),
      description: propertyData.description,
      category: 'Hotel',
      city: propertyData.location,
      revpar: 0,
      occupancy: 0,
      adr: 0
    };
    
    const updatedProperties = [...properties, newProperty];
    saveProperties(updatedProperties);
    return newProperty;
  };

  const deleteProperty = (propertyId: string) => {
    const updatedProperties = properties.filter(p => p.id !== propertyId);
    saveProperties(updatedProperties);
  };

  const getProperty = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  return {
    properties,
    addProperty,
    deleteProperty,
    getProperty
  };
}
