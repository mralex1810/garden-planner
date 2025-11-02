import { Plant } from './database'
import { db } from './database'

// Stardew Valley Pack
export const stardewValleyPlants: Plant[] = [
  // Весенние овощи (bed)
  { id: 'stardew-green-bean', name: 'Green Bean', nameRu: 'Зелень', emoji: '🌿', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-potato', name: 'Potato', nameRu: 'Картофель', emoji: '🥔', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-cauliflower', name: 'Cauliflower', nameRu: 'Капуста', emoji: '🥬', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-kale', name: 'Kale', nameRu: 'Кольраби', emoji: '🥬', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-parsnip', name: 'Parsnip', nameRu: 'Пастернак', emoji: '🥕', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-leek', name: 'Leek', nameRu: 'Зелень', emoji: '🌿', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  
  // Летние овощи (bed)
  { id: 'stardew-eggplant', name: 'Eggplant', nameRu: 'Баклажан', emoji: '🍆', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-blueberry', name: 'Blueberry', nameRu: 'Голубая ягода', emoji: '🔵', category: 'berry', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-hot-pepper', name: 'Hot Pepper', nameRu: 'Перец', emoji: '🌶️', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-tomato', name: 'Tomato', nameRu: 'Помидор', emoji: '🍅', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-radish', name: 'Radish', nameRu: 'Редис', emoji: '🔴', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-beet', name: 'Beet', nameRu: 'Свёкла', emoji: '🍠', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-summer-spangle', name: 'Summer Spangle', nameRu: 'Спаржа', emoji: '🌺', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  
  // Осенние овощи (bed)
  { id: 'stardew-artichoke', name: 'Artichoke', nameRu: 'Артишок', emoji: '🟢', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'autumn' },
  { id: 'stardew-bok-choy', name: 'Bok Choy', nameRu: 'Бок-чой', emoji: '🥬', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'autumn' },
  { id: 'stardew-yam', name: 'Yam', nameRu: 'Ямс', emoji: '🍠', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'autumn' },
  { id: 'stardew-amaranth', name: 'Amaranth', nameRu: 'Капуста', emoji: '🥬', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'autumn' },
  { id: 'stardew-wheat', name: 'Wheat', nameRu: 'Пшеница', emoji: '🌾', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer,autumn' },
  { id: 'stardew-pumpkin', name: 'Pumpkin', nameRu: 'Тыква', emoji: '🎃', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'autumn' },
  
  // Круглогодичные овощи
  { id: 'stardew-corn', name: 'Corn', nameRu: 'Кукуруза', emoji: '🌽', category: 'vegetable', growthType: 'bed', pack: 'stardew_valley', season: 'summer,autumn' },
  
  // Специальные фрукты и культуры
  { id: 'stardew-ancient-fruit', name: 'Ancient Fruit', nameRu: 'Древний фрукт', emoji: '🍇', category: 'fruit', growthType: 'bed', pack: 'stardew_valley', season: 'all' },
  { id: 'stardew-starfruit', name: 'Starfruit', nameRu: 'Звездный фрукт', emoji: '⭐', category: 'fruit', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-pineapple', name: 'Pineapple', nameRu: 'Ананас', emoji: '🍍', category: 'fruit', growthType: 'bed', pack: 'stardew_valley', season: 'all' },
  
  // Ягоды
  { id: 'stardew-strawberry', name: 'Strawberry', nameRu: 'Клубника', emoji: '🍓', category: 'berry', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-hops', name: 'Hops', nameRu: 'Малина', emoji: '🌿', category: 'berry', growthType: 'bush', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-cranberries', name: 'Cranberries', nameRu: 'Клюква', emoji: '🫐', category: 'berry', growthType: 'bed', pack: 'stardew_valley', season: 'autumn' },
  { id: 'stardew-blackberry', name: 'Blackberry', nameRu: 'Ежевика', emoji: '🫐', category: 'berry', growthType: 'bush', pack: 'stardew_valley', season: 'autumn' },
  
  // Фруктовые деревья (bush)
  { id: 'stardew-apple-tree', name: 'Apple Tree', nameRu: 'Яблоня', emoji: '🍎', category: 'fruit', growthType: 'bush', pack: 'stardew_valley', season: 'autumn' },
  { id: 'stardew-orange-tree', name: 'Orange Tree', nameRu: 'Апельсин', emoji: '🍊', category: 'fruit', growthType: 'bush', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-peach-tree', name: 'Peach Tree', nameRu: 'Персик', emoji: '🍑', category: 'fruit', growthType: 'bush', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-pomegranate-tree', name: 'Pomegranate Tree', nameRu: 'Гранат', emoji: '🍇', category: 'fruit', growthType: 'bush', pack: 'stardew_valley', season: 'autumn' },
  { id: 'stardew-cherry-tree', name: 'Cherry Tree', nameRu: 'Вишня', emoji: '🍒', category: 'fruit', growthType: 'bush', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-banana-tree', name: 'Banana Tree', nameRu: 'Банановая пальма', emoji: '🍌', category: 'fruit', growthType: 'bush', pack: 'stardew_valley', season: 'all' },
  { id: 'stardew-mango-tree', name: 'Mango Tree', nameRu: 'Манго', emoji: '🥭', category: 'fruit', growthType: 'bush', pack: 'stardew_valley', season: 'summer' },
  
  // Цветы
  { id: 'stardew-tulip', name: 'Tulip', nameRu: 'Тюльпан', emoji: '🌷', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-jazz', name: 'Jazz', nameRu: 'Джасмин', emoji: '🌸', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-blue-jazz', name: 'Blue Jazz', nameRu: 'Голубая джаз', emoji: '🌸', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-crocus', name: 'Crocus', nameRu: 'Крокус', emoji: '💐', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'spring' },
  { id: 'stardew-sunflower', name: 'Sunflower', nameRu: 'Подсолнух', emoji: '🌻', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-poppy', name: 'Poppy', nameRu: 'Поппи', emoji: '🌸', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-lavender', name: 'Lavender', nameRu: 'Лаванда', emoji: '💜', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'summer' },
  { id: 'stardew-fairy-rose', name: 'Fairy Rose', nameRu: 'Космос', emoji: '🌸', category: 'flower', growthType: 'bed', pack: 'stardew_valley', season: 'autumn' },
]

// Кировская область Pack
export const kirovOblastPlants: Plant[] = [
  // Фруктовые деревья (bush)
  { 
    id: 'kirov-apple', 
    name: 'Apple Tree', 
    nameRu: 'Яблоня', 
    emoji: '🍎', 
    category: 'fruit', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5, 9, 10], // апрель-май, сентябрь-октябрь
    goodNeighbors: ['kirov-pear', 'kirov-plum'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-pear', 
    name: 'Pear Tree', 
    nameRu: 'Груша', 
    emoji: '🍐', 
    category: 'fruit', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'autumn',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: ['kirov-apple', 'kirov-plum'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-plum', 
    name: 'Plum Tree', 
    nameRu: 'Слива', 
    emoji: '🍑', 
    category: 'fruit', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: ['kirov-apple', 'kirov-pear'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-rowan', 
    name: 'Rowan', 
    nameRu: 'Рябина обыкновенная', 
    emoji: '🌺', 
    category: 'fruit', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'autumn',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-viburnum', 
    name: 'Viburnum', 
    nameRu: 'Калина обыкновенная', 
    emoji: '🌺', 
    category: 'fruit', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'autumn',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  
  // Ягодные кустарники (bush)
  { 
    id: 'kirov-blackcurrant', 
    name: 'Blackcurrant', 
    nameRu: 'Смородина черная', 
    emoji: '🫐', 
    category: 'berry', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: ['kirov-gooseberry'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-gooseberry', 
    name: 'Gooseberry', 
    nameRu: 'Крыжовник', 
    emoji: '🟢', 
    category: 'berry', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: ['kirov-blackcurrant'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-raspberry', 
    name: 'Raspberry', 
    nameRu: 'Малина', 
    emoji: '🫐', 
    category: 'berry', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-honeysuckle', 
    name: 'Honeysuckle', 
    nameRu: 'Жимолость', 
    emoji: '🫐', 
    category: 'berry', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'spring',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-sea-buckthorn', 
    name: 'Sea Buckthorn', 
    nameRu: 'Облепиха', 
    emoji: '🟠', 
    category: 'berry', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5],
    goodNeighbors: [],
    incompatibleWith: ['kirov-potato', 'kirov-tomato', 'kirov-eggplant', 'kirov-pepper']
  },
  { 
    id: 'kirov-highbush-blueberry', 
    name: 'Highbush Blueberry', 
    nameRu: 'Голубика высокорослая', 
    emoji: '🫐', 
    category: 'berry', 
    growthType: 'bush', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5, 9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-strawberry', 
    name: 'Strawberry', 
    nameRu: 'Земляника садовая', 
    emoji: '🍓', 
    category: 'berry', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 9],
    goodNeighbors: ['kirov-garlic', 'kirov-onion', 'kirov-spinach'],
    incompatibleWith: ['kirov-cabbage', 'kirov-potato']
  },
  
  // Овощи (bed)
  { 
    id: 'kirov-potato', 
    name: 'Potato', 
    nameRu: 'Картофель', 
    emoji: '🥔', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5], // конец апреля - начало мая
    goodNeighbors: ['kirov-beans', 'kirov-cabbage'],
    incompatibleWith: ['kirov-tomato', 'kirov-eggplant', 'kirov-strawberry']
  },
  { 
    id: 'kirov-carrot', 
    name: 'Carrot', 
    nameRu: 'Морковь', 
    emoji: '🥕', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5], // конец апреля - начало мая
    goodNeighbors: ['kirov-onion', 'kirov-garlic', 'kirov-beet'],
    incompatibleWith: ['kirov-dill']
  },
  { 
    id: 'kirov-onion', 
    name: 'Onion', 
    nameRu: 'Лук репчатый', 
    emoji: '🧅', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 10, 11], // апрель-май, октябрь-ноябрь под зиму
    goodNeighbors: ['kirov-carrot', 'kirov-beet', 'kirov-tomato'],
    incompatibleWith: ['kirov-peas', 'kirov-beans']
  },
  { 
    id: 'kirov-cabbage', 
    name: 'Cabbage', 
    nameRu: 'Капуста белокочанная', 
    emoji: '🥬', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [5], // май (рассадой)
    goodNeighbors: ['kirov-dill'],
    incompatibleWith: ['kirov-tomato', 'kirov-strawberry']
  },
  { 
    id: 'kirov-beet', 
    name: 'Beet', 
    nameRu: 'Свекла', 
    emoji: '🍠', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5], // конец апреля - начало мая
    goodNeighbors: ['kirov-onion', 'kirov-carrot'],
    incompatibleWith: ['kirov-beans']
  },
  { 
    id: 'kirov-tomato', 
    name: 'Tomato', 
    nameRu: 'Томаты', 
    emoji: '🍅', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [5], // май (после угрозы заморозков)
    goodNeighbors: ['kirov-basil', 'kirov-garlic', 'kirov-onion'],
    incompatibleWith: ['kirov-potato', 'kirov-eggplant', 'kirov-cabbage']
  },
  { 
    id: 'kirov-cucumber', 
    name: 'Cucumber', 
    nameRu: 'Огурцы', 
    emoji: '🥒', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [5, 6], // май-июнь
    goodNeighbors: ['kirov-beans', 'kirov-dill'],
    incompatibleWith: ['kirov-potato']
  },
  
  // Зелень (bed)
  { 
    id: 'kirov-dill', 
    name: 'Dill', 
    nameRu: 'Укроп', 
    emoji: '🌱', 
    category: 'herb', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 6, 7, 8], // многократные посевы
    goodNeighbors: ['kirov-cabbage', 'kirov-cucumber'],
    incompatibleWith: ['kirov-carrot']
  },
  { 
    id: 'kirov-parsley', 
    name: 'Parsley', 
    nameRu: 'Петрушка', 
    emoji: '🌿', 
    category: 'herb', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'all',
    plantingMonths: [4, 10], // ранней весной или под зиму
    goodNeighbors: ['kirov-tomato'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-garlic', 
    name: 'Garlic', 
    nameRu: 'Чеснок', 
    emoji: '🧄', 
    category: 'herb', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [9, 10, 4], // сентябрь-октябрь под зиму оптимально, или апрель
    goodNeighbors: ['kirov-tomato', 'kirov-strawberry'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-basil', 
    name: 'Basil', 
    nameRu: 'Базилик', 
    emoji: '🌿', 
    category: 'herb', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [5],
    goodNeighbors: ['kirov-tomato'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-spinach', 
    name: 'Spinach', 
    nameRu: 'Шпинат', 
    emoji: '🥗', 
    category: 'herb', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring,autumn',
    plantingMonths: [4, 8], // ранней весной или в августе
    goodNeighbors: ['kirov-strawberry', 'kirov-tomato'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-lettuce', 
    name: 'Lettuce', 
    nameRu: 'Салат листовой', 
    emoji: '🥬', 
    category: 'herb', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring,summer',
    plantingMonths: [4, 5, 6, 7, 8], // многократные посевы
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-sorrel', 
    name: 'Sorrel', 
    nameRu: 'Щавель', 
    emoji: '🍃', 
    category: 'herb', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'all',
    plantingMonths: [4, 10], // ранней весной или под зиму
    goodNeighbors: [],
    incompatibleWith: []
  },
  
  // Бобовые
  { 
    id: 'kirov-beans', 
    name: 'Beans', 
    nameRu: 'Фасоль', 
    emoji: '🫘', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [5, 6],
    goodNeighbors: ['kirov-potato', 'kirov-cucumber'],
    incompatibleWith: ['kirov-onion', 'kirov-garlic', 'kirov-beet']
  },
  { 
    id: 'kirov-peas', 
    name: 'Peas', 
    nameRu: 'Горох', 
    emoji: '🫛', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5],
    goodNeighbors: ['kirov-cucumber'],
    incompatibleWith: ['kirov-onion', 'kirov-garlic']
  },
  { 
    id: 'kirov-eggplant', 
    name: 'Eggplant', 
    nameRu: 'Баклажан', 
    emoji: '🍆', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [5, 6], // конец мая - начало июня (теплолюбивые)
    goodNeighbors: ['kirov-pepper'],
    incompatibleWith: ['kirov-potato', 'kirov-tomato']
  },
  { 
    id: 'kirov-pepper', 
    name: 'Pepper', 
    nameRu: 'Перец', 
    emoji: '🌶️', 
    category: 'vegetable', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [5, 6],
    goodNeighbors: ['kirov-eggplant'],
    incompatibleWith: ['kirov-potato', 'kirov-tomato']
  },
  
  // Однолетние цветы
  { 
    id: 'kirov-marigolds', 
    name: 'Marigolds', 
    nameRu: 'Бархатцы', 
    emoji: '🌼', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [3, 4, 5, 6], // март-апрель рассада, май-июнь высадка
    goodNeighbors: ['kirov-tomato', 'kirov-cabbage', 'kirov-pepper'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-nasturtium', 
    name: 'Nasturtium', 
    nameRu: 'Настурция', 
    emoji: '🌸', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [5],
    goodNeighbors: ['kirov-cabbage'],
    incompatibleWith: []
  },
  { 
    id: 'kirov-pansies', 
    name: 'Pansies', 
    nameRu: 'Анютины глазки', 
    emoji: '💐', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring,autumn',
    plantingMonths: [2, 3, 5, 6, 7], // февраль-март рассада для весеннего цветения, июнь-июль для осеннего
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-petunia', 
    name: 'Petunia', 
    nameRu: 'Петуния', 
    emoji: '🌺', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [2, 3, 5, 6], // февраль-март рассада, май-июнь высадка
    goodNeighbors: [],
    incompatibleWith: []
  },
  
  // Многолетние цветы
  { 
    id: 'kirov-peonies', 
    name: 'Peonies', 
    nameRu: 'Пионы', 
    emoji: '🌸', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring,summer',
    plantingMonths: [8, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-lilies', 
    name: 'Lilies', 
    nameRu: 'Лилии', 
    emoji: '🌺', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-phlox', 
    name: 'Phlox', 
    nameRu: 'Флоксы', 
    emoji: '🌸', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-irises', 
    name: 'Irises', 
    nameRu: 'Ирисы', 
    emoji: '🌺', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring,summer',
    plantingMonths: [7, 8, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-astilbe', 
    name: 'Astilbe', 
    nameRu: 'Астильбы', 
    emoji: '🌸', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-hostas', 
    name: 'Hostas', 
    nameRu: 'Хосты', 
    emoji: '🌿', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 8, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-chrysanthemums', 
    name: 'Chrysanthemums', 
    nameRu: 'Хризантемы', 
    emoji: '🌼', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'autumn',
    plantingMonths: [5, 6],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-asters', 
    name: 'Asters', 
    nameRu: 'Астры', 
    emoji: '🌸', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'autumn',
    plantingMonths: [4, 5, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-delphiniums', 
    name: 'Delphiniums', 
    nameRu: 'Дельфиниумы', 
    emoji: '🔵', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-daylilies', 
    name: 'Daylilies', 
    nameRu: 'Лилейники', 
    emoji: '🌺', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer',
    plantingMonths: [4, 5, 8, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-echinacea', 
    name: 'Echinacea', 
    nameRu: 'Эхинацея', 
    emoji: '🌸', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'summer,autumn',
    plantingMonths: [4, 5, 9],
    goodNeighbors: [],
    incompatibleWith: []
  },
  
  // Луковичные цветы
  { 
    id: 'kirov-tulips', 
    name: 'Tulips', 
    nameRu: 'Тюльпаны', 
    emoji: '🌷', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring',
    plantingMonths: [9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-narcissus', 
    name: 'Narcissus', 
    nameRu: 'Нарциссы', 
    emoji: '🌼', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring',
    plantingMonths: [9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
  { 
    id: 'kirov-hyacinthus', 
    name: 'Hyacinthus', 
    nameRu: 'Гиацинты', 
    emoji: '💜', 
    category: 'flower', 
    growthType: 'bed', 
    pack: 'kirov_oblast', 
    season: 'spring',
    plantingMonths: [9, 10],
    goodNeighbors: [],
    incompatibleWith: []
  },
]

export async function initializePack(packName: 'stardew_valley' | 'kirov_oblast'): Promise<void> {
  const plants = packName === 'stardew_valley' ? stardewValleyPlants : kirovOblastPlants
  
  // Проверяем, есть ли уже растения этого пака
  const existingPlants = await db.plants.where('pack').equals(packName).toArray()
  
  if (existingPlants.length === plants.length) {
    // Пак уже полностью загружен
    return
  }
  
  // Добавляем только те растения, которых еще нет в базе
  for (const plant of plants) {
    const existing = await db.plants.get(plant.id)
    if (!existing) {
      try {
        await db.plants.add(plant)
      } catch (error) {
        // Игнорируем ошибки дубликатов (на случай параллельного выполнения)
        console.warn(`Failed to add plant ${plant.id} from pack ${packName}:`, error)
      }
    }
  }
}

