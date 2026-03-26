import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 'cocina',
    title: 'COCINA PROTAGONISTA VS. DISCRETA',
    question: 'Cuando invitas gente a tu casa, tú eres…',
    options: [
      {
        id: 'A',
        text: 'El que cocina y conversa al mismo tiempo',
        profiles: ['Social', 'Visionario Sofisticado'],
        reveals: 'Anfitrión activo, disfruta ser protagonista',
        essentialElement: 'Cocina abierta, isla central, materiales protagonistas, conexión directa con sala/comedor'
      },
      {
        id: 'B',
        text: 'El que acompaña, pero no se mete en la cocina',
        profiles: ['Social', 'Práctico Funcional'],
        reveals: 'Sociable, pero no quiere el caos',
        essentialElement: 'cocina semi-integrada, barras o pasa platos, separaciones sutiles (vidrio, paneles)'
      },
      {
        id: 'C',
        text: 'El que solo aparece cuando está servido',
        profiles: ['Práctico Funcional'],
        reveals: 'Delegación, eficiencia, cero protagonismo',
        essentialElement: 'cocina cerrada o compacta, layout eficiente, poco impacto visual, prioridad en almacenamiento'
      }
    ]
  },
  {
    id: 'orientacion',
    title: 'ORIENTACIÓN + TIPO DE TEMPERATURA',
    question: '¿Cómo te gusta sentir tu casa la mayor parte del tiempo?',
    options: [
      {
        id: 'A',
        text: 'Con luz cálida y temperatura más alta, me gusta cuando entra el sol fuerte y se siente acogedora.',
        profiles: ['Práctico Funcional', 'Sensorial'],
        reveals: 'búsqueda de calidez, hogar acogedor, disfrute del cierre del día',
        essentialElement: 'orientación occidente, sala y terraza protagonistas en la tarde, ventanales amplios, Materiales cálidos (madera)'
      },
      {
        id: 'B',
        text: 'Fresca y luminosa, prefiero cuando entra el sol suave y el ambiente se mantiene más frío.',
        profiles: ['Práctico Funcional', 'Sensorial'], // Vital mapped to Sensorial/Práctico
        reveals: 'energía temprana, confort térmico, claridad mental',
        essentialElement: 'orientación oriente, dormitorios iluminados en la mañana, control solar en fachada occidental, materiales frescos (piedra, tonos claros, lino)'
      },
      {
        id: 'C',
        text: 'Me adapto fácil, no tengo una preferencia clara.',
        profiles: ['Sensorial', 'Visionario Sofisticado'],
        reveals: 'prioriza distribución y funcionalidad sobre clima',
        essentialElement: 'aislamiento eficiente, diseño versátil que permita modular luz y temperatura'
      }
    ]
  },
  {
    id: 'sala',
    title: 'SALA ABIERTA, HÍBRIDA O TIPO LOUNGE/CINE',
    question: 'Cuando llegas a tu casa y entras a la sala, lo que más te provoca es…',
    options: [
      {
        id: 'A',
        text: 'Invitar a amigos, abrir una botella, subir la música y que la conversación se alargue sin mirar la hora.',
        profiles: ['Social', 'Práctico Funcional'],
        reveals: 'energía expansiva, gusto por compartir, necesidad de flujo y conexión',
        essentialElement: 'integración sala–comedor–cocina (concepto abierto), Circulación fluida, sin barreras visuales, terraza conectada o balcón como extensión social. Buena acústica para música'
      },
      {
        id: 'B',
        text: 'Tirarte en el sofá con un libro o un café, en silencio, dejando que el día se desarme solo.',
        profiles: ['Sensorial'],
        reveals: 'Búsqueda de refugio, intimidad emocional',
        essentialElement: 'espacios más contenidos y acogedores, ventanas con vista tranquila, aislamiento acústico'
      },
      {
        id: 'C',
        text: 'Apagar las luces, prender la pantalla y perderte en una historia hasta que el mundo desaparezca.',
        profiles: ['Visionario Sofisticado'],
        reveals: 'Experiencia inmersiva',
        essentialElement: 'muro protagonista para pantalla grande, previsión de sonido envolvente, distribución cerrable (puertas corredizas si es integrada)'
      }
    ]
  },
  {
    id: 'comedor',
    title: 'COMEDOR PROTAGONISTA VS. INTEGRADO',
    question: 'Cuando te sientas a comer con tu familia o amigos, lo que más esperas es…',
    options: [
      {
        id: 'A',
        text: 'Que la comida se enfríe mientras la conversación se calienta y la sobremesa se alarga sin culpa.',
        profiles: ['Social', 'Sensorial'],
        reveals: 'Valora el ritual, valor por el encuentro, la mesa como centro emocional del hogar',
        essentialElement: 'espacio para mesa grande protagonista (6–8 puestos o más), ubicación central y visible, cercanía directa con cocina, espacio amplio para circulación alrededor'
      },
      {
        id: 'B',
        text: 'Compartir, comer rico y seguir con el día sin complicaciones.',
        profiles: ['Práctico Funcional'],
        reveals: 'Uso cotidiano, sin excesos',
        essentialElement: 'comedor integrado, soluciones compactas, cercanía total a cocina, posibilidad de integrarse a sala.'
      },
      {
        id: 'C',
        text: 'Que todo fluya sin formalidades: picar algo, moverte, sentarte donde quieras.',
        profiles: ['Sensorial', 'Visionario Sofisticado'],
        reveals: 'minimalismo, optimización',
        essentialElement: 'Barra o isla como punto principal, espacio para mesa auxiliar o expandible, integración total con cocina y sala'
      }
    ]
  },
  {
    id: 'dormitorio',
    title: 'DORMITORIO + AISLAMIENTO ACÚSTICO',
    question: 'Cuando cierras la puerta de tu cuarto al final del día, lo que más necesitas es…',
    options: [
      {
        id: 'A',
        text: 'Que el mundo se apague y solo quede silencio, calma y oscuridad.',
        profiles: ['Sensorial'],
        reveals: 'valora la calma',
        essentialElement: 'aislamiento acústico, ubicación más aislada del área social, materiales suaves.'
      },
      {
        id: 'B',
        text: 'Despertar con luz entrando y sentir que el día empieza contigo.',
        profiles: ['Práctico Funcional'],
        reveals: 'deseo de recibir energía y orden',
        essentialElement: 'ventanas amplias con luz natural, espacio para estirarse, meditar o hacer ejercicio ligero'
      },
      {
        id: 'C',
        text: 'Tener tu propio universo: música, libros, pantalla y tiempo sin límites.',
        profiles: ['Visionario Sofisticado'],
        reveals: 'deseo de tener vida intensa',
        essentialElement: 'espacio amplio o suficiente para escritorio o rincón creativo, previsión eléctrica y acústica para música/TV.'
      }
    ]
  },
  {
    id: 'baño',
    title: 'BAÑO SPA VS. FUNCIONAL VS. DISEÑO',
    question: 'Por las mañanas, tu momento de baño ideal es ese en el que…',
    options: [
      {
        id: 'A',
        text: 'El agua te ayuda a despertar lento, respirar profundo y empezar el día en calma.',
        profiles: ['Sensorial'],
        reveals: 'Le dan prioridad al auto cuidado',
        essentialElement: 'Materiales naturales y texturas suaves, ducha amplia tipo lluvia o walk-in, espacio para colocar una banca o un mueble de descanso, sensación envolvente (tipo spa)'
      },
      {
        id: 'B',
        text: 'Todo fluye rápido, práctico y sin perder tiempo.',
        profiles: ['Práctico Funcional'],
        reveals: 'Practicidad y afan',
        essentialElement: 'baño compacto, fácil mantenimiento, almacenamiento optimizado, materiales resistentes y fáciles de mantener.'
      },
      {
        id: 'C',
        text: 'Te miras al espejo y sientes que estás en un espacio que te eleva.',
        profiles: ['Visionario Sofisticado'],
        reveals: 'Preferencia por lo estético y visualmente impactante',
        essentialElement: 'materiales premium (gran formato, mármol, grifería destacada), lavamanos protagonista (doble si es posible), integración visual con el dormitorio (concepto suite)'
      }
    ]
  },
  {
    id: 'terraza',
    title: 'TERRAZA SOCIAL VS. CONTEMPLATIVA',
    question: 'Si tuvieras una terraza o balcón, te imaginas ahí…',
    options: [
      {
        id: 'A',
        text: 'Respirando profundo, con un café o una copa en la mano, sin que nadie te pida nada.',
        profiles: ['Sensorial'],
        reveals: 'El exterior es una extensión del bienestar interior. Busca pausa, silencio y contemplación.',
        essentialElement: 'pivacidad visual (pantallas verdes, celosías), vista despejada (cielo, verde, horizonte), orientación tranquila (menos ruido)'
      },
      {
        id: 'B',
        text: 'Con amigos, risas que se escapan hacia la calle y música bajita de fondo.',
        profiles: ['Social'],
        reveals: 'El exterior como escenario social, e disfrute ocurre en grupo, anfitrión activo, valora fluidez interior–exterior.',
        essentialElement: 'Terraza amplia, conexión directa con sala/comedor, espacio para BBQ, mesa o barra. Tomas eléctricas para sonido.'
      },
      {
        id: 'C',
        text: 'Viendo crecer tus plantas, dejando que entre el sol y el aire mientras la vida sigue su curso.',
        profiles: ['Práctico Funcional', 'Sensorial'],
        reveals: 'uso cotidiano, sin rituales excesivos.',
        essentialElement: 'Superficies y piso resistente y fácil de mantener, espacio flexible, buen drenaje, buena exposición solar, area para jardineras o huerta. Espacio para mascotas.'
      }
    ]
  },
  {
    id: 'cuarto_extra',
    title: 'CUARTO EXTRA (CREATIVO, WELLNESS O ESTUDIO)',
    question: 'Si tu casa tuviera un espacio solo para ti, sería ese lugar donde…',
    options: [
      {
        id: 'A',
        text: 'Puedes subir el volumen, crear, pintar, tocar, ver cine y perderte en lo que te apasiona.',
        profiles: ['Visionario Sofisticado'],
        reveals: 'Necesidad de expresión y experiencia. El hogar como laboratorio creativo. Interés cultural / artístico.',
        essentialElement: 'aislamiento acústico, control de luz, conectividad tecnológica. Superficies amplias'
      },
      {
        id: 'B',
        text: 'Respiras profundo, estiras el cuerpo y vuelves a tu centro.',
        profiles: ['Sensorial'],
        reveals: 'autocuidado consciente. El espacio como refugio interno, espiritualidad o bienestar, necesidad de silencio.',
        essentialElement: 'espacio neutro, materiales naturales, luz natural suave, piso cómodo (madera o similar)'
      },
      {
        id: 'C',
        text: 'Te concentras, piensas en grande y le das forma a tus ideas y proyectos.',
        profiles: ['Práctico Funcional'],
        reveals: 'Productividad y foco. El hogar como soporte de la vida profesional, Separación trabajo–descanso',
        essentialElement: 'conectividad, aislamiento visual y acústico, almacenamiento funcional, posibilidad de cerrarse del resto de la casa'
      }
    ]
  },
  {
    id: 'servicio',
    title: 'RELACIÓN CON AREA SERVICIO: VISIBILIDAD Y UBICACIÓN',
    question: 'Cuando piensas en las tareas de lavado ya aseo de la casa, lo ideal para ti sería que…',
    options: [
      {
        id: 'A',
        text: 'Simplemente no se vean ni se escuchen, que todo funcione sin interrumpir tu calma.',
        profiles: ['Práctico Funcional', 'Visionario Sofisticado'],
        reveals: 'control visual, estética limpia, mentalidad premium.',
        essentialElement: 'Lavado oculto, puertas corredizas o panelables, aislamiento acústico, almacenamiento empotrado, que no interfiera con áreas sociales'
      },
      {
        id: 'B',
        text: 'Sean rápidas, ordenadas y sin complicaciones.',
        profiles: ['Práctico Funcional'],
        reveals: 'Prioridad absoluta en el uso real, rutinas claras, bajo interés estético',
        essentialElement: 'Distribución compacta y bien pensada, superficie de apoyo, almacenamiento funcional, fácil acceso desde cocina o zona privada'
      },
      {
        id: 'C',
        text: 'Hagan parte natural del día a día, sin drama ni formalidades.',
        profiles: ['Social', 'Sensorial'],
        reveals: 'naturalidad, vida fluida, cero rigidez doméstica.',
        essentialElement: 'integración visual limpia, posible conexión con balcón o terraza, materiales resistentes pero estéticos. Buena entrada de luz y aire'
      }
    ]
  },
  {
    id: 'almacenamiento',
    title: 'ALMACENAMIENTO',
    question: 'Cuando organizas tu casa, ¿qué pasa con las cosas que no usas todos los días?',
    options: [
      {
        id: 'A',
        text: 'Las dejo visibles porque me gusta tenerlas presentes y que hagan parte del espacio',
        profiles: ['Visionario Sofisticado'], // Expresivo + Emocional mapped to Visionario
        reveals: 'Apego a los objetos, identidad a través del espacio, necesidad de narrar quién soy',
        essentialElement: 'Estanterías abiertas, vitrinas, superficies visibles, objetos como parte activa del diseño'
      },
      {
        id: 'B',
        text: 'Busco guardarlas completamente para mantener todo limpio y despejado',
        profiles: ['Práctico Funcional'],
        reveals: 'Necesidad de orden, control visual, baja tolerancia al ruido visual',
        essentialElement: 'Almacenamiento cerrado, soluciones empotradas, modularidad eficiente, cero distracción'
      },
      {
        id: 'C',
        text: 'Depende: dejo algunas a la vista y otras las guardo según su uso o valor',
        profiles: ['Sensorial'],
        reveals: 'Capacidad de selección, criterio estético sin sacrificar funcionalidad',
        essentialElement: 'Mix de almacenamiento abierto y cerrado, jerarquía visual, objetos con intención'
      }
    ]
  },
  {
    id: 'movilidad',
    title: 'MOVILIDAD / TRANSPORTE',
    question: 'Pensando en tu día a día, ¿qué tan central es el carro en tu forma de moverte?',
    options: [
      {
        id: 'A',
        text: 'Es esencial: lo uso casi siempre y condiciona mis decisiones (parqueo, accesos, etc.)',
        profiles: ['Visionario Sofisticado'],
        reveals: 'Dependencia del vehículo, optimización del tiempo, necesidad de control en desplazamientos',
        essentialElement: 'Parqueaderos amplios, accesos directos, facilidad de entrada/salida, seguridad vehicular'
      },
      {
        id: 'B',
        text: 'Lo uso ocasionalmente, pero no define cómo me muevo',
        profiles: ['Práctico Funcional'],
        reveals: 'Uso híbrido, decisiones según contexto, menor rigidez en hábitos',
        essentialElement: 'Soluciones mixtas: parqueadero funcional pero no protagonista, buena conexión a vías y transporte'
      },
      {
        id: 'C',
        text: 'No es prioritario: prefiero caminar, transporte público, bici u otras opciones',
        profiles: ['Sensorial'],
        reveals: 'Preferencia por caminar, bici o transporte público, valoración del entorno inmediato',
        essentialElement: 'Ubicación estratégica, walkability, acceso a comercio/servicios, espacios para bici'
      }
    ]
  }
];

