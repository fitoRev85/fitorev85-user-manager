
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Copy, Save, Trash2, TrendingUp, Target } from 'lucide-react';
import { useMetas, Meta } from '@/hooks/useMetas';
import { useProperties } from '@/hooks/useProperties';

const ManualForecast = () => {
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState('1');
  const [anoSelecionado, setAnoSelecionado] = useState((new Date().getFullYear() + 1).toString());
  const [tipoMetaAtual, setTipoMetaAtual] = useState<'receita' | 'ocupacao' | 'adr' | 'revpar'>('receita');
  const [camposMetas, setCamposMetas] = useState<Record<string, string>>({});
  const [percentualCrescimento, setPercentualCrescimento] = useState('');
  
  const { properties } = useProperties();
  const { 
    inserirMeta, 
    obterMetasPropriedade, 
    copiarMetasAnoAnterior, 
    obterEstatisticas,
    inserirMetasLote 
  } = useMetas();
  const { toast } = useToast();

  const anos = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() + i).toString());
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const tiposMeta = [
    { value: 'receita', label: 'Receita (R$)', icon: '💰' },
    { value: 'ocupacao', label: 'Ocupação (%)', icon: '🏠' },
    { value: 'adr', label: 'ADR (R$)', icon: '💵' },
    { value: 'revpar', label: 'RevPAR (R$)', icon: '📊' }
  ];

  useEffect(() => {
    carregarMetasExistentes();
  }, [propriedadeSelecionada, anoSelecionado, tipoMetaAtual]);

  const carregarMetasExistentes = () => {
    const metas = obterMetasPropriedade(propriedadeSelecionada, parseInt(anoSelecionado));
    const metasTipo = metas.filter(meta => meta.tipoMeta === tipoMetaAtual);
    
    const novosCampos: Record<string, string> = {};
    
    // Inicializar todos os meses
    for (let mes = 1; mes <= 12; mes++) {
      const mesKey = `${anoSelecionado}-${mes.toString().padStart(2, '0')}`;
      novosCampos[mesKey] = '';
    }
    
    // Preencher com dados existentes
    metasTipo.forEach(meta => {
      novosCampos[meta.mesAno] = meta.valorMeta.toFixed(2);
    });
    
    setCamposMetas(novosCampos);
  };

  const salvarMetaIndividual = (mesKey: string, valor: string) => {
    if (!valor.trim()) return;
    
    try {
      const valorNumerico = parseFloat(valor.replace(',', '.'));
      
      if (valorNumerico <= 0) {
        toast({
          title: "Valor inválido",
          description: "O valor da meta deve ser positivo",
          variant: "destructive"
        });
        return;
      }

      inserirMeta(propriedadeSelecionada, mesKey, valorNumerico, tipoMetaAtual);
      
      toast({
        title: "Meta salva",
        description: `Meta de ${mesKey} salva automaticamente`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Valor inválido. Use apenas números.",
        variant: "destructive"
      });
    }
  };

  const salvarTodasMetas = () => {
    let metasSalvas = 0;
    const metasParaSalvar: Omit<Meta, 'id' | 'dataCriacao' | 'dataAlteracao' | 'ativo'>[] = [];

    Object.entries(camposMetas).forEach(([mesKey, valor]) => {
      if (valor.trim()) {
        try {
          const valorNumerico = parseFloat(valor.replace(',', '.'));
          if (valorNumerico > 0) {
            metasParaSalvar.push({
              propriedadeId: propriedadeSelecionada,
              mesAno: mesKey,
              valorMeta: valorNumerico,
              tipoMeta: tipoMetaAtual
            });
            metasSalvas++;
          }
        } catch (error) {
          console.error('Erro ao converter valor:', error);
        }
      }
    });

    if (metasParaSalvar.length > 0) {
      metasParaSalvar.forEach(meta => {
        inserirMeta(meta.propriedadeId, meta.mesAno, meta.valorMeta, meta.tipoMeta);
      });

      toast({
        title: "Sucesso",
        description: `${metasSalvas} metas foram salvas!`,
      });
    } else {
      toast({
        title: "Aviso",
        description: "Nenhuma meta válida para salvar",
        variant: "destructive"
      });
    }
  };

  const copiarAnoAnterior = () => {
    const anoAtual = parseInt(anoSelecionado);
    const anoAnterior = anoAtual - 1;

    const { sucessos, erros } = copiarMetasAnoAnterior(
      propriedadeSelecionada,
      anoAnterior,
      anoAtual
    );

    if (sucessos > 0) {
      carregarMetasExistentes();
      toast({
        title: "Sucesso",
        description: `${sucessos} metas copiadas do ano ${anoAnterior}!`,
      });
    } else {
      toast({
        title: "Aviso",
        description: `Nenhuma meta encontrada para ${anoAnterior}`,
        variant: "destructive"
      });
    }
  };

  const aplicarCrescimento = () => {
    if (!percentualCrescimento.trim()) {
      toast({
        title: "Aviso",
        description: "Digite o percentual de crescimento!",
        variant: "destructive"
      });
      return;
    }

    try {
      const crescimento = parseFloat(percentualCrescimento.replace(',', '.'));
      const fator = 1 + (crescimento / 100);
      
      let aplicados = 0;
      const novosCampos = { ...camposMetas };

      Object.entries(camposMetas).forEach(([mesKey, valor]) => {
        if (valor.trim()) {
          try {
            const valorAtual = parseFloat(valor.replace(',', '.'));
            const novoValor = valorAtual * fator;
            novosCampos[mesKey] = novoValor.toFixed(2);
            aplicados++;
          } catch (error) {
            console.error('Erro ao aplicar crescimento:', error);
          }
        }
      });

      setCamposMetas(novosCampos);
      setPercentualCrescimento('');

      toast({
        title: "Sucesso",
        description: `Crescimento de ${crescimento}% aplicado em ${aplicados} metas!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Percentual de crescimento inválido!",
        variant: "destructive"
      });
    }
  };

  const limparTodasMetas = () => {
    const novosCampos: Record<string, string> = {};
    for (let mes = 1; mes <= 12; mes++) {
      const mesKey = `${anoSelecionado}-${mes.toString().padStart(2, '0')}`;
      novosCampos[mesKey] = '';
    }
    setCamposMetas(novosCampos);

    toast({
      title: "Limpo",
      description: "Todas as metas foram limpas da tela",
    });
  };

  const obterUnidadeAtual = () => {
    const unidades = {
      receita: 'R$',
      ocupacao: '%',
      adr: 'R$',
      revpar: 'R$'
    };
    return unidades[tipoMetaAtual] || '';
  };

  const handleCampoChange = (mesKey: string, valor: string) => {
    setCamposMetas(prev => ({
      ...prev,
      [mesKey]: valor
    }));
  };

  const handleCampoBlur = (mesKey: string) => {
    const valor = camposMetas[mesKey];
    if (valor && valor.trim()) {
      salvarMetaIndividual(mesKey, valor);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com seleções */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Gerenciamento de Metas - Forecast Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propriedade" className="text-slate-300">Propriedade</Label>
              <select
                id="propriedade"
                value={propriedadeSelecionada}
                onChange={(e) => setPropriedadeSelecionada(e.target.value)}
                className="w-full mt-1 bg-slate-700/50 border-slate-600/50 text-white rounded-lg px-3 py-2"
              >
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="ano" className="text-slate-300">Ano</Label>
              <select
                id="ano"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
                className="w-full mt-1 bg-slate-700/50 border-slate-600/50 text-white rounded-lg px-3 py-2"
              >
                {anos.map(ano => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de tipos de meta */}
      <Tabs value={tipoMetaAtual} onValueChange={(value) => setTipoMetaAtual(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
          {tiposMeta.map(tipo => (
            <TabsTrigger 
              key={tipo.value} 
              value={tipo.value}
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <span className="mr-2">{tipo.icon}</span>
              {tipo.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tiposMeta.map(tipo => (
          <TabsContent key={tipo.value} value={tipo.value}>
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Metas de {tipo.label} - {anoSelecionado}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Tabela de metas mensais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {meses.map((nomeMes, index) => {
                    const mes = index + 1;
                    const mesKey = `${anoSelecionado}-${mes.toString().padStart(2, '0')}`;
                    
                    return (
                      <div key={mesKey} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                        <Label className="text-slate-300 text-sm font-medium">
                          {nomeMes} {anoSelecionado}
                        </Label>
                        <div className="flex items-center mt-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={camposMetas[mesKey] || ''}
                            onChange={(e) => handleCampoChange(mesKey, e.target.value)}
                            onBlur={() => handleCampoBlur(mesKey)}
                            className="bg-slate-800 border-slate-600 text-white text-right"
                            placeholder="0.00"
                          />
                          <span className="ml-2 text-slate-400 text-sm">
                            {obterUnidadeAtual()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botões de ação */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={salvarTodasMetas}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Todas as Metas
                    </Button>
                    
                    <Button
                      onClick={copiarAnoAnterior}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar do Ano Anterior
                    </Button>
                    
                    <Button
                      onClick={limparTodasMetas}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Tudo
                    </Button>
                  </div>

                  {/* Aplicar crescimento */}
                  <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <Label className="text-slate-300">Aplicar crescimento:</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={percentualCrescimento}
                      onChange={(e) => setPercentualCrescimento(e.target.value)}
                      className="w-24 bg-slate-800 border-slate-600 text-white"
                      placeholder="0.0"
                    />
                    <span className="text-slate-400">% em todas as metas</span>
                    <Button
                      onClick={aplicarCrescimento}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Aplicar Crescimento
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ManualForecast;
