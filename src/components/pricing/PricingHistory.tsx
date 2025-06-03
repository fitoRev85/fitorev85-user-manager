
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePricingRules } from '@/hooks/usePricingRules';

interface PricingHistoryProps {
  propertyId: string;
}

const PricingHistory = ({ propertyId }: PricingHistoryProps) => {
  const { history } = usePricingRules(propertyId);

  const getPriceChangeIcon = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (newPrice < oldPrice) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getPriceChangeColor = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) return 'text-green-400';
    if (newPrice < oldPrice) return 'text-red-400';
    return 'text-slate-400';
  };

  const calculateChangePercentage = (oldPrice: number, newPrice: number) => {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Histórico de Preços</h2>
        <p className="text-slate-400">Todas as mudanças de preço registradas</p>
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((change, index) => {
            const changePercentage = calculateChangePercentage(change.oldPrice, change.newPrice);
            
            return (
              <Card key={change.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-700/50 rounded-lg">
                        {getPriceChangeIcon(change.oldPrice, change.newPrice)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-slate-400 text-sm">
                            {new Date(change.date).toLocaleString('pt-BR')}
                          </span>
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {change.user}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">
                            R$ {change.oldPrice.toFixed(0)}
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="text-white font-semibold">
                            R$ {change.newPrice.toFixed(0)}
                          </span>
                          <span className={`text-sm font-medium ${getPriceChangeColor(change.oldPrice, change.newPrice)}`}>
                            ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                          </span>
                        </div>
                        
                        <p className="text-slate-400 text-sm mt-1">
                          {change.reason}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPriceChangeColor(change.oldPrice, change.newPrice)}`}>
                        {change.newPrice > change.oldPrice ? '+' : ''}
                        R$ {Math.abs(change.newPrice - change.oldPrice).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-8 text-center">
            <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum histórico encontrado</h3>
            <p className="text-slate-400">
              As mudanças de preço aparecerão aqui conforme forem realizadas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingHistory;
