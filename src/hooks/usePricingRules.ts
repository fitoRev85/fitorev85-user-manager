
import { useState, useEffect } from 'react';

export interface PricingRule {
  id: string;
  name: string;
  season: 'alta' | 'media' | 'baixa';
  startMonth: number;
  endMonth: number;
  multiplier: number;
  description?: string;
}

interface PricingHistory {
  id: string;
  date: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  user: string;
}

const defaultRules: PricingRule[] = [
  {
    id: '1',
    name: 'Alta Temporada - Verão',
    season: 'alta',
    startMonth: 12,
    endMonth: 3,
    multiplier: 1.5,
    description: 'Dezembro a Março - Férias e verão'
  },
  {
    id: '2',
    name: 'Temporada Média - Outono/Inverno',
    season: 'media',
    startMonth: 4,
    endMonth: 8,
    multiplier: 1.0,
    description: 'Abril a Agosto - Temporada regular'
  },
  {
    id: '3',
    name: 'Baixa Temporada - Primavera',
    season: 'baixa',
    startMonth: 9,
    endMonth: 11,
    multiplier: 0.8,
    description: 'Setembro a Novembro - Baixa demanda'
  }
];

export function usePricingRules(propertyId: string) {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [history, setHistory] = useState<PricingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
    loadHistory();
  }, [propertyId]);

  const loadRules = () => {
    const storageKey = `pricing_rules_${propertyId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        setRules(JSON.parse(stored));
      } catch {
        setRules(defaultRules);
        saveRules(defaultRules);
      }
    } else {
      setRules(defaultRules);
      saveRules(defaultRules);
    }
    setLoading(false);
  };

  const loadHistory = () => {
    const storageKey = `pricing_history_${propertyId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  };

  const saveRules = (newRules: PricingRule[]) => {
    const storageKey = `pricing_rules_${propertyId}`;
    localStorage.setItem(storageKey, JSON.stringify(newRules));
    setRules(newRules);
  };

  const saveHistory = (newHistory: PricingHistory[]) => {
    const storageKey = `pricing_history_${propertyId}`;
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const addRule = (rule: Omit<PricingRule, 'id'>) => {
    const newRule: PricingRule = {
      ...rule,
      id: Date.now().toString()
    };
    const updatedRules = [...rules, newRule];
    saveRules(updatedRules);
  };

  const updateRule = (ruleId: string, updates: Partial<PricingRule>) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    saveRules(updatedRules);
  };

  const deleteRule = (ruleId: string) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    saveRules(updatedRules);
  };

  const addPriceChange = (change: Omit<PricingHistory, 'id'>) => {
    const newChange: PricingHistory = {
      ...change,
      id: Date.now().toString()
    };
    const updatedHistory = [newChange, ...history].slice(0, 100); // Manter apenas 100 registros
    saveHistory(updatedHistory);
  };

  return {
    rules,
    history,
    loading,
    addRule,
    updateRule,
    deleteRule,
    addPriceChange
  };
}
