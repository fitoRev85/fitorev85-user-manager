
import { useState, useEffect } from 'react';

export interface MetaMensal {
  id: string;
  propriedadeId: string;
  mesAno: string; // formato: 'YYYY-MM'
  receitaMeta: number;
  ocupacaoMeta: number; // porcentagem
  adrMeta: number;
  revparMeta: number;
  observacoes?: string;
  dataCriacao: Date;
  dataAlteracao: Date;
}

export interface ResultadoMeta {
  propriedadeId: string;
  mesAno: string;
  receitaRealizada: number;
  ocupacaoRealizada: number;
  adrRealizado: number;
  revparRealizado: number;
  receitaMeta: number;
  ocupacaoMeta: number;
  adrMeta: number;
  revparMeta: number;
  desvioReceita: number;
  desvioOcupacao: number;
  desvioAdr: number;
  desvioRevpar: number;
  statusGeral: 'success' | 'warning' | 'error';
}

export interface ProjecaoMeta {
  propriedadeId: string;
  mesAno: string;
  diasDecorridos: number;
  diasRestantes: number;
  projecaoReceita: number;
  probabilidadeAtingirMeta: number;
  receitaNecessariaDiaria: number;
  statusProjecao: 'on-track' | 'risk' | 'critical';
}

const STORAGE_KEY = 'budget_metas_data';

