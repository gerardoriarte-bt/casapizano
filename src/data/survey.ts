import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 'hogar',
    title: 'HOGAR',
    question: 'Tu casa ideal es ese lugar donde puedes…',
    options: [
      {
        id: 'A',
        text: 'Tener siempre gente, moverte entre espacios abiertos y compartir sin límites, aunque eso implique menos privacidad',
        profiles: ['Social', 'Visionario Sofisticado'],
        reveals: 'Vida compartida y fluidez por encima del aislamiento',
        essentialElement:
          'Áreas comunes amplias e integradas, cocina abierta, terraza como extensión, circulación fluida',
      },
      {
        id: 'B',
        text: 'Desconectarte del mundo y tener silencio real, un refugio solo para ti y los tuyos',
        profiles: ['Sensorial'],
        reveals: 'Prioridad en calma, contención y privacidad',
        essentialElement: 'Separación clara entre zonas, control de luz y sonido, espacios contenidos',
      },
      {
        id: 'C',
        text: 'Tener espacios integrados para compartir, pero con la posibilidad de cerrarlos y mantener privacidad cuando lo necesites',
        profiles: ['Práctico Funcional', 'Social'],
        reveals: 'Equilibrio entre convivencia y zonas cerrables',
        essentialElement:
          'Espacios integrados con posibilidad de cierre (puertas corredizas, paneles), zonificación adaptable',
      },
    ],
  },
  {
    id: 'orientacion',
    title: 'ORIENTACIÓN',
    question: 'En tu rutina diaria, tú eres más…',
    options: [
      {
        id: 'A',
        text: 'De los que disfrutan empezar el día temprano, con energía desde la mañana',
        profiles: ['Práctico Funcional', 'Sensorial'],
        reveals: 'Ritmo matutino y luz suave al despertar',
        essentialElement:
          'Orientación oriente, entrada de luz suave en la mañana, vistas hacia el amanecer',
      },
      {
        id: 'B',
        text: 'De los que duermen hasta el mediodía y se activan más en la tarde o noche',
        profiles: ['Sensorial', 'Práctico Funcional'],
        reveals: 'Preferencia por la tarde-noche y ambientes más contenidos de día',
        essentialElement:
          'Orientación occidente, vistas abiertas a la ciudad, protagonismo de luces nocturnas',
      },
      {
        id: 'C',
        text: 'Flexible, no tienes un momento del día que defina tu rutina',
        profiles: ['Sensorial', 'Visionario Sofisticado'],
        reveals: 'Adaptabilidad frente a horarios y climas',
        essentialElement: 'Diseño versátil: cualquier orientación puede funcionar con buen diseño',
      },
    ],
  },
  {
    id: 'iluminacion',
    title: 'ILUMINACIÓN',
    question: 'En tu día a día, ¿cómo te gusta que se sienta la luz en tu casa?',
    options: [
      {
        id: 'A',
        text: 'Me gusta que la luz natural sea protagonista, que los espacios cambien con el día y con el sol la mayor parte del tiempo',
        profiles: ['Sensorial', 'Visionario Sofisticado'],
        reveals: 'Luz natural como eje de la experiencia del hogar',
        essentialElement:
          'Ventanales amplios, orientación estratégica, entrada de luz directa e indirecta',
      },
      {
        id: 'B',
        text: 'Prefiero controlar la luz, ajustar intensidad y ambiente según el momento, sin depender tanto de la luz natural',
        profiles: ['Práctico Funcional', 'Visionario Sofisticado'],
        reveals: 'Control fino del ambiente lumínico',
        essentialElement:
          'Iluminación artificial por capas, escenas de luz, control de intensidad',
      },
      {
        id: 'C',
        text: 'Me adapto a cualquiera: mientras el espacio esté bien iluminado, no tengo una preferencia clara',
        profiles: ['Sensorial', 'Práctico Funcional'],
        reveals: 'Flexibilidad entre luz natural y artificial',
        essentialElement: 'Combinación de luz natural y artificial, soluciones versátiles',
      },
    ],
  },
  {
    id: 'cocina',
    title: 'COCINA',
    question: 'Cuando invitas gente a tu casa, ¿cómo te gusta que sea tu cocina?',
    options: [
      {
        id: 'A',
        text: 'Grande y abierta para cocinar y conversar al mismo tiempo',
        profiles: ['Social', 'Visionario Sofisticado'],
        reveals: 'Cocina como escenario social',
        essentialElement:
          'Cocina abierta, isla central, materiales protagonistas, conexión directa con sala/comedor',
      },
      {
        id: 'B',
        text: 'Semi-integrada que permita acompañar sin estar completamente dentro',
        profiles: ['Social', 'Práctico Funcional'],
        reveals: 'Equilibrio entre convivencia y contención',
        essentialElement:
          'Cocina semi-integrada, barras o pasa platos, separaciones sutiles (vidrio, paneles)',
      },
      {
        id: 'C',
        text: 'Compacta, donde todo funcione sin complicaciones',
        profiles: ['Práctico Funcional'],
        reveals: 'Eficiencia y poco protagonismo visual',
        essentialElement:
          'Cocina cerrada o compacta, layout eficiente, poco impacto visual, prioridad en almacenamiento',
      },
    ],
  },
  {
    id: 'sala',
    title: 'SALA',
    question: 'Cuando llegas a casa, ¿cómo te gusta que funcionen tus espacios sociales?',
    options: [
      {
        id: 'A',
        text: 'Que todo esté conectado: sala, comedor y cocina como un solo espacio para compartir sin barreras',
        profiles: ['Social', 'Visionario Sofisticado'],
        reveals: 'Integración total de zonas sociales',
        essentialElement:
          'Integración total sala–comedor–cocina, circulación continua, conexión directa con terraza o balcón',
      },
      {
        id: 'B',
        text: 'Que esté integrada, pero con la posibilidad de cerrarse cuando necesito privacidad o controlar el ambiente',
        profiles: ['Social', 'Práctico Funcional'],
        reveals: 'Integración con opción de aislar',
        essentialElement:
          'Puertas corredizas, paneles móviles, posibilidad de aislar sin perder integración',
      },
      {
        id: 'C',
        text: 'Que sea independiente, y que la vida social ocurra más hacia la terraza u otros espacios',
        profiles: ['Sensorial', 'Práctico Funcional'],
        reveals: 'Sala contenida y vida social hacia el exterior u otras zonas',
        essentialElement:
          'Sala definida y separada, terraza como protagonista social, distribución más contenida',
      },
    ],
  },
  {
    id: 'comedor',
    title: 'COMEDOR',
    question: 'En tu día a día, ¿cómo usas realmente el comedor en tu casa?',
    options: [
      {
        id: 'A',
        text: 'Lo reservo para momentos especiales o íntimos; en el día a día uso más la mesa auxiliar de la cocina',
        profiles: ['Sensorial', 'Visionario Sofisticado'],
        reveals: 'Comedor ritual, día a día en barra o auxiliar',
        essentialElement:
          'Espacio más contenido, ambiente íntimo, apoyo en barra o isla para el día a día',
      },
      {
        id: 'B',
        text: 'Lo uso siempre, en todas las comidas; es el centro donde nos reunimos y nos conectamos como familia',
        profiles: ['Social', 'Sensorial'],
        reveals: 'La mesa como corazón del hogar',
        essentialElement: 'Comedor full integrado, amplitud, conexión con cocina y/o sala',
      },
      {
        id: 'C',
        text: 'Lo usamos solo para cenar y ya; un espacio práctico, sin mucho protagonismo',
        profiles: ['Práctico Funcional'],
        reveals: 'Uso acotado y eficiente',
        essentialElement: 'Comedor eficiente, sin protagonismo, optimización del espacio',
      },
    ],
  },
  {
    id: 'dormitorio',
    title: 'DORMITORIO',
    question: 'En tu día a día, ¿cómo te gusta que funcione tu cuarto dentro de la casa?',
    options: [
      {
        id: 'A',
        text: 'Como un espacio completamente privado, silencioso y aislado, donde no entra nada del resto de la casa',
        profiles: ['Sensorial'],
        reveals: 'Máximo refugio y aislamiento',
        essentialElement:
          'Aislamiento acústico, ubicación apartada, sin pantallas ni distracciones, control total de luz',
      },
      {
        id: 'B',
        text: 'Como un espacio privado, pero con lugar para ti: un escritorio, un rincón de lectura, meditación o lo que más disfrutes',
        profiles: ['Práctico Funcional', 'Sensorial'],
        reveals: 'Privacidad con rincón personal funcional',
        essentialElement:
          'Espacio suficiente para escritorio o rincón personal, buena luz natural, zonificación dentro del cuarto',
      },
      {
        id: 'C',
        text: 'Como un espacio más abierto, donde también se puede compartir y disfrutar, incluso como el mejor lugar para ver películas',
        profiles: ['Visionario Sofisticado', 'Social'],
        reveals: 'Dormitorio multifunción y experiencia compartida',
        essentialElement:
          'Espacio amplio, posibilidad de integrar tecnología (home theatre), flexibilidad de uso',
      },
    ],
  },
  {
    id: 'bano',
    title: 'BAÑO',
    question: 'En tu rutina diaria, ¿cómo te gusta que sea tu momento de baño?',
    options: [
      {
        id: 'A',
        text: 'Como un espacio tipo spa, amplio y tranquilo, donde puedas bajar el ritmo y desconectarte',
        profiles: ['Sensorial'],
        reveals: 'Baño como ritual de desconexión',
        essentialElement:
          'Ducha amplia tipo lluvia, tina o jacuzzi o walk-in, materiales naturales, entrada de luz natural, sensación envolvente',
      },
      {
        id: 'B',
        text: 'Rápido y funcional, donde todo fluya sin perder tiempo y enfocado en lo práctico',
        profiles: ['Práctico Funcional'],
        reveals: 'Practicidad y rapidez',
        essentialElement:
          'Baño compacto, fácil mantenimiento, almacenamiento optimizado, luz artificial funcional',
      },
      {
        id: 'C',
        text: 'Un punto medio: un baño cómodo y amplio pero sin necesidad de ser un spa ni tampoco algo totalmente básico',
        profiles: ['Sensorial', 'Práctico Funcional'],
        reveals: 'Confort sin exceso ni minimalismo extremo',
        essentialElement:
          'Baño amplio y cómodo, buena distribución, combinación de luz natural y artificial, sin sobre-diseño',
      },
    ],
  },
  {
    id: 'terraza',
    title: 'TERRAZA SOCIAL',
    question: 'Si tuvieras una terraza o balcón, te imaginas ahí…',
    options: [
      {
        id: 'A',
        text: 'Respirando profundo, con un café o una copa en la mano, sin que nadie te pida nada',
        profiles: ['Sensorial'],
        reveals: 'Terraza como pausa y contemplación',
        essentialElement:
          'Privacidad visual (pantallas verdes, celosías), vista despejada (cielo, verde, horizonte), orientación tranquila (menos ruido)',
      },
      {
        id: 'B',
        text: 'Con amigos, risas que se escapan hacia la calle y música bajita de fondo',
        profiles: ['Social'],
        reveals: 'Terraza como extensión social del hogar',
        essentialElement:
          'Terraza amplia, conexión directa con sala/comedor, espacio para BBQ, mesa o barra. Tomas eléctricas para sonido',
      },
      {
        id: 'C',
        text: 'Viendo crecer tus plantas, dejando que entre el sol y el aire mientras la vida sigue su curso',
        profiles: ['Práctico Funcional', 'Sensorial'],
        reveals: 'Uso cotidiano, naturaleza y mantenimiento razonable',
        essentialElement:
          'Superficies y piso resistente y fácil de mantener, espacio flexible, buen drenaje, buena exposición solar, área para jardineras o huerta. Espacio para mascotas',
      },
    ],
  },
  {
    id: 'cuarto_extra',
    title: 'CUARTO EXTRA',
    question: 'Si tu casa tuviera un espacio adicional, ¿cómo lo usarías en tu día a día?',
    options: [
      {
        id: 'A',
        text: 'Lo usaría como bodega: siempre hay cosas que no sabes dónde guardar y prefiero tener un espacio dedicado para eso',
        profiles: ['Práctico Funcional'],
        reveals: 'Prioridad al almacenamiento ordenado',
        essentialElement:
          'Almacenamiento eficiente, muebles modulares, buena organización, fácil acceso',
      },
      {
        id: 'B',
        text: 'Lo usaría para mí: un lugar para mis hobbies o los de mis hijos, pintar, hacer ejercicio o un cuarto de juegos',
        profiles: ['Visionario Sofisticado', 'Social'],
        reveals: 'Espacio para creatividad, juego o movimiento',
        essentialElement:
          'Espacio flexible, buena luz (idealmente natural), superficies amplias, posibilidad de adaptarse a diferentes actividades',
      },
      {
        id: 'C',
        text: 'Lo usaría como oficina: hoy es clave tener un espacio de trabajo separado del cuarto y de las zonas sociales',
        profiles: ['Práctico Funcional', 'Visionario Sofisticado'],
        reveals: 'Trabajo en casa con fronteras claras',
        essentialElement:
          'Aislamiento acústico, conectividad, ergonomía, posibilidad de cerrarse del resto de la casa',
      },
    ],
  },
  {
    id: 'lavanderia',
    title: 'ÁREA DE LAVANDERÍA',
    question: 'En tu casa, ¿cómo prefieres que se integre el área de lavandería con los demás espacios?',
    options: [
      {
        id: 'A',
        text: 'Integrada donde haga parte natural del día a día',
        profiles: ['Social', 'Sensorial'],
        reveals: 'Lavandería visible y fluida en la rutina',
        essentialElement:
          'Integración visual, buena luz natural, ventilación, materiales resistentes pero estéticos',
      },
      {
        id: 'B',
        text: 'Cerrada, que no se vea, con buen espacio de almacenamiento y todo oculto',
        profiles: ['Práctico Funcional', 'Visionario Sofisticado'],
        reveals: 'Lavandería oculta y orden visual',
        essentialElement:
          'Espacio independiente, puertas (corredizas o panelables), buen almacenamiento, aislamiento acústico',
      },
      {
        id: 'C',
        text: 'Semi-integrada, con alguna separación, pero sin problema de que se vea',
        profiles: ['Práctico Funcional', 'Social'],
        reveals: 'Equilibrio entre integración y separación',
        essentialElement:
          'Separaciones sutiles (vidrio, celosías, paneles), conexión con cocina o zona privada, ventilación e iluminación adecuadas',
      },
    ],
  },
  {
    id: 'almacenamiento',
    title: 'ALMACENAMIENTO',
    question: 'Cuando organizas tu casa, ¿qué pasa con las cosas que no usas todos los días?',
    options: [
      {
        id: 'A',
        text: 'Las dejo visibles porque me gusta tenerlas presentes y que hagan parte del espacio',
        profiles: ['Visionario Sofisticado'],
        reveals: 'Objetos como parte del relato del hogar',
        essentialElement:
          'Estanterías abiertas, vitrinas, superficies visibles, objetos como parte activa del diseño',
      },
      {
        id: 'B',
        text: 'Busco guardarlas completamente para mantener todo limpio y despejado',
        profiles: ['Práctico Funcional'],
        reveals: 'Orden visual y superficies libres',
        essentialElement:
          'Almacenamiento cerrado, soluciones empotradas, modularidad eficiente, cero distracción',
      },
      {
        id: 'C',
        text: 'Depende: dejo algunas a la vista y otras las guardo según su uso o valor',
        profiles: ['Sensorial'],
        reveals: 'Criterio mixto entre exhibición y resguardo',
        essentialElement: 'Mix de almacenamiento abierto y cerrado, jerarquía visual, objetos con intención',
      },
    ],
  },
  {
    id: 'movilidad',
    title: 'MOVILIDAD',
    question: 'Pensando en tu día a día, ¿qué tan central es el carro en tu forma de moverte?',
    options: [
      {
        id: 'A',
        text: 'Es esencial: lo uso siempre y condiciona mis decisiones (parqueo, accesos, etc.)',
        profiles: ['Visionario Sofisticado'],
        reveals: 'Vehículo como eje de ubicación y accesos',
        essentialElement:
          'Parqueaderos amplios, accesos directos, facilidad de entrada/salida, seguridad vehicular',
      },
      {
        id: 'B',
        text: 'Lo uso ocasionalmente, solo los fines de semana',
        profiles: ['Práctico Funcional'],
        reveals: 'Uso mixto del carro según contexto',
        essentialElement:
          'Soluciones mixtas: parqueadero funcional pero no protagonista, buena conexión a vías y transporte',
      },
      {
        id: 'C',
        text: 'No es prioritario: prefiero caminar, transporte público, bici u otras opciones',
        profiles: ['Sensorial'],
        reveals: 'Movilidad activa y entorno caminable',
        essentialElement:
          'Ubicación estratégica, walkability, acceso a comercio/servicios, espacios para bici',
      },
    ],
  },
];

