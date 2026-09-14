export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  icon: string;
  text: string;
  suggestedOptions: {
    summaryType: 'executive' | 'bullets' | 'study' | 'eli5' | 'deep' | 'qa' | 'actionable';
    length: 'short' | 'medium' | 'detailed';
    customInstructions: string;
    includeKeyTakeaways: boolean;
    includeFlashcards: boolean;
  };
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'tech-ai',
    title: 'Avances en Redes Neuronales y LLMs',
    category: 'Tecnología',
    icon: 'Cpu',
    text: `Los Modelos de Lenguaje Grande (LLMs) han evolucionado drásticamente desde la introducción de la arquitectura Transformer en 2017. El mecanismo de auto-atención (self-attention) permite que el modelo pondere la relevancia de distintas palabras en una secuencia independientemente de su distancia posicional, superando las limitaciones inherentes de las redes neuronales recurrentes (RNN) y LSTM.

En los últimos años, la técnica de afinamiento por refuerzo a partir de retroalimentación humana (RLHF) ha sido fundamental para alinear las respuestas de los modelos con la intención humana, reduciendo alucinaciones y comportamientos no deseados. Sin embargo, persisten desafíos sustanciales:
1. Consumo energético y costes computacionales durante el entrenamiento y la inferencia.
2. Ventanas de contexto limitadas, aunque modelos recientes alcanzan millones de tokens gracias a técnicas como RoPE y FlashAttention.
3. El problema de la fidelidad factual y razonamiento simbólico exacto, que se aborda actualmente con arquitecturas híbridas, Retrieval-Augmented Generation (RAG) y cadenas de pensamiento (Chain-of-Thought).

Hacia el futuro, la tendencia apunta a modelos multimodales nativos capaces de procesar texto, audio, video y código en un único espacio latente continuo, junto con modelos compactos altamente optimizados para ejecutarse en dispositivos locales (Edge AI).`,
    suggestedOptions: {
      summaryType: 'study',
      length: 'medium',
      customInstructions: 'Destaca la evolución de Transformer a Multimodal y los 3 desafíos clave.',
      includeKeyTakeaways: true,
      includeFlashcards: true,
    }
  },
  {
    id: 'business-quarterly',
    title: 'Estrategia de Crecimiento Q3/Q4',
    category: 'Negocios',
    icon: 'TrendingUp',
    text: `Revisión Ejecutiva de Resultados y Estrategia Comercial Q3/Q4:
En el tercer trimestre, los ingresos recurrentes anuales (ARR) alcanzaron los 14.2M USD, representando un crecimiento interanual del 28%. El costo de adquisición de clientes (CAC) disminuyó un 12% gracias a la optimización de canales orgánicos y al programa de referidos. Sin embargo, la tasa de retención neta (NDR) experimentó una ligera contracción al 104% (frente al 109% del trimestre anterior), atribuible principalmente al segmento de pequeñas y medianas empresas.

Objetivos Prioritarios para Q4:
1. Lanzamiento del nuevo módulo Enterprise con autenticación SSO, auditoría avanzada y SLA del 99.99%.
2. Reestructuración del equipo de Customer Success para implementar revisiones proactivas a cuentas de alto valor, proyectando recuperar el NDR al 112%.
3. Expansión al mercado europeo con cumplimiento GDPR completo para noviembre.
4. Presupuesto asignado para contratación: 6 ingenieros senior y 3 ejecutivos de cuentas en Madrid y Londres.

Riesgos identificados: Dilación en ciclos de cierre corporativos debido a incertidumbre macroeconómica y necesidad de reforzar infraestructura ante el aumento del 40% en tráfico concurrente.`,
    suggestedOptions: {
      summaryType: 'executive',
      length: 'short',
      customInstructions: 'Genera un resumen ejecutivo orientado a directores con métricas y plan de acción de Q4.',
      includeKeyTakeaways: true,
      includeFlashcards: false,
    }
  },
  {
    id: 'health-science',
    title: 'Neurobiología del Sueño y Rendimiento Cognitivo',
    category: 'Ciencia & Salud',
    icon: 'Moon',
    text: `El sueño no es un estado pasivo sino un proceso biológico altamente regulado y vital para la homeostasis cerebral. Durante las fases de sueño no REM (especialmente la fase N3 de ondas lentas), el sistema glinfático incrementa su actividad hasta un 60%, facilitando la eliminación de metabolitos tóxicos acumulados durante la vigilia, incluida la proteína beta-amiloide.

Por otro lado, la fase REM (movimientos oculares rápidos) desempeña un rol insustituible en la consolidación de la memoria emocional, la resolución creativa de problemas y la plasticidad sináptica. La privación crónica de sueño (menos de 7 horas diarias en adultos) se correlaciona con:
- Disminución del 30% en el tiempo de reacción y atención sostenida.
- Elevación de niveles de cortisol y resistencia a la insulina.
- Deterioro en la toma de decisiones complejas en la corteza prefrontal.

Recomendaciones clínicas basadas en evidencia:
1. Mantener un horario regular de descanso incluso en fines de semana para sincronizar el ritmo circadiano.
2. Exposición a luz solar natural durante los primeros 30 minutos tras despertar para fijar la secreción nocturna de melatonina.
3. Evitar pantallas emisoras de luz azul y cafeína al menos 6 horas antes de dormir.
4. Temperatura ambiente fresca en la habitación (entre 18°C y 20°C).`,
    suggestedOptions: {
      summaryType: 'eli5',
      length: 'medium',
      customInstructions: 'Explica los conceptos de forma simple y aplicable para cualquier persona que quiera mejorar su descanso.',
      includeKeyTakeaways: true,
      includeFlashcards: true,
    }
  }
];
