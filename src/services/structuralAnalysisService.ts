import { StructuralElement, StructuralAnalysis, Inconsistency, Optimization } from '../types/project';
import { executeQuery } from '../lib/db';

// Constantes da NBR 6118
const MIN_FCK = 20; // MPa
const MAX_FCK = 90; // MPa

const MIN_PILLAR_STEEL_RATIO = 0.004; // 0.4%
const MAX_PILLAR_STEEL_RATIO = 0.04; // 4%

const MIN_BEAM_STEEL_RATIO = 0.0015; // 0.15%
const MAX_BEAM_STEEL_RATIO = 0.025; // 2.5%

const MIN_SLAB_STEEL_RATIO = 0.001; // 0.1%
const MAX_SLAB_STEEL_RATIO = 0.02; // 2%

const CONCRETE_DENSITY = 2400; // kg/m³
const STEEL_DENSITY = 7850; // kg/m³
const SAFETY_FACTOR = 1.4;

export async function analyzeStructure(projectId: string): Promise<StructuralAnalysis> {
  try {
    // Buscar elementos do projeto
    const elements = await getProjectElements(projectId);
    
    // Calcular totais
    const { totalConcrete, totalSteel } = calculateTotals(elements);
    
    // Verificar inconsistências
    const inconsistencies = checkInconsistencies(elements);
    
    // Gerar sugestões de otimização
    const optimizations = generateOptimizations(elements);
    
    // Calcular área total
    const totalArea = calculateTotalArea(elements);
    
    // Criar análise estrutural
    const analysis: StructuralAnalysis = {
      projectId,
      elements,
      totalArea,
      totalConcrete,
      totalSteel,
      inconsistencies,
      optimizations,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Salvar análise
    await saveAnalysis(analysis);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing structure:', error);
    throw error;
  }
}

async function getProjectElements(projectId: string): Promise<StructuralElement[]> {
  const result = await executeQuery<StructuralElement>(
    `SELECT * FROM StructuralElements WHERE project_id = @projectId`,
    { projectId }
  );
  return result;
}

function calculateTotals(elements: StructuralElement[]): { totalConcrete: number; totalSteel: number } {
  let totalConcrete = 0;
  let totalSteel = 0;
  
  for (const element of elements) {
    const volume = calculateElementVolume(element);
    const steelWeight = calculateSteelWeight(element);
    
    totalConcrete += volume;
    totalSteel += steelWeight;
  }
  
  return { totalConcrete, totalSteel };
}

function calculateElementVolume(element: StructuralElement): number {
  const { width, height, length } = element.dimensions;
  let volume = 0;
  
  switch (element.type) {
    case 'pillar':
      volume = width * height * length;
      break;
    case 'beam':
      volume = width * height * length;
      break;
    case 'slab':
      volume = width * length * (element.dimensions.thickness || 0) / 100;
      break;
    default:
      volume = 0;
  }
  
  return volume * CONCRETE_DENSITY; // Retorna o peso do concreto em kg
}

function calculateSteelWeight(element: StructuralElement): number {
  const { width, height, length } = element.dimensions;
  const steelRatio = element.materials.steel.weight / (width * height);
  
  // Calcular área de aço
  const steelArea = (width * height) * steelRatio;
  
  // Calcular peso do aço com fator de segurança
  return steelArea * length * STEEL_DENSITY * SAFETY_FACTOR;
}

function checkInconsistencies(elements: StructuralElement[]): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];
  
  for (const element of elements) {
    // Verificar resistência do concreto
    const fck = element.materials.concrete.fck;
    if (fck < MIN_FCK) {
      inconsistencies.push({
        type: 'concrete_strength',
        severity: 'high',
        description: `Resistência do concreto (${fck} MPa) abaixo do mínimo permitido (${MIN_FCK} MPa)`,
        elementId: element.id,
        rule: 'NBR 6118 - Resistência mínima do concreto'
      });
    }
    if (fck > MAX_FCK) {
      inconsistencies.push({
        type: 'concrete_strength',
        severity: 'medium',
        description: `Resistência do concreto (${fck} MPa) acima do máximo recomendado (${MAX_FCK} MPa)`,
        elementId: element.id,
        rule: 'NBR 6118 - Resistência máxima do concreto'
      });
    }
    
    // Verificar taxa de armadura
    const steelRatio = element.materials.steel.weight / (element.dimensions.width * element.dimensions.height);
    switch (element.type) {
      case 'pillar':
        if (steelRatio < MIN_PILLAR_STEEL_RATIO) {
          inconsistencies.push({
            type: 'steel_ratio',
            severity: 'high',
            description: `Taxa de armadura (${(steelRatio * 100).toFixed(2)}%) abaixo do mínimo permitido (${(MIN_PILLAR_STEEL_RATIO * 100).toFixed(2)}%)`,
            elementId: element.id,
            rule: 'NBR 6118 - Taxa mínima de armadura em pilares'
          });
        }
        if (steelRatio > MAX_PILLAR_STEEL_RATIO) {
          inconsistencies.push({
            type: 'steel_ratio',
            severity: 'medium',
            description: `Taxa de armadura (${(steelRatio * 100).toFixed(2)}%) acima do máximo recomendado (${(MAX_PILLAR_STEEL_RATIO * 100).toFixed(2)}%)`,
            elementId: element.id,
            rule: 'NBR 6118 - Taxa máxima de armadura em pilares'
          });
        }
        break;
        
      case 'beam':
        if (steelRatio < MIN_BEAM_STEEL_RATIO) {
          inconsistencies.push({
            type: 'steel_ratio',
            severity: 'high',
            description: `Taxa de armadura (${(steelRatio * 100).toFixed(2)}%) abaixo do mínimo permitido (${(MIN_BEAM_STEEL_RATIO * 100).toFixed(2)}%)`,
            elementId: element.id,
            rule: 'NBR 6118 - Taxa mínima de armadura em vigas'
          });
        }
        if (steelRatio > MAX_BEAM_STEEL_RATIO) {
          inconsistencies.push({
            type: 'steel_ratio',
            severity: 'medium',
            description: `Taxa de armadura (${(steelRatio * 100).toFixed(2)}%) acima do máximo recomendado (${(MAX_BEAM_STEEL_RATIO * 100).toFixed(2)}%)`,
            elementId: element.id,
            rule: 'NBR 6118 - Taxa máxima de armadura em vigas'
          });
        }
        break;
        
      case 'slab':
        if (steelRatio < MIN_SLAB_STEEL_RATIO) {
          inconsistencies.push({
            type: 'steel_ratio',
            severity: 'high',
            description: `Taxa de armadura (${(steelRatio * 100).toFixed(2)}%) abaixo do mínimo permitido (${(MIN_SLAB_STEEL_RATIO * 100).toFixed(2)}%)`,
            elementId: element.id,
            rule: 'NBR 6118 - Taxa mínima de armadura em lajes'
          });
        }
        if (steelRatio > MAX_SLAB_STEEL_RATIO) {
          inconsistencies.push({
            type: 'steel_ratio',
            severity: 'medium',
            description: `Taxa de armadura (${(steelRatio * 100).toFixed(2)}%) acima do máximo recomendado (${(MAX_SLAB_STEEL_RATIO * 100).toFixed(2)}%)`,
            elementId: element.id,
            rule: 'NBR 6118 - Taxa máxima de armadura em lajes'
          });
        }
        break;
    }
  }
  
  return inconsistencies;
}

