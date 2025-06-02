
import { useState, useEffect } from 'react';

export interface ReservaData {
  id: string;
  data_checkin: string;
  data_checkout: string;
  valor_total: number;
  situacao: string;
  canal?: string;
  hospede_nome?: string;
  tipo_quarto?: string;
  noites?: number;
  diaria_media?: number;
  propertyId?: string;
}

interface UseReservationDataReturn {
  data: ReservaData[];
  loading: boolean;
  lastUpdate: string;
  totalRecords: number;
  refreshData: () => void;
}

export function useReservationData(propertyId: string): UseReservationDataReturn {
  const [data, setData] = useState<ReservaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadData = () => {
    setLoading(true);
    console.log('🔄 Carregando dados para propriedade:', propertyId);

    try {
      let allData: ReservaData[] = [];

      // Estratégia 1: Tentar carregar dados em chunks (formato mais recente)
      const indexKey = `forecast_data_${propertyId}_index`;
      const indexData = localStorage.getItem(indexKey);
      
      if (indexData) {
        const index = JSON.parse(indexData);
        console.log('📊 Carregando dados em chunks:', index);
        
        for (let i = 0; i < index.totalChunks; i++) {
          const chunkKey = `${index.storagePrefix}_chunk_${i}`;
          const chunkData = localStorage.getItem(chunkKey);
          if (chunkData) {
            const chunk = JSON.parse(chunkData);
            allData = [...allData, ...chunk];
          }
        }
        setLastUpdate(index.lastUpdated);
        console.log('✅ Dados carregados via chunks:', allData.length, 'registros');
      } else {
        // Estratégia 2: Tentar formatos legados
        const legacyKeys = [
          `reservas_${propertyId}`,
          `forecast_data_${propertyId}`,
          `reservations_data_${propertyId}`
        ];

        for (const key of legacyKeys) {
          const legacyData = localStorage.getItem(key);
          if (legacyData) {
            try {
              const parsed = JSON.parse(legacyData);
              if (Array.isArray(parsed)) {
                allData = parsed;
              } else if (parsed.data && Array.isArray(parsed.data)) {
                allData = parsed.data;
              }
              console.log(`📁 Dados carregados de ${key}:`, allData.length, 'registros');
              if (allData.length > 0) break;
            } catch (error) {
              console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
            }
          }
        }
      }

      // Filtrar dados com datas válidas e normalizar
      const validData = allData.filter(item => {
        const hasValidDate = item.data_checkin && 
          item.data_checkin !== '1970-01-01' && 
          item.data_checkin !== 'Invalid Date' &&
          new Date(item.data_checkin).getFullYear() > 1970;
        
        if (!hasValidDate) {
          console.warn('❌ Registro com data inválida ignorado:', item);
        }
        
        return hasValidDate;
      });

      // Normalizar dados
      const normalizedData = validData.map((item, index) => ({
        id: item.id || `${propertyId}_${index}`,
        data_checkin: item.data_checkin || '',
        data_checkout: item.data_checkout || '',
        valor_total: Number(item.valor_total) || 0,
        situacao: item.situacao || 'confirmada',
        canal: item.canal || 'Direto',
        hospede_nome: item.hospede_nome || '',
        tipo_quarto: item.tipo_quarto || '',
        noites: Number(item.noites) || 1,
        diaria_media: Number(item.diaria_media) || 0,
        propertyId: item.propertyId || propertyId
      }));

      setData(normalizedData);
      
      if (!lastUpdate && normalizedData.length > 0) {
        setLastUpdate(new Date().toISOString());
      }

      console.log('📈 Dados finais processados:', {
        total: normalizedData.length,
        comDatasValidas: normalizedData.filter(r => new Date(r.data_checkin).getFullYear() > 1970).length,
        amostra: normalizedData.slice(0, 3),
        propriedade: propertyId
      });

      // Log estatísticas por ano
      const anoStats = normalizedData.reduce((acc, r) => {
        const ano = new Date(r.data_checkin).getFullYear();
        acc[ano] = (acc[ano] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      console.log('📊 Distribuição por ano:', anoStats);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setData([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  return {
    data,
    loading,
    lastUpdate,
    totalRecords: data.length,
    refreshData: loadData
  };
}