export const PROFILE_DEFINITIONS: Record<string, any> = {
  'Social': {
    title: 'El Social',
    description: 'Vive el apartamento como un escenario para compartir.',
    identity: 'Piensa en visitas, reuniones y familia. Valora la fluidez más que el objeto.',
    vibe: 'Espacios integrados, cómodos y funcionales.'
  },
  'Sensorial': {
    title: 'El Sensorial',
    description: 'Conecta con sensaciones, calma y bienestar.',
    identity: 'Busca refugio, tranquilidad, equilibrio. Ama el verde, el aire y el silencio.',
    vibe: 'Luz, texturas, materiales naturales.'
  },
  'Práctico Funcional': {
    title: 'El Práctico Funcional',
    description: 'Elegancia silenciosa, orden, proporción, decisiones bien pensadas.',
    identity: 'Prefiere calidad sobre exceso. Busca espacios atemporales.',
    vibe: 'Valora el “lujo que no grita”.'
  },
  'Visionario Sofisticado': {
    title: 'El Visionario Sofisticado',
    description: 'Innovador, curioso, le gusta lo diferente y lo personalizado.',
    identity: 'Abierto a cambios estructurales. Interesado en tecnología, diseño y piezas únicas.',
    vibe: 'Quiere que su apartamento diga algo de él.'
  }
};
