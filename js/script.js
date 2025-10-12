// NutriVision 3D - Продвинутый AI планировщик питания с демо-режимом
class NutriVision3D {
    constructor() {
        // Для GitHub Pages используем демо-режим
        this.API_BASE_URL = null;
        this.currentPlan = null;
        this.isRotating = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.init3DEffects();
        this.loadFromStorage();
        console.log('🚀 NutriVision 3D инициализирован в демо-режиме');
    }

    bindEvents() {
        // Навигация
        document.getElementById('startAI').addEventListener('click', () => {
            document.getElementById('planning').scrollIntoView({ behavior: 'smooth' });
        });

        // 3D демо
        document.getElementById('demoBtn').addEventListener('click', () => {
            this.show3DDemo();
        });

        // Форма AI - теперь использует демо-данные
        document.getElementById('aiForm3D').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateDemoPlan();
        });

        // Чипсы выбора
        document.querySelectorAll('.chip-3d').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.chip-3d').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Теги исключений
        document.getElementById('exclude3D').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addExclusionTag();
            }
        });

        // Действия с результатами
        document.getElementById('rotateView').addEventListener('click', () => {
            this.toggleRotation();
        });

        document.getElementById('exportPlan').addEventListener('click', () => {
            this.exportPlan();
        });
    }

    generateDemoPlan() {
        const button = document.querySelector('.btn-generate-3d');
        
        // Показываем индикатор загрузки
        button.classList.add('loading');
        
        // Имитируем загрузку AI
        setTimeout(() => {
            const preferences = {
                dietGoal: document.getElementById('goal3D').value,
                dietType: document.querySelector('.chip-3d.active').dataset.value,
                excludeFoods: this.getExclusionTags()
            };
            
            // Генерируем демо-план на основе выбранных предпочтений
            const demoPlan = this.generateSmartDemoPlan(preferences);
            
            this.currentPlan = demoPlan;
            this.display3DPlan(demoPlan);
            this.showResults();
            this.showSuccessAnimation();
            
            button.classList.remove('loading');
        }, 2000); // 2 секунды "загрузки" для реалистичности
    }

    generateSmartDemoPlan(preferences) {
        // Умная генерация демо-плана на основе выбранных предпочтений
        const diets = {
            balanced: this.getBalancedMeals(),
            keto: this.getKetoMeals(),
            vegan: this.getVeganMeals(),
            mediterranean: this.getMediterraneanMeals()
        };
        
        const selectedMeals = diets[preferences.dietType] || diets.balanced;
        
        return {
            week: [
                {
                    day: "Понедельник",
                    meals: {
                        breakfast: selectedMeals.breakfast[0],
                        lunch: selectedMeals.lunch[0],
                        dinner: selectedMeals.dinner[0]
                    }
                },
                {
                    day: "Вторник",
                    meals: {
                        breakfast: selectedMeals.breakfast[1],
                        lunch: selectedMeals.lunch[1],
                        dinner: selectedMeals.dinner[1]
                    }
                },
                {
                    day: "Среда",
                    meals: {
                        breakfast: selectedMeals.breakfast[2],
                        lunch: selectedMeals.lunch[2],
                        dinner: selectedMeals.dinner[2]
                    }
                },
                {
                    day: "Четверг",
                    meals: {
                        breakfast: selectedMeals.breakfast[0],
                        lunch: selectedMeals.lunch[1],
                        dinner: selectedMeals.dinner[2]
                    }
                },
                {
                    day: "Пятница",
                    meals: {
                        breakfast: selectedMeals.breakfast[1],
                        lunch: selectedMeals.lunch[2],
                        dinner: selectedMeals.dinner[0]
                    }
                },
                {
                    day: "Суббота",
                    meals: {
                        breakfast: selectedMeals.breakfast[2],
                        lunch: selectedMeals.lunch[0],
                        dinner: selectedMeals.dinner[1]
                    }
                },
                {
                    day: "Воскресенье",
                    meals: {
                        breakfast: selectedMeals.breakfast[0],
                        lunch: selectedMeals.lunch[2],
                        dinner: selectedMeals.dinner[1]
                    }
                }
            ]
        };
    }

    getBalancedMeals() {
        return {
            breakfast: [
                {
                    name: "Овсяная каша с ягодами и орехами",
                    ingredients: [
                        { name: "овсяные хлопья", quantity: 50, unit: "г" },
                        { name: "молоко", quantity: 200, unit: "мл" },
                        { name: "черника", quantity: 100, unit: "г" },
                        { name: "грецкие орехи", quantity: 30, unit: "г" }
                    ]
                },
                {
                    name: "Тост с авокадо и яйцом пашот",
                    ingredients: [
                        { name: "хлеб цельнозерновой", quantity: 2, unit: "ломтик" },
                        { name: "авокадо", quantity: 1, unit: "шт" },
                        { name: "яйцо", quantity: 2, unit: "шт" },
                        { name: "лимонный сок", quantity: 10, unit: "мл" }
                    ]
                },
                {
                    name: "Гречневая каша с фруктами",
                    ingredients: [
                        { name: "гречка", quantity: 60, unit: "г" },
                        { name: "банан", quantity: 1, unit: "шт" },
                        { name: "корица", quantity: 5, unit: "г" },
                        { name: "мед", quantity: 20, unit: "г" }
                    ]
                }
            ],
            lunch: [
                {
                    name: "Куриный салат с киноа",
                    ingredients: [
                        { name: "куриная грудка", quantity: 150, unit: "г" },
                        { name: "киноа", quantity: 100, unit: "г" },
                        { name: "помидор", quantity: 2, unit: "шт" },
                        { name: "огурец", quantity: 1, unit: "шт" },
                        { name: "оливковое масло", quantity: 15, unit: "мл" }
                    ]
                },
                {
                    name: "Овощной суп с нутом",
                    ingredients: [
                        { name: "нут", quantity: 100, unit: "г" },
                        { name: "морковь", quantity: 100, unit: "г" },
                        { name: "сельдерей", quantity: 50, unit: "г" },
                        { name: "лук", quantity: 1, unit: "шт" },
                        { name: "чеснок", quantity: 2, unit: "зубчик" }
                    ]
                },
                {
                    name: "Лосось с булгуром",
                    ingredients: [
                        { name: "лосось", quantity: 200, unit: "г" },
                        { name: "булгур", quantity: 120, unit: "г" },
                        { name: "шпинат", quantity: 100, unit: "г" },
                        { name: "лимон", quantity: 0.5, unit: "шт" }
                    ]
                }
            ],
            dinner: [
                {
                    name: "Индейка с овощами на пару",
                    ingredients: [
                        { name: "филе индейки", quantity: 180, unit: "г" },
                        { name: "брокколи", quantity: 200, unit: "г" },
                        { name: "цветная капуста", quantity: 150, unit: "г" },
                        { name: "специи", quantity: 5, unit: "г" }
                    ]
                },
                {
                    name: "Тыквенный крем-суп",
                    ingredients: [
                        { name: "тыква", quantity: 300, unit: "г" },
                        { name: "лук", quantity: 1, unit: "шт" },
                        { name: "сливки", quantity: 50, unit: "мл" },
                        { name: "имбирь", quantity: 10, unit: "г" }
                    ]
                },
                {
                    name: "Омлет с грибами и сыром",
                    ingredients: [
                        { name: "яйцо", quantity: 3, unit: "шт" },
                        { name: "шампиньоны", quantity: 150, unit: "г" },
                        { name: "сыр", quantity: 50, unit: "г" },
                        { name: "петрушка", quantity: 10, unit: "г" }
                    ]
                }
            ]
        };
    }

    getKetoMeals() {
        return {
            breakfast: [
                {
                    name: "Яичница с авокадо и беконом",
                    ingredients: [
                        { name: "яйцо", quantity: 3, unit: "шт" },
                        { name: "авокадо", quantity: 1, unit: "шт" },
                        { name: "бекон", quantity: 100, unit: "г" },
                        { name: "сливочное масло", quantity: 20, unit: "г" }
                    ]
                }
            ],
            lunch: [
                {
                    name: "Салат с курицей и авокадо",
                    ingredients: [
                        { name: "куриная грудка", quantity: 200, unit: "г" },
                        { name: "авокадо", quantity: 1, unit: "шт" },
                        { name: "салат айсберг", quantity: 100, unit: "г" },
                        { name: "оливковое масло", quantity: 20, unit: "мл" }
                    ]
                }
            ],
            dinner: [
                {
                    name: "Лосось со спаржей",
                    ingredients: [
                        { name: "лосось", quantity: 250, unit: "г" },
                        { name: "спаржа", quantity: 200, unit: "г" },
                        { name: "лимон", quantity: 0.5, unit: "шт" },
                        { name: "оливковое масло", quantity: 15, unit: "мл" }
                    ]
                }
            ]
        };
    }

    getVeganMeals() {
        return {
            breakfast: [
                {
                    name: "Чиа-пудинг с ягодами",
                    ingredients: [
                        { name: "семена чиа", quantity: 40, unit: "г" },
                        { name: "кокосовое молоко", quantity: 200, unit: "мл" },
                        { name: "клубника", quantity: 100, unit: "г" },
                        { name: "миндаль", quantity: 30, unit: "г" }
                    ]
                }
            ],
            lunch: [
                {
                    name: "Будда-боул с тофу",
                    ingredients: [
                        { name: "тофу", quantity: 150, unit: "г" },
                        { name: "киноа", quantity: 100, unit: "г" },
                        { name: "авокадо", quantity: 1, unit: "шт" },
                        { name: "морковь", quantity: 100, unit: "г" }
                    ]
                }
            ],
            dinner: [
                {
                    name: "Чечевичный суп",
                    ingredients: [
                        { name: "чечевица", quantity: 150, unit: "г" },
                        { name: "морковь", quantity: 100, unit: "г" },
                        { name: "лук", quantity: 1, unit: "шт" },
                        { name: "сельдерей", quantity: 50, unit: "г" }
                    ]
                }
            ]
        };
    }

    getMediterraneanMeals() {
        return {
            breakfast: [
                {
                    name: "Греческий йогурт с медом и орехами",
                    ingredients: [
                        { name: "греческий йогурт", quantity: 200, unit: "г" },
                        { name: "мед", quantity: 20, unit: "г" },
                        { name: "грецкие орехи", quantity: 30, unit: "г" },
                        { name: "финики", quantity: 3, unit: "шт" }
                    ]
                }
            ],
            lunch: [
                {
                    name: "Греческий салат с фетой",
                    ingredients: [
                        { name: "помидор", quantity: 2, unit: "шт" },
                        { name: "огурец", quantity: 1, unit: "шт" },
                        { name: "перец", quantity: 1, unit: "шт" },
                        { name: "сыр фета", quantity: 100, unit: "г" },
                        { name: "оливки", quantity: 50, unit: "г" }
                    ]
                }
            ],
            dinner: [
                {
                    name: "Рыба на гриле с овощами",
                    ingredients: [
                        { name: "дорадо", quantity: 250, unit: "г" },
                        { name: "цуккини", quantity: 150, unit: "г" },
                        { name: "баклажан", quantity: 150, unit: "г" },
                        { name: "розмарин", quantity: 5, unit: "г" }
                    ]
                }
            ]
        };
    }

    // Остальные методы остаются без изменений
    init3DEffects() {
        // Инициализация 3D эффектов для карточек
        this.initCard3DEffects();
        
        // Партиклы для героя
        this.initParticles();
        
        // Анимация появления элементов при скролле
        this.initScrollAnimations();
    }

    initCard3DEffects() {
        const cards = document.querySelectorAll('.day-card-3d, .food-card-3d');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (this.isRotating) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = (x - centerX) / 10;
                const rotateX = (centerY - y) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });
            
            card.addEventListener('mouseleave', () => {
                if (!this.isRotating) {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                }
            });
        });
    }

    initParticles() {
        const container = document.getElementById('particles-js');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: ${this.getRandomColor()};
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 10 + 5}s linear infinite;
            `;
            container.appendChild(particle);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    getRandomColor() {
        const colors = ['#ff00ff', '#00ffff', '#39ff14', '#bf00ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.day-card-3d, .form-container-3d, .shopping-list-3d').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    display3DPlan(mealPlan) {
        const container = document.getElementById('weekContainer');
        
        if (!mealPlan || !mealPlan.week) {
            container.innerHTML = '<div class="empty-state-3d"><p>Не удалось сгенерировать план питания</p></div>';
            return;
        }

        let html = '';
        
        mealPlan.week.forEach(day => {
            html += `
                <div class="day-card-3d" data-day="${day.day}">
                    <div class="day-header">
                        <div class="day-name">${day.day}</div>
                        <div class="day-calories">${this.calculateDayCalories(day)} ккал</div>
                    </div>
                    
                    <div class="meal-item-3d">
                        <div class="meal-type"><i class="fas fa-sun"></i> Завтрак</div>
                        <div class="meal-name">${day.meals.breakfast.name}</div>
                        <div class="meal-ingredients">
                            ${day.meals.breakfast.ingredients.map(ing => 
                                `<span class="ingredient-tag">${ing.name} - ${ing.quantity}${ing.unit}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="meal-item-3d">
                        <div class="meal-type"><i class="fas fa-sun"></i> Обед</div>
                        <div class="meal-name">${day.meals.lunch.name}</div>
                        <div class="meal-ingredients">
                            ${day.meals.lunch.ingredients.map(ing => 
                                `<span class="ingredient-tag">${ing.name} - ${ing.quantity}${ing.unit}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="meal-item-3d">
                        <div class="meal-type"><i class="fas fa-moon"></i> Ужин</div>
                        <div class="meal-name">${day.meals.dinner.name}</div>
                        <div class="meal-ingredients">
                            ${day.meals.dinner.ingredients.map(ing => 
                                `<span class="ingredient-tag">${ing.name} - ${ing.quantity}${ing.unit}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        
        setTimeout(() => this.initCard3DEffects(), 100);
        this.generate3DShoppingList(mealPlan);
    }

    calculateDayCalories(day) {
        let total = 0;
        for (const mealType in day.meals) {
            total += day.meals[mealType].ingredients.length * 150;
        }
        return Math.round(total);
    }

    generate3DShoppingList(mealPlan) {
        const allIngredients = {};
        
        mealPlan.week.forEach(day => {
            for (const mealType in day.meals) {
                day.meals[mealType].ingredients.forEach(ingredient => {
                    const name = ingredient.name.toLowerCase();
                    if (allIngredients[name]) {
                        allIngredients[name].quantity += ingredient.quantity;
                    } else {
                        allIngredients[name] = {
                            ...ingredient,
                            name: ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1)
                        };
                    }
                });
            }
        });

        this.display3DShoppingList(allIngredients);
    }

    display3DShoppingList(ingredients) {
        const container = document.getElementById('shoppingList3D');
        
        if (Object.keys(ingredients).length === 0) {
            container.innerHTML = `
                <div class="empty-state-3d">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Сгенерируйте план питания чтобы увидеть список</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="shopping-header-3d">
                <h3>Ваши покупки на неделю</h3>
                <div class="shopping-actions">
                    <button class="btn-3d-action" onclick="nutriVision.clearList()">
                        <i class="fas fa-trash"></i> Очистить
                    </button>
                    <button class="btn-3d-action" onclick="nutriVision.printList()">
                        <i class="fas fa-print"></i> Печать
                    </button>
                </div>
            </div>
            <div class="shopping-items-3d">
        `;

        Object.values(ingredients).forEach(ingredient => {
            html += `
                <div class="shopping-item-3d">
                    <label class="checkbox-3d">
                        <input type="checkbox">
                        <span class="checkmark"></span>
                    </label>
                    <span class="item-name">${ingredient.name}</span>
                    <span class="item-quantity">${ingredient.quantity} ${ingredient.unit || 'г'}</span>
                    <span class="item-category">${this.getIngredientCategory(ingredient.name)}</span>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        this.addShoppingListHandlers();
        this.saveToStorage();
    }

    getIngredientCategory(ingredientName) {
        const categories = {
            'овощ': '🥦 Овощи',
            'фрукт': '🍎 Фрукты',
            'мясо': '🍗 Мясо',
            'рыба': '🐟 Рыба',
            'молоч': '🥛 Молочные',
            'зерн': '🌾 Зерновые',
            'специ': '🧂 Специи',
            'орех': '🥜 Орехи',
            'сыр': '🧀 Сыр'
        };

        for (const [key, value] of Object.entries(categories)) {
            if (ingredientName.toLowerCase().includes(key)) {
                return value;
            }
        }
        return '📦 Прочее';
    }

    addShoppingListHandlers() {
        document.querySelectorAll('.shopping-item-3d input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const item = this.closest('.shopping-item-3d');
                if (this.checked) {
                    item.classList.add('checked');
                    item.style.opacity = '0.6';
                } else {
                    item.classList.remove('checked');
                    item.style.opacity = '1';
                }
            });
        });
    }

    addExclusionTag() {
        const input = document.getElementById('exclude3D');
        const container = document.getElementById('tagsContainer');
        const value = input.value.trim();

        if (value) {
            const tag = document.createElement('div');
            tag.className = 'exclusion-tag';
            tag.innerHTML = `
                ${value}
                <span class="remove-tag" onclick="this.parentElement.remove()">×</span>
            `;
            container.appendChild(tag);
            input.value = '';
        }
    }

    getExclusionTags() {
        const tags = Array.from(document.querySelectorAll('.exclusion-tag'));
        return tags.map(tag => tag.textContent.replace('×', '')).join(', ');
    }

    toggleRotation() {
        this.isRotating = !this.isRotating;
        const cards = document.querySelectorAll('.day-card-3d');
        const button = document.getElementById('rotateView');

        if (this.isRotating) {
            cards.forEach(card => {
                card.style.animation = 'rotate3d 10s linear infinite';
            });
            button.innerHTML = '<i class="fas fa-pause"></i> Стоп';
        } else {
            cards.forEach(card => {
                card.style.animation = '';
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
            button.innerHTML = '<i class="fas fa-sync-alt"></i> Вращать';
        }

        if (!document.querySelector('#rotate3d-animation')) {
            const style = document.createElement('style');
            style.id = 'rotate3d-animation';
            style.textContent = `
                @keyframes rotate3d {
                    0% { transform: perspective(1000px) rotateY(0deg); }
                    100% { transform: perspective(1000px) rotateY(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    show3DDemo() {
        const demoPlan = this.generateSmartDemoPlan({
            dietGoal: 'health',
            dietType: 'balanced',
            excludeFoods: ''
        });

        this.currentPlan = demoPlan;
        this.display3DPlan(demoPlan);
        this.showResults();
        
        document.getElementById('results3D').scrollIntoView({ behavior: 'smooth' });
    }

    showResults() {
        const results = document.getElementById('results3D');
        results.classList.remove('hidden');
        
        results.style.animation = 'fadeInUp 1s ease-out';
        
        setTimeout(() => {
            results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }

    showSuccessAnimation() {
        const success = document.createElement('div');
        success.innerHTML = '✅ План успешно создан!';
        success.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(57, 255, 20, 0.9);
            color: white;
            padding: 2rem 3rem;
            border-radius: 15px;
            font-weight: bold;
            font-size: 1.2rem;
            z-index: 10000;
            animation: successPop 2s ease-in-out forwards;
        `;
        
        document.body.appendChild(success);
        
        setTimeout(() => {
            success.remove();
        }, 2000);
        
        if (!document.querySelector('#success-animation')) {
            const style = document.createElement('style');
            style.id = 'success-animation';
            style.textContent = `
                @keyframes successPop {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showError(message) {
        const error = document.createElement('div');
        error.textContent = message;
        error.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.style.animation = 'slideOutRight 0.5s ease-in forwards';
            setTimeout(() => error.remove(), 500);
        }, 3000);
        
        if (!document.querySelector('#error-animation')) {
            const style = document.createElement('style');
            style.id = 'error-animation';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    exportPlan() {
        if (!this.currentPlan) {
            this.showError('Нет плана для экспорта');
            return;
        }

        const data = JSON.stringify(this.currentPlan, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meal-plan.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessAnimation();
    }

    clearList() {
        if (confirm('Очистить список покупок?')) {
            localStorage.removeItem('shoppingList');
            this.display3DShoppingList({});
        }
    }

    printList() {
        window.print();
    }

    saveToStorage() {
        if (this.currentPlan) {
            localStorage.setItem('currentPlan', JSON.stringify(this.currentPlan));
        }
    }

    loadFromStorage() {
        const savedPlan = localStorage.getItem('currentPlan');
        if (savedPlan) {
            this.currentPlan = JSON.parse(savedPlan);
            this.display3DPlan(this.currentPlan);
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.nutriVision = new NutriVision3D();
});

// Добавляем глобальные стили для анимаций
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .exclusion-tag {
            display: inline-flex;
            align-items: center;
            background: rgba(255, 0, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            margin: 0.3rem;
            font-size: 0.9rem;
            border: 1px solid var(--neon-pink);
        }
        
        .remove-tag {
            margin-left: 0.5rem;
            cursor: pointer;
            font-weight: bold;
        }
        
        .remove-tag:hover {
            color: var(--neon-blue);
        }
        
        .shopping-header-3d {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .shopping-items-3d {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .shopping-item-3d {
            display: grid;
            grid-template-columns: auto 1fr auto auto;
            gap: 1rem;
            align-items: center;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .shopping-item-3d:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(10px);
        }
        
        .shopping-item-3d.checked {
            opacity: 0.6;
            text-decoration: line-through;
        }
        
        .item-category {
            font-size: 0.8rem;
            opacity: 0.7;
        }
        
        .checkbox-3d {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        @media (max-width: 768px) {
            .shopping-item-3d {
                grid-template-columns: auto 1fr;
                gap: 0.5rem;
            }
            
            .item-quantity, .item-category {
                grid-column: 2;
            }
        }
    </style>
`);
