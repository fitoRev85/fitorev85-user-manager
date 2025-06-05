
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProperties } from '@/hooks/useProperties';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Trophy, Target, TrendingUp, Star, Award, AlertTriangle } from 'lucide-react';

const CompetitivenessScore = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('1');

  // Calculate competitiveness scores
  const calculateScores = () => {
    return properties.map(property => {
      // Financial Performance (40% weight)
      const revparScore = Math.min(100, ((property.revpar || 180) / 300) * 100);
      const occupancyScore = Math.min(100, ((property.occupancy || 75) / 95) * 100);
      const adrScore = Math.min(100, ((property.adr || 240) / 400) * 100);
      const financialScore = (revparScore * 0.5 + occupancyScore * 0.3 + adrScore * 0.2);

      // Market Position (25% weight)
      const marketShareScore = 60 + Math.random() * 30; // Simulated
      const brandStrengthScore = property.category === 'Luxo' ? 85 : 
                               property.category === 'Boutique' ? 75 : 70;
      const marketPositionScore = (marketShareScore * 0.6 + brandStrengthScore * 0.4);

      // Operational Excellence (20% weight)
      const customerSatisfactionScore = (4.2 + Math.random() * 0.6) * 20; // Scale to 100
      const serviceQualityScore = 75 + Math.random() * 20;
      const operationalScore = (customerSatisfactionScore * 0.6 + serviceQualityScore * 0.4);

      // Innovation & Technology (15% weight)
      const digitalPresenceScore = 60 + Math.random() * 30;
      const technologyScore = property.rooms > 150 ? 80 : 70 + Math.random() * 15;
      const innovationScore = (digitalPresenceScore * 0.6 + technologyScore * 0.4);

      // Overall Score
      const overallScore = (
        financialScore * 0.4 +
        marketPositionScore * 0.25 +
        operationalScore * 0.2 +
        innovationScore * 0.15
      );

      return {
        id: property.id,
        name: property.name,
        category: property.category,
        overallScore: overallScore,
        financialScore: financialScore,
        marketPositionScore: marketPositionScore,
        operationalScore: operationalScore,
        innovationScore: innovationScore,
        components: {
          revpar: revparScore,
          occupancy: occupancyScore,
          adr: adrScore,
          marketShare: marketShareScore,
          brandStrength: brandStrengthScore,
          customerSatisfaction: customerSatisfactionScore,
          serviceQuality: serviceQualityScore,
          digitalPresence: digitalPresenceScore,
          technology: technologyScore
        }
      };
    });
  };

  const scoresData = calculateScores();
  const selectedPropertyData = scoresData.find(s => s.id === selectedProperty);

  // Generate historical trend (simulated)
  const getHistoricalTrend = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map((month, index) => {
      const baseScore = selectedPropertyData?.overallScore || 80;
      const variation = -5 + Math.random() * 10;
      const data: any = { 
        month,
        score: Math.max(0, Math.min(100, baseScore + variation))
      };
      
      // Add individual component trends
      data.financial = Math.max(0, Math.min(100, (selectedPropertyData?.financialScore || 80) + variation));
      data.market = Math.max(0, Math.min(100, (selectedPropertyData?.marketPositionScore || 75) + variation));
      data.operational = Math.max(0, Math.min(100, (selectedPropertyData?.operationalScore || 85) + variation));
      data.innovation = Math.max(0, Math.min(100, (selectedPropertyData?.innovationScore || 70) + variation));
      
      return data;
    });
  };

  const historicalData = getHistoricalTrend();

  // Competitive positioning
  const getCompetitiveRanking = () => {
    return scoresData
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((property, index) => ({
        ...property,
        rank: index + 1,
        percentile: ((scoresData.length - index) / scoresData.length) * 100
      }));
  };

  const ranking = getCompetitiveRanking();

  // Radar chart data
  const getRadarData = () => {
    if (!selectedPropertyData) return [];
    
    return [
      {
        metric: 'Performance Financeira',
        score: selectedPropertyData.financialScore,
        fullMark: 100
      },
      {
        metric: 'Posição de Mercado',
        score: selectedPropertyData.marketPositionScore,
        fullMark: 100
      },
      {
        metric: 'Excelência Operacional',
        score: selectedPropertyData.operationalScore,
        fullMark: 100
      },
      {
        metric: 'Inovação & Tecnologia',
        score: selectedPropertyData.innovationScore,
        fullMark: 100
      }
    ];
  };

  const radarData = getRadarData();

  // Improvement recommendations
  const getRecommendations = () => {
    if (!selectedPropertyData) return [];
    
    const recommendations = [];
    const scores = selectedPropertyData;
    
    if (scores.financialScore < 75) {
      recommendations.push({
        area: 'Performance Financeira',
        priority: 'Alta',
        action: 'Otimizar estratégias de pricing e ocupação',
        impact: 'Alto'
      });
    }
    
    if (scores.marketPositionScore < 70) {
      recommendations.push({
        area: 'Posição de Mercado',
        priority: 'Média',
        action: 'Fortalecer marca e aumentar market share',
        impact: 'Médio'
      });
    }
    
    if (scores.operationalScore < 80) {
      recommendations.push({
        area: 'Excelência Operacional',
        priority: 'Alta',
        action: 'Melhorar satisfação do cliente e qualidade de serviço',
        impact: 'Alto'
      });
    }
    
    if (scores.innovationScore < 65) {
      recommendations.push({
        area: 'Inovação & Tecnologia',
        priority: 'Média',
        action: 'Investir em tecnologia e presença digital',
        impact: 'Médio'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Bom';
    if (score >= 60) return 'Regular';
    return 'Precisa Melhorar';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500';
      case 'Média': return 'bg-yellow-500';
      case 'Baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Selector */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-white font-medium">Propriedade:</label>
            <div className="flex gap-2">
              {properties.map(property => (
                <Button
                  key={property.id}
                  variant={selectedProperty === property.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedProperty(property.id)}
                  className="border-slate-600"
                >
                  {property.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score Card */}
      {selectedPropertyData && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">{selectedPropertyData.name}</h2>
              </div>
              
              <div className="mb-4">
                <div className={`text-6xl font-bold ${getScoreColor(selectedPropertyData.overallScore)}`}>
                  {selectedPropertyData.overallScore.toFixed(1)}
                </div>
                <div className="text-slate-400 text-lg">
                  {getScoreLabel(selectedPropertyData.overallScore)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Ranking</p>
                  <p className="text-white text-xl font-bold">
                    #{ranking.find(r => r.id === selectedProperty)?.rank}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Percentil</p>
                  <p className="text-white text-xl font-bold">
                    {ranking.find(r => r.id === selectedProperty)?.percentile.toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Categoria</p>
                  <p className="text-white text-xl font-bold">{selectedPropertyData.category}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Tendência</p>
                  <p className="text-green-400 text-xl font-bold">↗ +2.3%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {selectedPropertyData && (
          <>
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium text-sm">Performance Financeira</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(selectedPropertyData.financialScore)}`}>
                  {selectedPropertyData.financialScore.toFixed(1)}
                </div>
                <Progress value={selectedPropertyData.financialScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium text-sm">Posição de Mercado</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(selectedPropertyData.marketPositionScore)}`}>
                  {selectedPropertyData.marketPositionScore.toFixed(1)}
                </div>
                <Progress value={selectedPropertyData.marketPositionScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium text-sm">Excelência Operacional</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(selectedPropertyData.operationalScore)}`}>
                  {selectedPropertyData.operationalScore.toFixed(1)}
                </div>
                <Progress value={selectedPropertyData.operationalScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-medium text-sm">Inovação & Tecnologia</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(selectedPropertyData.innovationScore)}`}>
                  {selectedPropertyData.innovationScore.toFixed(1)}
                </div>
                <Progress value={selectedPropertyData.innovationScore} className="mt-2" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Análise Detalhada por Dimensão</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Evolução Histórica</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} name="Score Geral" />
                <Line type="monotone" dataKey="financial" stroke="#10b981" strokeWidth={2} name="Financeiro" />
                <Line type="monotone" dataKey="operational" stroke="#f59e0b" strokeWidth={2} name="Operacional" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Ranking */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Ranking Competitivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ranking.map((property) => (
              <div 
                key={property.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  property.id === selectedProperty ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    property.rank === 1 ? 'bg-yellow-500 text-black' :
                    property.rank === 2 ? 'bg-slate-400 text-black' :
                    property.rank === 3 ? 'bg-orange-500 text-black' :
                    'bg-slate-600 text-white'
                  }`}>
                    {property.rank}
                  </div>
                  <div>
                    <p className="text-white font-medium">{property.name}</p>
                    <p className="text-slate-400 text-sm">{property.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getScoreColor(property.overallScore)}`}>
                    {property.overallScore.toFixed(1)}
                  </p>
                  <p className="text-slate-400 text-sm">{property.percentile.toFixed(0)}º percentil</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recomendações de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-white">{rec.area}</span>
                        <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{rec.action}</p>
                    </div>
                    <Badge variant="outline" className="text-slate-300 border-slate-600 ml-4">
                      Impacto {rec.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetitivenessScore;
