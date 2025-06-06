
interface StorageData {
  [key: string]: any;
}

export class LocalStorageManager {
  static safeGet<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      return this.validateAndTransform(parsed, defaultValue);
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
      return defaultValue;
    }
  }

  static safeSet(key: string, value: any): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
      return false;
    }
  }

  static validateAndTransform<T>(data: any, defaultValue: T): T {
    if (Array.isArray(defaultValue) && Array.isArray(data)) {
      return data.map(item => this.transformDates(item)) as T;
    }
    
    if (typeof defaultValue === 'object' && data) {
      return this.transformDates(data) as T;
    }
    
    return data || defaultValue;
  }

  static transformDates(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const transformed = { ...obj };
    
    // Campos conhecidos de data
    const dateFields = ['dataCriacao', 'dataAlteracao', 'ultimoAcesso'];
    
    dateFields.forEach(field => {
      if (transformed[field]) {
        transformed[field] = new Date(transformed[field]);
      }
    });

    return transformed;
  }

  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('fitorev85_') || key.includes('_data')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
}
