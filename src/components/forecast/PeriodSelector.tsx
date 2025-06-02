
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, TrendingUp, Brain, Clock } from 'lucide-react';

interface PeriodSelectorProps {
  selectedPeriod: string;
  selectedYear: number;
  selectedMonth: number;
  onPeriodChange: (period: string) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  showComparisons?: boolean;
}

const PeriodSelector = ({ 
  selectedPeriod, 
  selectedYear, 
  selectedMonth,
  onPeriodChange, 
  onYearChange, 
  onMonthChange,
  showComparisons = true 
}: PeriodSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const periods = [
    { value: 'month', label: 'Mensal', icon: Calendar },
    { value: 'quarter', label: 'Trimestral', icon: TrendingUp },
    { value: 'year', label: 'Anual', icon: Clock },
    { value: 'custom', label: 'Personalizado', icon: Brain }
  ];

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-slate-300 text-sm">Período</Label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {periods.map(period => {
                  const Icon = period.icon;
                  return (
                    <SelectItem key={period.value} value={period.value} className="text-white hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {period.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300 text-sm">Ano</Label>
            <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()} className="text-white hover:bg-slate-700">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPeriod === 'month' && (
            <div>
              <Label className="text-slate-300 text-sm">Mês</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()} className="text-white hover:bg-slate-700">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showComparisons && (
            <div className="flex items-end">
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-blue-400 rounded"></div>
                  Atual
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-green-400 rounded"></div>
                  Ano Anterior
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded"></div>
                  Mês Anterior
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodSelector;
