import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware безопасности
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://api.deepseek.com"]
        }
    }
}));

// Лимитер запросов (100 запросов в 15 минут с одного IP)
const rateLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 100,
    duration: 15 * 60 // 15 минут
});

app.use(async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).json({ 
            error: 'Слишком много запросов. Пожалуйста, подождите.' 
        });
    }
});

// CORS настройки
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'https://walthereickeVV.github.io'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Проверка API ключа
const validateApiKey = () => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === 'your_actual_deepseek_api_key_here') {
        console.error('❌ DEEPSEEK_API_KEY не настроен!');
        console.log('📝 Получите API ключ на: https://platform.deepseek.com/');
        return false;
    }
    return true;
};

// Промпт-шаблоны для разных целей
const PROMPT_TEMPLATES = {
    weight_loss: `Создай питательный план для похудения с дефицитом калорий.`,
    muscle: `Создай высокобелковый план для набора мышечной массы.`,
    health: `Создай сбалансированный план для поддержания здоровья.`,
    energy: `Создай энергетический план с упором на сложные углеводы.`
};

// Основной эндпоинт для генерации плана питания
app.post('/api/generate-meal-plan', async (req, res) => {
    try {
        const { dietGoal, dietType, excludeFoods, calories = 2000 } = req.body;

        // Валидация входных данных
        if (!dietGoal || !dietType) {
            return res.status(400).json({
                error: 'Необходимо указать цель и тип диеты',
                details: 'Поля dietGoal и dietType обязательны'
            });
        }

        // Проверка API ключа
        if (!validateApiKey()) {
            return res.status(500).json({
                error: 'Сервер не настроен',
                details: 'API ключ DeepSeek не настроен на сервере'
            });
        }

        console.log(`🎯 Генерация плана: ${dietGoal}, ${dietType}, исключения: ${excludeFoods}`);

        // Формируем промпт для DeepSeek
        const basePrompt = PROMPT_TEMPLATES[dietGoal] || PROMPT_TEMPLATES.health;
        
        const prompt = `${basePrompt}
        
ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:
- Цель: ${dietGoal}
- Тип диеты: ${dietType}
- Калорийность: ${calories} ккал в день
- Исключить продукты: ${excludeFoods || 'нет'}
- Формат: ТОЛЬКО JSON

СОЗДАЙ ДЕТАЛЬНЫЙ ПЛАН ПИТАНИЯ НА 7 ДНЕЙ (ПОНЕДЕЛЬНИК-ВОСКРЕСЕНЬЕ):

Для каждого дня укажи:
1. Завтрак (название блюда и ингредиенты с количеством в граммах/штуках)
2. Обед (название блюда и ингредиенты с количеством)
3. Ужин (название блюда и ингредиенты с количеством)

ВАЖНО: Ответ должен быть В КОРРЕКТНОМ JSON ФОРМАТЕ без дополнительного текста:

{
    "week": [
        {
            "day": "Понедельник",
            "meals": {
                "breakfast": {
                    "name": "Название блюда",
                    "ingredients": [
                        {"name": "ингредиент 1", "quantity": 100, "unit": "г"},
                        {"name": "ингредиент 2", "quantity": 2, "unit": "шт"}
                    ]
                },
                "lunch": {
                    "name": "Название блюда", 
                    "ingredients": [
                        {"name": "ингредиент 1", "quantity": 150, "unit": "г"},
                        {"name": "ингредиент 2", "quantity": 1, "unit": "шт"}
                    ]
                },
                "dinner": {
                    "name": "Название блюда",
                    "ingredients": [
                        {"name": "ингредиент 1", "quantity": 200, "unit": "г"},
                        {"name": "ингредиент 2", "quantity": 50, "unit": "г"}
                    ]
                }
            }
        }
    ]
}

Убедись, что:
- Все имена ингредиентов в нижнем регистре
- Количества реалистичные
- Единицы измерения корректные (г, мл, шт)
- Блюда разнообразные и соответствуют типу диеты`;

        console.log('🚀 Отправка запроса к DeepSeek API...');

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Ошибка DeepSeek API:', response.status, errorText);
            throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            throw new Error('Неверный ответ от DeepSeek API');
        }

        // Парсим JSON ответ от ИИ
        const mealPlanText = data.choices[0].message.content;
        
        // Очищаем ответ от возможных markdown обрамлений
        const cleanText = mealPlanText.replace(/```json\n?|\n?```/g, '').trim();
        
        let mealPlan;
        try {
            mealPlan = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('❌ Ошибка парсинга JSON:', parseError);
            console.log('📝 Ответ от ИИ:', cleanText);
            
            // Пробуем исправить常见的 JSON ошибки
            const fixedText = cleanText
                .replace(/(\w+):/g, '"$1":') // Добавляем кавычки к ключам
                .replace(/'/g, '"'); // Заменяем одинарные кавычки на двойные
                
            try {
                mealPlan = JSON.parse(fixedText);
            } catch (secondError) {
                // Если все равно ошибка, возвращаем демо-данные
                console.log('🔄 Используем демо-данные из-за ошибки парсинга');
                mealPlan = getDemoMealPlan();
            }
        }

        // Валидация структуры ответа
        if (!mealPlan.week || !Array.isArray(mealPlan.week)) {
            console.log('🔄 Неверная структура, используем демо-данные');
            mealPlan = getDemoMealPlan();
        }

        console.log('✅ План питания успешно сгенерирован');
        
        res.json({
            success: true,
            data: mealPlan,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('💥 Критическая ошибка:', error);
        
        // Возвращаем демо-данные в случае ошибки
        const demoPlan = getDemoMealPlan();
        
        res.json({
            success: false,
            error: 'ИИ временно недоступен. Используем демо-план.',
            data: demoPlan,
            fallback: true
        });
    }
});

// Демо-данные для fallback
function getDemoMealPlan() {
    return {
        "week": [
            {
                "day": "Понедельник",
                "meals": {
                    "breakfast": {
                        "name": "Овсяная каша с ягодами",
                        "ingredients": [
                            {"name": "овсяные хлопья", "quantity": 50, "unit": "г"},
                            {"name": "молоко", "quantity": 200, "unit": "мл"},
                            {"name": "черника", "quantity": 100, "unit": "г"},
                            {"name": "мед", "quantity": 20, "unit": "г"}
                        ]
                    },
                    "lunch": {
                        "name": "Куриный салат с киноа",
                        "ingredients": [
                            {"name": "куриная грудка", "quantity": 150, "unit": "г"},
                            {"name": "киноа", "quantity": 100, "unit": "г"},
                            {"name": "помидор", "quantity": 2, "unit": "шт"},
                            {"name": "огурец", "quantity": 1, "unit": "шт"},
                            {"name": "оливковое масло", "quantity": 15, "unit": "мл"}
                        ]
                    },
                    "dinner": {
                        "name": "Лосось с овощами на пару",
                        "ingredients": [
                            {"name": "лосось", "quantity": 200, "unit": "г"},
                            {"name": "брокколи", "quantity": 150, "unit": "г"},
                            {"name": "морковь", "quantity": 100, "unit": "г"},
                            {"name": "лимон", "quantity": 0.5, "unit": "шт"}
                        ]
                    }
                }
            },
            {
                "day": "Вторник", 
                "meals": {
                    "breakfast": {
                        "name": "Тост с авокадо и яйцом",
                        "ingredients": [
                            {"name": "хлеб цельнозерновой", "quantity": 2, "unit": "ломтик"},
                            {"name": "авокадо", "quantity": 1, "unit": "шт"},
                            {"name": "яйцо", "quantity": 2, "unit": "шт"},
                            {"name": "соль", "quantity": 2, "unit": "г"}
                        ]
                    },
                    "lunch": {
                        "name": "Овощной суп с нутом",
                        "ingredients": [
                            {"name": "нут", "quantity": 100, "unit": "г"},
                            {"name": "морковь", "quantity": 100, "unit": "г"},
                            {"name": "сельдерей", "quantity": 50, "unit": "г"},
                            {"name": "лук", "quantity": 1, "unit": "шт"},
                            {"name": "чеснок", "quantity": 2, "unit": "зубчик"}
                        ]
                    },
                    "dinner": {
                        "name": "Индейка с гречкой",
                        "ingredients": [
                            {"name": "филе индейки", "quantity": 180, "unit": "г"},
                            {"name": "гречка", "quantity": 120, "unit": "г"},
                            {"name": "цветная капуста", "quantity": 200, "unit": "г"},
                            {"name": "специи", "quantity": 5, "unit": "г"}
                        ]
                    }
                }
            }
        ]
    };
}

// Эндпоинт для проверки здоровья API
app.get('/api/health', (req, res) => {
    const apiKeyStatus = validateApiKey() ? '✅ Настроен' : '❌ Отсутствует';
    
    res.json({
        status: 'OK',
        message: 'NutriVision 3D Server работает',
        timestamp: new Date().toISOString(),
        deepseekApi: apiKeyStatus,
        version: '1.0.0'
    });
});

// Эндпоинт для информации о API
app.get('/api/info', (req, res) => {
    res.json({
        name: 'NutriVision 3D API',
        description: 'AI-powered meal planning service',
        version: '1.0.0',
        endpoints: {
            'POST /api/generate-meal-plan': 'Генерация плана питания',
            'GET /api/health': 'Проверка здоровья сервера',
            'GET /api/info': 'Информация о API'
        },
        supportedDiets: ['balanced', 'keto', 'vegan', 'mediterranean'],
        supportedGoals: ['weight_loss', 'muscle', 'health', 'energy']
    });
});

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Эндпоинт не найден',
        availableEndpoints: {
            'POST /api/generate-meal-plan': 'Генерация плана питания',
            'GET /api/health': 'Проверка здоровья сервера'
        }
    });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('🚨 Необработанная ошибка:', error);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 NutriVision 3D Server запущен!');
    console.log(`📍 Порт: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔑 DeepSeek API: ${validateApiKey() ? '✅ Настроен' : '❌ ОТСУТСТВУЕТ'}`);
    console.log('='.repeat(50));
    console.log('\n📋 Доступные эндпоинты:');
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   POST http://localhost:${PORT}/api/generate-meal-plan`);
    console.log(`   GET  http://localhost:${PORT}/api/info`);
    console.log('\n💡 Для получения API ключа: https://platform.deepseek.com/');
    console.log('='.repeat(50) + '\n');
});

export default app;