export const PROFILE_DEFINITIONS: Record<string, any> = {
  Social: {
    title: 'El Social',
    description: 'Vive el apartamento como un escenario para compartir.',
    identity: 'Piensa en visitas, reuniones y familia. Valora la fluidez más que el objeto.',
    vibe: 'Espacios integrados, cómodos y funcionales.',
  },
  Sensorial: {
    title: 'El Sensorial',
    description: 'Conecta con sensaciones, calma y bienestar.',
    identity: 'Busca refugio, tranquilidad, equilibrio. Ama el verde, el aire y el silencio.',
    vibe: 'Luz, texturas, materiales naturales.',
  },
  'Práctico Funcional': {
    title: 'El Práctico Funcional',
    description: 'Elegancia silenciosa, orden, proporción, decisiones bien pensadas.',
    identity: 'Prefiere calidad sobre exceso. Busca espacios atemporales.',
    vibe: 'Valora el “lujo que no grita”.',
  },
  'Visionario Sofisticado': {
    title: 'El Visionario Sofisticado',
    description: 'Innovador, curioso, le gusta lo diferente y lo personalizado.',
    identity: 'Abierto a cambios estructurales. Interesado en tecnología, diseño y piezas únicas.',
    vibe: 'Quiere que su apartamento diga algo de él.',
  },
};