function generateOptimizations(elements: StructuralElement[]): Optimization[] {
  const optimizations: Optimization[] = [];
  
  for (const element of elements) {
    // Otimização de concreto
    if (element.materials.concrete.fck > MIN_FCK + 5) {
      const potentialSavings = calculateConcreteOptimization(element);
      if (potentialSavings > 0) {
        optimizations.push({
          type: 'concrete',
          description: `Reduzir fck de ${element.materials.concrete.fck} MPa para ${MIN_FCK + 5} MPa`,
          potentialSavings: {
            concrete: potentialSavings,
            cost: potentialSavings * 300 // R$ 300/m³
          },
          elementId: element.id
        });
      }
    }
    
    // Otimização de aço
    const steelOptimization = calculateSteelOptimization(element);
    if (steelOptimization.potentialSavings > 0) {
      optimizations.push({
        type: 'steel',
        description: `Ajustar taxa de armadura para ${(steelOptimization.recommendedRatio * 100).toFixed(2)}%`,
        potentialSavings: {
          steel: steelOptimization.potentialSavings,
          cost: steelOptimization.potentialSavings * 8 // R$ 8/kg
        },
        elementId: element.id
      });
    }
    
    // Otimização de dimensões
    const dimensionOptimization = calculateDimensionOptimization(element);
    if (dimensionOptimization.potentialSavings > 0) {
      optimizations.push({
        type: 'dimensions',
        description: `Ajustar dimensões para ${dimensionOptimization.recommendedDimensions}`,
        potentialSavings: {
          concrete: dimensionOptimization.potentialSavings,
          cost: dimensionOptimization.potentialSavings * 300
        },
        elementId: element.id
      });
    }
  }
  
  return optimizations;
}

