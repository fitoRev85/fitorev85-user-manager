
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
      let foundDataSource = '';

      // Lista completa de chaves possíveis para tentar carregar dados
      const possibleKeys = [
        // Formato mais recente com chunks
        `forecast_data_${propertyId}_index`,
        // Formatos de importação mais recentes
        `reservations_data_${propertyId}`,
        `import_data_${propertyId}`,
        `excel_data_${propertyId}`,
        `csv_data_${propertyId}`,
        // Formatos legados
        `forecast_data_${propertyId}`,
        `reservas_${propertyId}`,
        `booking_data_${propertyId}`,
        `hotel_data_${propertyId}`
      ];

      // Estratégia 1: Tentar carregar dados em chunks (formato mais recente)
      const indexKey = `forecast_data_${propertyId}_index`;
      const indexData = localStorage.getItem(indexKey);
      
      if (indexData) {
        try {
          const index = JSON.parse(indexData);
          console.log('📊 Carregando dados em chunks:', index);
          
          if (index.totalChunks > 0) {
            for (let i = 0; i < index.totalChunks; i++) {
              const chunkKey = `${index.storagePrefix}_chunk_${i}`;
              const chunkData = localStorage.getItem(chunkKey);
              if (chunkData) {
                const chunk = JSON.parse(chunkData);
                allData = [...allData, ...chunk];
              }
            }
            foundDataSource = `chunks (${index.totalChunks} chunks)`;
            setLastUpdate(index.lastUpdated);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao processar chunks:', error);
        }
      }

      // Estratégia 2: Se não encontrou dados em chunks, tentar outras fontes
      if (allData.length === 0) {
        for (const key of possibleKeys.slice(1)) { // Pula o index que já tentamos
          console.log(`🔍 Tentando carregar de: ${key}`);
          const storedData = localStorage.getItem(key);
          
          if (storedData) {
            try {
              const parsed = JSON.parse(storedData);
              console.log(`📁 Dados encontrados em ${key}:`, typeof parsed, Array.isArray(parsed) ? parsed.length : 'não é array');
              
              if (Array.isArray(parsed)) {
                allData = parsed;
                foundDataSource = key;
                break;
              } else if (parsed.data && Array.isArray(parsed.data)) {
                allData = parsed.data;
                foundDataSource = `${key}.data`;
                break;
              } else if (parsed.records && Array.isArray(parsed.records)) {
                allData = parsed.records;
                foundDataSource = `${key}.records`;
                break;
              } else if (typeof parsed === 'object') {
                // Tentar extrair arrays de qualquer propriedade
                const arrayProps = Object.values(parsed).filter(val => Array.isArray(val));
                if (arrayProps.length > 0) {
                  allData = arrayProps[0] as any[];
                  foundDataSource = `${key} (extracted array)`;
                  break;
                }
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
            }
          }
        }
      }

      console.log(`📍 Dados carregados de: ${foundDataSource || 'nenhuma fonte'}`, allData.length, 'registros');

      // Filtrar e normalizar dados
      const validData = allData.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Verificar se tem pelo menos um campo de data válido
        const dateFields = ['data_checkin', 'checkInDateTime', 'checkin_date', 'check_in', 'dataCheckin'];
        const hasValidDate = dateFields.some(field => {
          const dateValue = item[field];
          if (!dateValue) return false;
          
          const date = new Date(dateValue);
          return !isNaN(date.getTime()) && 
                 date.getFullYear() > 1970 && 
                 dateValue !== '1970-01-01' && 
                 dateValue !== 'Invalid Date';
        });
        
        if (!hasValidDate) {
          console.warn('❌ Registro com data inválida ignorado:', item);
          return false;
        }
        
        return true;
      });

      // Normalizar dados para formato padrão
      const normalizedData = validData.map((item, index) => {
        // Mapear diferentes formatos de campo para formato padrão
        const getFieldValue = (possibleFields: string[]) => {
          for (const field of possibleFields) {
            if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
              return item[field];
            }
          }
          return '';
        };

        const checkinDate = getFieldValue(['data_checkin', 'checkInDateTime', 'checkin_date', 'check_in', 'dataCheckin']);
        const checkoutDate = getFieldValue(['data_checkout', 'checkOutDateTime', 'checkout_date', 'check_out', 'dataCheckout']);
        const totalValue = getFieldValue(['valor_total', 'totalBookingRate', 'total_value', 'total', 'rate', 'price']);
        const guestName = getFieldValue(['hospede_nome', 'mainGuest_name', 'guest_name', 'nome_hospede', 'guest']);
        const roomType = getFieldValue(['tipo_quarto', 'roomTypeDescription', 'room_type', 'quarto_tipo']);
        const channel = getFieldValue(['canal', 'channelDescription', 'channel', 'booking_channel']);
        const status = getFieldValue(['situacao', 'status', 'booking_status', 'estado']);
        const bookingId = getFieldValue(['id', 'bookingInternalID', 'booking_id', 'reserva_id']);

        return {
          id: bookingId || `${propertyId}_${index}_${Date.now()}`,
          data_checkin: checkinDate,
          data_checkout: checkoutDate || checkinDate,
          valor_total: Number(totalValue) || 0,
          situacao: status || 'confirmada',
          canal: channel || 'Direto',
          hospede_nome: guestName || '',
          tipo_quarto: roomType || '',
          noites: Number(getFieldValue(['noites', 'nights', 'total_nights'])) || 1,
          diaria_media: Number(getFieldValue(['diaria_media', 'average_rate', 'daily_rate'])) || (Number(totalValue) || 0),
          propertyId: item.propertyId || propertyId
        };
      });

      setData(normalizedData);
      
      if (!lastUpdate && normalizedData.length > 0) {
        setLastUpdate(new Date().toISOString());
      }

      console.log('📈 Dados finais processados:', {
        fonte: foundDataSource,
        total: normalizedData.length,
        comDatasValidas: normalizedData.filter(r => new Date(r.data_checkin).getFullYear() > 1970).length,
        amostra: normalizedData.slice(0, 3),
        propriedade: propertyId
      });

      // Log estatísticas por ano para debug
      const anoStats = normalizedData.reduce((acc, r) => {
        const ano = new Date(r.data_checkin).getFullYear();
        acc[ano] = (acc[ano] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      console.log('📊 Distribuição por ano:', anoStats);

      // Log estatísticas por canal
      const canalStats = normalizedData.reduce((acc, r) => {
        const canal = r.canal || 'Desconhecido';
        acc[canal] = (acc[canal] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('📊 Distribuição por canal:', canalStats);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setData([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  // Escutar mudanças no localStorage para recarregar dados automaticamente
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes(propertyId)) {
        console.log('🔔 Detectada mudança no localStorage para propriedade:', propertyId);
        setTimeout(loadData, 500); // Pequeno delay para garantir que os dados foram salvos
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também escutar eventos customizados para mudanças internas
    const handleDataImport = () => {
      console.log('🔔 Detectado evento de importação de dados');
      setTimeout(loadData, 500);
    };

    window.addEventListener('dataImported', handleDataImport);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataImported', handleDataImport);
    };
  }, [propertyId]);

  return {
    data,
    loading,
    lastUpdate,
    totalRecords: data.length,
    refreshData: loadData
  };
}
