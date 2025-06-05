
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProperties } from '@/hooks/useProperties';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AlertCircle, TrendingDown, Target, ArrowRight } from 'lucide-react';

const PerformanceGapAnalysis = () => {
  const { properties } = useProperties();
  const [selectedMetric, setSelectedMetric] = useState('revpar');

  // Generate performance data for analysis
  const getPerformanceData = () => {
    return properties.map(property => {
      const revpar = property.revpar || 150 + Math.random() * 100;
      const occupancy = property.occupancy || 70 + Math.random() * 20;
      const adr = property.adr || 200 + Math.random() * 150;
      
      return {
        id: property.id,
        name: property.name,
        category: property.category || 'Hotel',
        rooms: property.rooms,
        revpar: revpar,
        occupancy: occupancy,
        adr: adr,
        marketShare: 15 + Math.random() * 20,
        customerSat: 4.2 + Math.random() * 0.6,
        digitalPresence: 60 + Math.random() * 30
      };
    });
  };

  const performanceData = getPerformanceData();
  
  // Calculate benchmarks
  const getBenchmarks = () => {
    const metrics = ['revpar', 'occupancy', 'adr', 'marketShare', 'customerSat', 'digitalPresence'];
    const benchmarks: Record<string, any> = {};
    
    metrics.forEach(metric => {
      const values = performanceData.map(p => p[metric as keyof typeof p] as number);
      benchmarks[metric] = {
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        topPerformer: performanceData.find(p => p[metric as keyof typeof p] === Math.max(...values))?.name
      };
    });
    
    return benchmarks;
  };

  const benchmarks = getBenchmarks();

  // Identify gaps for each property
  const getGapAnalysis = () => {
    return performanceData.map(property => {
      const gaps = [];
      
      // RevPAR gap
      const revparGap = ((benchmarks.revpar.max - property.revpar) / benchmarks.revpar.max) * 100;
      if (revparGap > 10) {
        gaps.push({
          metric: 'RevPAR',
          gap: revparGap,
          current: property.revpar,
          benchmark: benchmarks.revpar.max,
          priority: revparGap > 25 ? 'alta' : 'media',
          recommendation: 'Otimizar estratégia de pricing e aumentar ocupação'
        });
      }

      // Occupancy gap
      const occupancyGap = benchmarks.occupancy.max - property.occupancy;
      if (occupancyGap > 5) {
        gaps.push({
          metric: 'Ocupação',
          gap: occupancyGap,
          current: property.occupancy,
          benchmark: benchmarks.occupancy.max,
          priority: occupancyGap > 15 ? 'alta' : 'media',
          recommendation: 'Melhorar marketing digital e gestão de canais'
        });
      }

      // ADR gap
      const adrGap = ((benchmarks.adr.max - property.adr) / benchmarks.adr.max) * 100;
      if (adrGap > 8) {
        gaps.push({
          metric: 'ADR',
          gap: adrGap,
          current: property.adr,
          benchmark: benchmarks.adr.max,
          priority: adrGap > 20 ? 'alta' : 'media',
          recommendation: 'Posicionar melhor o produto e aumentar valor percebido'
        });
      }

      return {
        property,
        gaps,
        totalGapScore: gaps.reduce((sum, gap) => sum + gap.gap, 0)
      };
    });
  };

  const gapAnalysis = getGapAnalysis();

  // Radar chart data for performance comparison
  const getRadarData = () => {
    return performanceData.map(property => ({
      property: property.name,
      RevPAR: (property.revpar / benchmarks.revpar.max) * 100,
      Ocupação: (property.occupancy / benchmarks.occupancy.max) * 100,
      ADR: (property.adr / benchmarks.adr.max) * 100,
      'Market Share': (property.marketShare / benchmarks.marketShare.max) * 100,
      'Satisfação': (property.customerSat / benchmarks.customerSat.max) * 100
    }));
  };

  const radarData = getRadarData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Gap Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {gapAnalysis.map((analysis) => (
          <Card key={analysis.property.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium text-sm">{analysis.property.name}</h3>
                <Badge 
                  className={`text-xs ${
                    analysis.totalGapScore > 50 ? 'bg-red-500' :
                    analysis.totalGapScore > 25 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                >
                  {analysis.gaps.length} gaps
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Score de Gap Total</p>
                <p className="text-lg font-bold text-white">{analysis.totalGapScore.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Radar Chart */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Comparação de Performance Relativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData[0] ? Object.keys(radarData[0]).filter(k => k !== 'property').map(key => ({
              metric: key,
              ...radarData.reduce((acc, item) => ({
                ...acc,
                [item.property]: item[key as keyof typeof item]
              }), {})
            })) : []}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis 
                domain={[0, 100]} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickCount={5}
              />
              {properties.map((property, index) => (
                <Radar
                  key={property.id}
                  name={property.name}
                  dataKey={property.name}
                  stroke={`hsl(${index * 90}, 70%, 50%)`}
                  fill={`hsl(${index * 90}, 70%, 50%)`}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Gap Analysis */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Análise Detalhada de Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {gapAnalysis.map((analysis) => (
              <div key={analysis.property.id} className="border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{analysis.property.name}</h3>
                  <Badge variant="outline" className="text-slate-300">
                    {analysis.property.category} • {analysis.property.rooms} quartos
                  </Badge>
                </div>
                
                {analysis.gaps.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-green-400">✓ Performance alinhada com o benchmark</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysis.gaps.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="font-medium text-white">{gap.metric}</span>
                            <Badge className={`text-xs ${getPriorityColor(gap.priority)}`}>
                              {gap.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{gap.recommendation}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Atual: {gap.current.toFixed(1)}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>Benchmark: {gap.benchmark.toFixed(1)}</span>
                            <span className="text-red-400">Gap: {gap.gap.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceGapAnalysis;
