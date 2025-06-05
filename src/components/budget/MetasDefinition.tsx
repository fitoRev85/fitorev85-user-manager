
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useBudgetMetas } from '@/hooks/useBudgetMetas';
import { Plus, Save, Copy } from 'lucide-react';

interface MetasDefinitionProps {
  propertyId: string;
  year: number;
}

export function MetasDefinition({ propertyId, year }: MetasDefinitionProps) {
  const { toast } = useToast();
  const { metas, criarOuAtualizarMeta, obterMetasPropriedade } = useBudgetMetas();
  const [mesAtual, setMesAtual] = useState<string>('');
  const [formData, setFormData] = useState({
    receitaMeta: '',
    ocupacaoMeta: '',
    adrMeta: '',
    revparMeta: '',
    observacoes: ''
  });

  const metasAno = obterMetasPropriedade(propertyId, year);
  
  const meses = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const handleMesChange = (mes: string) => {
    setMesAtual(mes);
    const mesAno = `${year}-${mes}`;
    const metaExistente = metasAno.find(m => m.mesAno === mesAno);
    
    if (metaExistente) {
      setFormData({
        receitaMeta: metaExistente.receitaMeta.toString(),
        ocupacaoMeta: metaExistente.ocupacaoMeta.toString(),
        adrMeta: metaExistente.adrMeta.toString(),
        revparMeta: metaExistente.revparMeta.toString(),
        observacoes: metaExistente.observacoes || ''
      });
    } else {
      setFormData({
        receitaMeta: '',
        ocupacaoMeta: '',
        adrMeta: '',
        revparMeta: '',
        observacoes: ''
      });
    }
  };

  const handleSalvarMeta = () => {
    if (!mesAtual) {
      toast({
        title: "Erro",
        description: "Selecione um mês",
        variant: "destructive"
      });
      return;
    }

    const receitaMeta = Number(formData.receitaMeta);
    const ocupacaoMeta = Number(formData.ocupacaoMeta);
    const adrMeta = Number(formData.adrMeta);

    if (!receitaMeta || !ocupacaoMeta || !adrMeta) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const revparMeta = (adrMeta * ocupacaoMeta) / 100;

    criarOuAtualizarMeta({
      propriedadeId: propertyId,
      mesAno: `${year}-${mesAtual}`,
      receitaMeta,
      ocupacaoMeta,
      adrMeta,
      revparMeta,
      observacoes: formData.observacoes
    });

    toast({
      title: "Meta salva",
      description: `Meta para ${meses.find(m => m.value === mesAtual)?.label} ${year} foi salva com sucesso`,
    });
  };

  const copiarMetasAnoAnterior = () => {
    const anoAnterior = year - 1;
    const metasAnoAnterior = obterMetasPropriedade(propertyId, anoAnterior);
    
    if (metasAnoAnterior.length === 0) {
      toast({
        title: "Aviso",
        description: `Nenhuma meta encontrada para ${anoAnterior}`,
        variant: "destructive"
      });
      return;
    }

    let metasCriadas = 0;
    metasAnoAnterior.forEach(metaAnterior => {
      const mes = metaAnterior.mesAno.split('-')[1];
      const mesAnoNovo = `${year}-${mes}`;
      
      // Aplicar crescimento de 5%
      const fatorCrescimento = 1.05;
      
      criarOuAtualizarMeta({
        propriedadeId: propertyId,
        mesAno: mesAnoNovo,
        receitaMeta: Math.round(metaAnterior.receitaMeta * fatorCrescimento),
        ocupacaoMeta: metaAnterior.ocupacaoMeta,
        adrMeta: Math.round(metaAnterior.adrMeta * fatorCrescimento),
        revparMeta: Math.round(metaAnterior.revparMeta * fatorCrescimento),
        observacoes: `Copiado de ${anoAnterior} com crescimento de 5%`
      });
      metasCriadas++;
    });

    toast({
      title: "Metas copiadas",
      description: `${metasCriadas} metas foram copiadas de ${anoAnterior} com crescimento de 5%`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Meta */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Definir Meta Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Mês</Label>
              <Select value={mesAtual} onValueChange={handleMesChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value} className="text-white">
                      {mes.label} {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Meta de Receita (R$)</Label>
              <Input
                type="number"
                value={formData.receitaMeta}
                onChange={(e) => setFormData(prev => ({ ...prev, receitaMeta: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: 150000"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Meta de Ocupação (%)</Label>
              <Input
                type="number"
                value={formData.ocupacaoMeta}
                onChange={(e) => setFormData(prev => ({ ...prev, ocupacaoMeta: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: 75"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Meta de ADR (R$)</Label>
              <Input
                type="number"
                value={formData.adrMeta}
                onChange={(e) => setFormData(prev => ({ ...prev, adrMeta: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: 200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Observações sobre a meta..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSalvarMeta} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Meta
            </Button>
            <Button onClick={copiarMetasAnoAnterior} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Copy className="w-4 h-4 mr-2" />
              Copiar Ano Anterior (+5%)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Metas Existentes */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Metas Definidas para {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {metasAno.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Nenhuma meta definida para {year}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-300 py-2">Mês</th>
                    <th className="text-right text-slate-300 py-2">Receita</th>
                    <th className="text-right text-slate-300 py-2">Ocupação</th>
                    <th className="text-right text-slate-300 py-2">ADR</th>
                    <th className="text-right text-slate-300 py-2">RevPAR</th>
                  </tr>
                </thead>
                <tbody>
                  {metasAno.map((meta) => {
                    const [ano, mes] = meta.mesAno.split('-').map(Number);
                    const nomeMes = meses.find(m => m.value === mes.toString().padStart(2, '0'))?.label;
                    
                    return (
                      <tr key={meta.mesAno} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="text-white py-3">{nomeMes}</td>
                        <td className="text-right text-white py-3">
                          R$ {meta.receitaMeta.toLocaleString('pt-BR')}
                        </td>
                        <td className="text-right text-white py-3">
                          {meta.ocupacaoMeta.toFixed(1)}%
                        </td>
                        <td className="text-right text-white py-3">
                          R$ {meta.adrMeta.toLocaleString('pt-BR')}
                        </td>
                        <td className="text-right text-white py-3">
                          R$ {meta.revparMeta.toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
