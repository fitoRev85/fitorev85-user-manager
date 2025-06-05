
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, Lightbulb } from 'lucide-react';
import { useBudgetMetas } from '@/hooks/useBudgetMetas';
import { useReservationData } from '@/hooks/useReservationData';
import { LoadingState } from '@/components/ui/loading-state';

interface VarianceAnalysisProps {
  propertyId: string;
  year: number;
}

export function VarianceAnalysis({ propertyId, year }: VarianceAnalysisProps) {
  const { metas, calcularResultadoVsMeta } = useBudgetMetas();
  const { data: reservationData, loading } = useReservationData(propertyId);

  if (loading) {
    return <LoadingState message="Analisando desvios..." />;
  }

  const metasAno = metas.filter(m => 
    m.propriedadeId === propertyId && m.mesAno.startsWith(year.toString())
  );

  const resultados = metasAno.map(meta => {
    const resultado = calcularResultadoVsMeta(propertyId, meta.mesAno, reservationData);
    return { meta, resultado };
  }).filter(item => item.resultado);

  const gerarExplicacao = (desvio: number, tipo: string) => {
    const abs = Math.abs(desvio);
    if (abs < 5) return null;

    const explicacoes = {
      receita: {
        positivo: [
          'Estratégia de pricing premium funcionou bem',
          'Aumento na demanda do mercado',
          'Melhoria nos canais de distribuição',
          'Eventos especiais na região'
        ],
        negativo: [
          'Competição mais acirrada no mercado',
          'Estratégia de preços pode estar inadequada',
          'Redução na demanda sazonal',
          'Problemas operacionais afetaram vendas'
        ]
      },
      ocupacao: {
        positivo: [
          'Campanha de marketing efetiva',
          'Melhoria na experiência do hóspede',
          'Novas parcerias comerciais',
          'Eventos locais aumentaram demanda'
        ],
        negativo: [
          'Problemas na estratégia de distribuição',
          'Competidores com ofertas mais atrativas',
          'Questões operacionais ou de qualidade',
          'Sazonalidade não prevista adequadamente'
        ]
      },
      adr: {
        positivo: [
          'Segmentação de mercado eficiente',
          'Upselling e cross-selling funcionaram',
          'Posicionamento premium do produto',
          'Demanda alta permitiu preços maiores'
        ],
        negativo: [
          'Pressão competitiva nos preços',
          'Mix de canais com muitas comissões',
          'Promoções excessivas para ocupação',
          'Estratégia de yield management inadequada'
        ]
      }
    };

    const tipoExplicacao = tipo as keyof typeof explicacoes;
    const sentido = desvio > 0 ? 'positivo' : 'negativo';
    const lista = explicacoes[tipoExplicacao]?.[sentido] || [];
    
    return lista[Math.floor(Math.random() * lista.length)];
  };

  const gerarRecomendacao = (resultado: any) => {
    const recomendacoes = [];

    if (resultado.desvioReceita < -10) {
      recomendacoes.push({
        tipo: 'Receita',
        acao: 'Revisar estratégia de pricing e canais de distribuição',
        prioridade: 'alta'
      });
    }

    if (resultado.desvioOcupacao < -10) {
      recomendacoes.push({
        tipo: 'Ocupação',
        acao: 'Intensificar marketing e revisar estratégia de vendas',
        prioridade: 'alta'
      });
    }

    if (resultado.desvioAdr < -10) {
      recomendacoes.push({
        tipo: 'ADR',
        acao: 'Otimizar mix de canais e reduzir dependência de OTAs',
        prioridade: 'média'
      });
    }

    if (resultado.desvioReceita > 10) {
      recomendacoes.push({
        tipo: 'Receita',
        acao: 'Manter estratégia atual e buscar replicar em outros períodos',
        prioridade: 'baixa'
      });
    }

    return recomendacoes;
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const desviosSignificativos = resultados.filter(r => 
    r.resultado && (
      Math.abs(r.resultado.desvioReceita) > 5 ||
      Math.abs(r.resultado.desvioOcupacao) > 5 ||
      Math.abs(r.resultado.desvioAdr) > 5
    )
  );

  return (
    <div className="space-y-6">
      {/* Resumo de Desvios */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Resumo de Desvios Significativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {desviosSignificativos.length === 0 ? (
            <p className="text-slate-400 text-center py-4">
              Nenhum desvio significativo encontrado (>5%)
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-red-400 font-medium">Desvios Negativos</h4>
                <div className="text-2xl font-bold text-white">
                  {desviosSignificativos.filter(r => 
                    r.resultado && (
                      r.resultado.desvioReceita < -5 ||
                      r.resultado.desvioOcupacao < -5 ||
                      r.resultado.desvioAdr < -5
                    )
                  ).length}
                </div>
                <p className="text-sm text-slate-400">Meses abaixo da meta</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-green-400 font-medium">Desvios Positivos</h4>
                <div className="text-2xl font-bold text-white">
                  {desviosSignificativos.filter(r => 
                    r.resultado && (
                      r.resultado.desvioReceita > 5 ||
                      r.resultado.desvioOcupacao > 5 ||
                      r.resultado.desvioAdr > 5
                    )
                  ).length}
                </div>
                <p className="text-sm text-slate-400">Meses acima da meta</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-yellow-400 font-medium">Maior Desvio</h4>
                <div className="text-2xl font-bold text-white">
                  {Math.max(...desviosSignificativos.map(r => 
                    Math.abs(r.resultado?.desvioReceita || 0)
                  )).toFixed(1)}%
                </div>
                <p className="text-sm text-slate-400">Receita vs meta</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise Detalhada por Mês */}
      <div className="space-y-4">
        {desviosSignificativos.map(({ meta, resultado }) => {
          if (!resultado) return null;

          const [ano, mes] = meta.mesAno.split('-').map(Number);
          const nomeMes = meses[mes - 1];
          const recomendacoes = gerarRecomendacao(resultado);

          return (
            <Card key={meta.mesAno} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">{nomeMes} {year}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Desvios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Receita */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Desvio Receita</span>
                      <div className="flex items-center gap-2">
                        {resultado.desvioReceita > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-bold ${
                          resultado.desvioReceita >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {resultado.desvioReceita >= 0 ? '+' : ''}
                          {resultado.desvioReceita.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {Math.abs(resultado.desvioReceita) > 5 && (
                      <div className="bg-slate-700/30 rounded p-3">
                        <p className="text-sm text-slate-300">
                          <strong>Possível causa:</strong> {gerarExplicacao(resultado.desvioReceita, 'receita')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ocupação */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Desvio Ocupação</span>
                      <div className="flex items-center gap-2">
                        {resultado.desvioOcupacao > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-bold ${
                          resultado.desvioOcupacao >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {resultado.desvioOcupacao >= 0 ? '+' : ''}
                          {resultado.desvioOcupacao.toFixed(1)}pp
                        </span>
                      </div>
                    </div>
                    {Math.abs(resultado.desvioOcupacao) > 5 && (
                      <div className="bg-slate-700/30 rounded p-3">
                        <p className="text-sm text-slate-300">
                          <strong>Possível causa:</strong> {gerarExplicacao(resultado.desvioOcupacao, 'ocupacao')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ADR */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Desvio ADR</span>
                      <div className="flex items-center gap-2">
                        {resultado.desvioAdr > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-bold ${
                          resultado.desvioAdr >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {resultado.desvioAdr >= 0 ? '+' : ''}
                          {resultado.desvioAdr.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {Math.abs(resultado.desvioAdr) > 5 && (
                      <div className="bg-slate-700/30 rounded p-3">
                        <p className="text-sm text-slate-300">
                          <strong>Possível causa:</strong> {gerarExplicacao(resultado.desvioAdr, 'adr')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recomendações */}
                {recomendacoes.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4" />
                      Recomendações
                    </h4>
                    <div className="space-y-2">
                      {recomendacoes.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Badge 
                            className={`mt-0.5 ${
                              rec.prioridade === 'alta' 
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : rec.prioridade === 'média'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : 'bg-green-500/20 text-green-400 border-green-500/30'
                            }`}
                          >
                            {rec.prioridade}
                          </Badge>
                          <div>
                            <span className="text-white font-medium">{rec.tipo}:</span>
                            <p className="text-slate-300 text-sm">{rec.acao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {resultados.length === 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">
              Nenhum resultado para análise. 
              <br />
              Defina metas e aguarde dados realizados para visualizar os desvios.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