function calculateConcreteOptimization(element: StructuralElement): number {
  const currentVolume = calculateElementVolume(element);
  const currentFck = element.materials.concrete.fck;
  const recommendedFck = MIN_FCK + 5;
  
  // Reduzir fck pode permitir reduzir dimensões
  const potentialReduction = (currentFck - recommendedFck) / currentFck;
  return currentVolume * potentialReduction;
}

function calculateSteelOptimization(element: StructuralElement): { recommendedRatio: number; potentialSavings: number } {
  const currentRatio = element.materials.steel.weight / (element.dimensions.width * element.dimensions.height);
  const { width, height, length } = element.dimensions;
  
  let recommendedRatio = currentRatio;
  let potentialSavings = 0;
  
  switch (element.type) {
    case 'pillar':
      if (currentRatio > MAX_PILLAR_STEEL_RATIO) {
        recommendedRatio = MAX_PILLAR_STEEL_RATIO;
        potentialSavings = (currentRatio - recommendedRatio) * width * height * length * STEEL_DENSITY;
      }
      break;
      
    case 'beam':
      if (currentRatio > MAX_BEAM_STEEL_RATIO) {
        recommendedRatio = MAX_BEAM_STEEL_RATIO;
        potentialSavings = (currentRatio - recommendedRatio) * width * height * length * STEEL_DENSITY;
      }
      break;
      
    case 'slab':
      if (currentRatio > MAX_SLAB_STEEL_RATIO) {
        recommendedRatio = MAX_SLAB_STEEL_RATIO;
        potentialSavings = (currentRatio - recommendedRatio) * width * length * ((element.dimensions.thickness ?? 0) / 100) * STEEL_DENSITY;
      }
      break;
  }
  
  return { recommendedRatio, potentialSavings };
}

function calculateDimensionOptimization(element: StructuralElement): { recommendedDimensions: string; potentialSavings: number } {
  let recommendedDimensions = '';
  let potentialSavings = 0;
  
  // Implementar lógica de otimização de dimensões
  // Baseado em cargas e vãos
  if (element.type === 'slab' && element.dimensions.thickness && element.dimensions.thickness > 12) {
    recommendedDimensions = `${element.dimensions.width}x${element.dimensions.length}x10`;
    potentialSavings = (element.dimensions.thickness - 10) * element.dimensions.width * element.dimensions.length;
  }
  
  return { recommendedDimensions, potentialSavings };
}

function calculateTotalArea(elements: StructuralElement[]): number {
  let totalArea = 0;
  
  for (const element of elements) {
    const { width, length } = element.dimensions;
    
    switch (element.type) {
      case 'pillar':
        totalArea += width * length;
        break;
      case 'beam':
        totalArea += width * length;
        break;
      case 'slab':
        totalArea += width * length;
        break;
    }
  }
  
  return totalArea;
}

async function saveAnalysis(analysis: StructuralAnalysis): Promise<void> {
  await executeQuery(
    `INSERT INTO ProjectReports (
      project_id, elements, total_area, total_concrete, total_steel,
      inconsistencies, optimizations, created_at, updated_at
    ) VALUES (
      @projectId, @elements, @totalArea, @totalConcrete, @totalSteel,
      @inconsistencies, @optimizations, @createdAt, @updatedAt
    )`,
    {
      projectId: analysis.projectId,
      elements: JSON.stringify(analysis.elements),
      totalArea: analysis.totalArea,
      totalConcrete: analysis.totalConcrete,
      totalSteel: analysis.totalSteel,
      inconsistencies: JSON.stringify(analysis.inconsistencies),
      optimizations: JSON.stringify(analysis.optimizations),
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt
    }
  );
} 