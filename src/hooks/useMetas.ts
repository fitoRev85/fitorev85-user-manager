
import { useState, useEffect } from 'react';

export interface Meta {
  id?: string;
  propriedadeId: string;
  mesAno: string; // Formato: 'YYYY-MM'
  valorMeta: number;
  tipoMeta: 'receita' | 'ocupacao' | 'adr' | 'revpar';
  dataCriacao?: Date;
  dataAlteracao?: Date;
  ativo?: boolean;
  observacoes?: string;
}

export interface EstatisticasMetas {
  totalMetasAtivas: number;
  propriedadesComMetas: number;
  periodoMaisRecente: string | null;
  dataConsulta: string;
}

const STORAGE_KEY = 'fitorev85_metas';

export function useMetas() {
  const [metas, setMetas] = useState<Meta[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedMetas = JSON.parse(stored);
        const metasWithDates = parsedMetas.map((meta: any) => ({
          ...meta,
          dataCriacao: meta.dataCriacao ? new Date(meta.dataCriacao) : undefined,
          dataAlteracao: meta.dataAlteracao ? new Date(meta.dataAlteracao) : undefined
        }));
        setMetas(metasWithDates);
        console.log('Metas carregadas do localStorage:', metasWithDates);
      } catch {
        console.log('Erro ao carregar metas, iniciando com array vazio');
        setMetas([]);
      }
    }
  }, []);

  const saveMetas = (newMetas: Meta[]) => {
    setMetas(newMetas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMetas));
    console.log('Metas salvas:', newMetas);
  };

  const validarMeta = (propriedadeId: string, mesAno: string, valorMeta: number, tipoMeta: string): { valida: boolean; mensagem: string } => {
    // Validar propriedade_id
    if (!propriedadeId || propriedadeId.trim() === '') {
      return { valida: false, mensagem: 'ID da propriedade é obrigatório' };
    }

    // Validar formato mes_ano
    const regexMesAno = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!regexMesAno.test(mesAno)) {
      return { valida: false, mensagem: 'Formato de mês/ano inválido. Use YYYY-MM' };
    }

    // Validar se não é período passado
    const [ano, mes] = mesAno.split('-').map(Number);
    const dataMeta = new Date(ano, mes - 1, 1);
    const dataAtual = new Date();
    const primeiroDiaAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);

    if (dataMeta < primeiroDiaAtual) {
      return { valida: false, mensagem: 'Não é possível definir metas para períodos passados' };
    }

    // Validar valor positivo
    if (typeof valorMeta !== 'number' || valorMeta <= 0) {
      return { valida: false, mensagem: 'Valor da meta deve ser um número positivo' };
    }

    // Validar tipo_meta
    const tiposValidos = ['receita', 'ocupacao', 'adr', 'revpar'];
    if (!tiposValidos.includes(tipoMeta)) {
      return { valida: false, mensagem: `Tipo de meta deve ser um dos seguintes: ${tiposValidos.join(', ')}` };
    }

    return { valida: true, mensagem: 'Validação OK' };
  };

  const inserirMeta = (propriedadeId: string, mesAno: string, valorMeta: number, tipoMeta: 'receita' | 'ocupacao' | 'adr' | 'revpar', observacoes?: string): boolean => {
    // Validar dados
    const { valida, mensagem } = validarMeta(propriedadeId, mesAno, valorMeta, tipoMeta);
    if (!valida) {
      console.error(`Validação falhou: ${mensagem}`);
      throw new Error(mensagem);
    }

    try {
      const agora = new Date();
      
      // Verificar se meta já existe
      const metaExistente = metas.find(m => 
        m.propriedadeId === propriedadeId && 
        m.mesAno === mesAno && 
        m.tipoMeta === tipoMeta
      );

      if (metaExistente) {
        // Atualizar meta existente
        const metasAtualizadas = metas.map(m => 
          m.id === metaExistente.id 
            ? { ...m, valorMeta, dataAlteracao: agora, observacoes }
            : m
        );
        saveMetas(metasAtualizadas);
      } else {
        // Criar nova meta
        const novaMeta: Meta = {
          id: Date.now().toString(),
          propriedadeId,
          mesAno,
          valorMeta,
          tipoMeta,
          dataCriacao: agora,
          dataAlteracao: agora,
          ativo: true,
          observacoes
        };
        
        const metasAtualizadas = [...metas, novaMeta];
        saveMetas(metasAtualizadas);
      }

      console.log(`Meta inserida/atualizada: Propriedade ${propriedadeId}, ${mesAno}, ${valorMeta}`);
      return true;
    } catch (error) {
      console.error('Erro ao inserir meta:', error);
      return false;
    }
  };

  const obterMetasPropriedade = (propriedadeId: string, ano?: number): Meta[] => {
    try {
      let metasFiltradas = metas.filter(m => 
        m.propriedadeId === propriedadeId && 
        (m.ativo === undefined || m.ativo === true)
      );

      if (ano) {
        metasFiltradas = metasFiltradas.filter(m => m.mesAno.startsWith(ano.toString()));
      }

      return metasFiltradas.sort((a, b) => a.mesAno.localeCompare(b.mesAno));
    } catch (error) {
      console.error('Erro ao obter metas:', error);
      return [];
    }
  };

  const obterMetaPeriodo = (propriedadeId: string, mesAno: string, tipoMeta: 'receita' | 'ocupacao' | 'adr' | 'revpar'): Meta | null => {
    try {
      const meta = metas.find(m => 
        m.propriedadeId === propriedadeId && 
        m.mesAno === mesAno && 
        m.tipoMeta === tipoMeta &&
        (m.ativo === undefined || m.ativo === true)
      );
      
      return meta || null;
    } catch (error) {
      console.error('Erro ao obter meta do período:', error);
      return null;
    }
  };

  const inserirMetasLote = (metasLote: Omit<Meta, 'id' | 'dataCriacao' | 'dataAlteracao' | 'ativo'>[]): { sucessos: number; erros: number } => {
    let sucessos = 0;
    let erros = 0;

    for (const meta of metasLote) {
      try {
        if (inserirMeta(
          meta.propriedadeId,
          meta.mesAno,
          meta.valorMeta,
          meta.tipoMeta,
          meta.observacoes
        )) {
          sucessos++;
        } else {
          erros++;
        }
      } catch (error) {
        console.error('Erro ao inserir meta em lote:', error);
        erros++;
      }
    }

    return { sucessos, erros };
  };

  const excluirMeta = (propriedadeId: string, mesAno: string, tipoMeta: 'receita' | 'ocupacao' | 'adr' | 'revpar'): boolean => {
    try {
      const metaIndex = metas.findIndex(m => 
        m.propriedadeId === propriedadeId && 
        m.mesAno === mesAno && 
        m.tipoMeta === tipoMeta
      );

      if (metaIndex >= 0) {
        const metasAtualizadas = metas.map((m, index) => 
          index === metaIndex 
            ? { ...m, ativo: false, dataAlteracao: new Date() }
            : m
        );
        saveMetas(metasAtualizadas);
        console.log(`Meta excluída: Propriedade ${propriedadeId}, ${mesAno}`);
        return true;
      } else {
        console.warn(`Meta não encontrada para exclusão: Propriedade ${propriedadeId}, ${mesAno}`);
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      return false;
    }
  };

  const copiarMetasAnoAnterior = (propriedadeId: string, anoOrigem: number, anoDestino: number, fatorCrescimento: number = 1.0): { sucessos: number; erros: number } => {
    // Obter metas do ano anterior
    const metasOrigem = obterMetasPropriedade(propriedadeId, anoOrigem);

    if (metasOrigem.length === 0) {
      console.warn(`Nenhuma meta encontrada para o ano ${anoOrigem}`);
      return { sucessos: 0, erros: 0 };
    }

    // Preparar metas para o novo ano
    const novasMetas = metasOrigem.map(meta => {
      const mes = meta.mesAno.split('-')[1]; // Extrair o mês
      return {
        propriedadeId,
        mesAno: `${anoDestino}-${mes}`,
        valorMeta: Math.round(meta.valorMeta * fatorCrescimento * 100) / 100,
        tipoMeta: meta.tipoMeta,
        observacoes: `Copiado do ${anoOrigem} com crescimento de ${((fatorCrescimento - 1) * 100).toFixed(1)}%`
      };
    });

    // Inserir as novas metas
    return inserirMetasLote(novasMetas);
  };

  const obterEstatisticas = (): EstatisticasMetas => {
    try {
      const metasAtivas = metas.filter(m => m.ativo === undefined || m.ativo === true);
      
      const totalMetasAtivas = metasAtivas.length;
      const propriedadesComMetas = new Set(metasAtivas.map(m => m.propriedadeId)).size;
      const periodoMaisRecente = metasAtivas.length > 0 
        ? metasAtivas.sort((a, b) => b.mesAno.localeCompare(a.mesAno))[0].mesAno
        : null;

      return {
        totalMetasAtivas,
        propriedadesComMetas,
        periodoMaisRecente,
        dataConsulta: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalMetasAtivas: 0,
        propriedadesComMetas: 0,
        periodoMaisRecente: null,
        dataConsulta: new Date().toISOString()
      };
    }
  };

  return {
    metas,
    inserirMeta,
    obterMetasPropriedade,
    obterMetaPeriodo,
    inserirMetasLote,
    excluirMeta,
    copiarMetasAnoAnterior,
    obterEstatisticas
  };
}