export function useBudgetMetas() {
  const [metas, setMetas] = useState<MetaMensal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedMetas = JSON.parse(stored);
        const metasWithDates = parsedMetas.map((meta: any) => ({
          ...meta,
          dataCriacao: new Date(meta.dataCriacao),
          dataAlteracao: new Date(meta.dataAlteracao)
        }));
        setMetas(metasWithDates);
      } catch {
        setMetas([]);
      }
    }
    setLoading(false);
  }, []);

  const saveMetas = (newMetas: MetaMensal[]) => {
    setMetas(newMetas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMetas));
  };

  const criarOuAtualizarMeta = (meta: Omit<MetaMensal, 'id' | 'dataCriacao' | 'dataAlteracao'>) => {
    const agora = new Date();
    const metaExistente = metas.find(m => 
      m.propriedadeId === meta.propriedadeId && m.mesAno === meta.mesAno
    );

    if (metaExistente) {
      const metasAtualizadas = metas.map(m => 
        m.id === metaExistente.id 
          ? { ...meta, id: m.id, dataCriacao: m.dataCriacao, dataAlteracao: agora }
          : m
      );
      saveMetas(metasAtualizadas);
    } else {
      const novaMeta: MetaMensal = {
        ...meta,
        id: Date.now().toString(),
        dataCriacao: agora,
        dataAlteracao: agora
      };
      saveMetas([...metas, novaMeta]);
    }
  };

  const obterMetasPropriedade = (propriedadeId: string, ano?: number) => {
    let metasFiltradas = metas.filter(m => m.propriedadeId === propriedadeId);
    if (ano) {
      metasFiltradas = metasFiltradas.filter(m => m.mesAno.startsWith(ano.toString()));
    }
    return metasFiltradas.sort((a, b) => a.mesAno.localeCompare(b.mesAno));
  };

  const calcularResultadoVsMeta = (
    propriedadeId: string, 
    mesAno: string, 
    dadosRealizados: any[]
  ): ResultadoMeta | null => {
    const meta = metas.find(m => m.propriedadeId === propriedadeId && m.mesAno === mesAno);
    if (!meta) return null;

    // Filtrar dados do mês específico
    const dadosMes = dadosRealizados.filter(d => {
      const dataCheckin = new Date(d.data_checkin);
      const mesData = `${dataCheckin.getFullYear()}-${String(dataCheckin.getMonth() + 1).padStart(2, '0')}`;
      return mesData === mesAno;
    });

    // Calcular realizados
    const receitaRealizada = dadosMes.reduce((sum, d) => sum + (d.valor_total || 0), 0);
    const totalNoites = dadosMes.reduce((sum, d) => sum + (d.noites || 1), 0);
    const ocupacaoRealizada = dadosMes.length > 0 ? (dadosMes.length / 30) * 100 : 0; // Aproximação
    const adrRealizado = totalNoites > 0 ? receitaRealizada / totalNoites : 0;
    const revparRealizado = adrRealizado * (ocupacaoRealizada / 100);

    // Calcular desvios
    const desvioReceita = ((receitaRealizada - meta.receitaMeta) / meta.receitaMeta) * 100;
    const desvioOcupacao = ocupacaoRealizada - meta.ocupacaoMeta;
    const desvioAdr = ((adrRealizado - meta.adrMeta) / meta.adrMeta) * 100;
    const desvioRevpar = ((revparRealizado - meta.revparMeta) / meta.revparMeta) * 100;

    // Determinar status geral
    let statusGeral: 'success' | 'warning' | 'error' = 'success';
    if (desvioReceita < -10 || desvioOcupacao < -10 || desvioAdr < -10) {
      statusGeral = 'error';
    } else if (desvioReceita < -5 || desvioOcupacao < -5 || desvioAdr < -5) {
      statusGeral = 'warning';
    }

    return {
      propriedadeId,
      mesAno,
      receitaRealizada,
      ocupacaoRealizada,
      adrRealizado,
      revparRealizado,
      receitaMeta: meta.receitaMeta,
      ocupacaoMeta: meta.ocupacaoMeta,
      adrMeta: meta.adrMeta,
      revparMeta: meta.revparMeta,
      desvioReceita,
      desvioOcupacao,
      desvioAdr,
      desvioRevpar,
      statusGeral
    };
  };

  const calcularProjecaoMeta = (
    propriedadeId: string,
    mesAno: string,
    dadosRealizados: any[]
  ): ProjecaoMeta | null => {
    const meta = metas.find(m => m.propriedadeId === propriedadeId && m.mesAno === mesAno);
    if (!meta) return null;

    const hoje = new Date();
    const [ano, mes] = mesAno.split('-').map(Number);
    const primeiroDiaMes = new Date(ano, mes - 1, 1);
    const ultimoDiaMes = new Date(ano, mes, 0);
    
    const diasDecorridos = Math.max(1, Math.floor((hoje.getTime() - primeiroDiaMes.getTime()) / (1000 * 60 * 60 * 24)));
    const diasRestantes = Math.max(0, Math.floor((ultimoDiaMes.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
    const diasTotais = diasDecorridos + diasRestantes;

    // Calcular receita realizada até agora
    const dadosMes = dadosRealizados.filter(d => {
      const dataCheckin = new Date(d.data_checkin);
      const mesData = `${dataCheckin.getFullYear()}-${String(dataCheckin.getMonth() + 1).padStart(2, '0')}`;
      return mesData === mesAno && dataCheckin <= hoje;
    });

    const receitaRealizada = dadosMes.reduce((sum, d) => sum + (d.valor_total || 0), 0);
    const mediaDiaria = receitaRealizada / diasDecorridos;
    const projecaoReceita = mediaDiaria * diasTotais;

    const probabilidadeAtingirMeta = Math.min(100, (projecaoReceita / meta.receitaMeta) * 100);
    const receitaRestante = Math.max(0, meta.receitaMeta - receitaRealizada);
    const receitaNecessariaDiaria = diasRestantes > 0 ? receitaRestante / diasRestantes : 0;

    let statusProjecao: 'on-track' | 'risk' | 'critical' = 'on-track';
    if (probabilidadeAtingirMeta < 80) {
      statusProjecao = 'critical';
    } else if (probabilidadeAtingirMeta < 95) {
      statusProjecao = 'risk';
    }

    return {
      propriedadeId,
      mesAno,
      diasDecorridos,
      diasRestantes,
      projecaoReceita,
      probabilidadeAtingirMeta,
      receitaNecessariaDiaria,
      statusProjecao
    };
  };

  return {
    metas,
    loading,
    criarOuAtualizarMeta,
    obterMetasPropriedade,
    calcularResultadoVsMeta,
    calcularProjecaoMeta
  };
}
