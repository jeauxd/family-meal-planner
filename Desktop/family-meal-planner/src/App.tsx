import React, { useState, useEffect } from 'react';
import './App.css';

// Simple icon components
const Calendar = () => <span>📅</span>;
const Users = () => <span>👥</span>;
const Clock = () => <span>⏰</span>;
const Heart = ({ style }: { style?: React.CSSProperties }) => <span style={style}>❤️</span>;
const Plus = () => <span>➕</span>;
const Settings = () => <span>⚙️</span>;
const ChefHat = () => <span>👨‍🍳</span>;
const Star = ({ style }: { style?: React.CSSProperties }) => <span style={style}>⭐</span>;
const Check = () => <span style={{ color: 'white' }}>✓</span>;
const X = () => <span style={{ color: 'white' }}>✕</span>;
const ShoppingCart = () => <span>🛒</span>;
const Utensils = () => <span>🍽️</span>;

interface Recipe {
  id: number;
  name: string;
  cookTime: number;
  difficulty: string;
  ingredients: string[];
  nutritionType: string;
  description: string;
  flavors: string;
  matchScore?: number;
}

interface CalendarEvent {
  date: string;
  busyLevel: string;
  availableTime: number;
}

interface ShoppingItem {
  ingredient: string;
  count: number;
  checked: boolean;
}

interface FamilyMember {
  id: number;
  name: string;
  preferences: string[];
  dislikes: string[];
}

const FamilyMealPlanner = () => {
  const [activeTab, setActiveTab] = useState('planner');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: 1, name: 'You', preferences: ['Italian food', 'Spicy dishes'], dislikes: ['Mushrooms'] }
  ]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([
    { id: 1, name: 'Spaghetti Bolognese', cookTime: 30, difficulty: 'Medium', 
      ingredients: ['pasta', 'ground beef', 'tomato sauce', 'onions', 'garlic'],
      nutritionType: 'protein-dominant',
      description: 'Classic Italian pasta with rich meat sauce',
      flavors: 'savory, hearty, tomato-based' },
    { id: 2, name: 'Chicken Stir Fry', cookTime: 20, difficulty: 'Easy', 
      ingredients: ['chicken breast', 'mixed vegetables', 'soy sauce', 'ginger', 'garlic'],
      nutritionType: 'protein-dominant',
      description: 'Quick Asian-inspired dish with tender chicken and crisp vegetables',
      flavors: 'savory, ginger, garlic, umami' },
    { id: 3, name: 'Tacos', cookTime: 25, difficulty: 'Easy', 
      ingredients: ['ground beef', 'tortillas', 'cheese', 'lettuce', 'tomatoes'],
      nutritionType: 'balanced',
      description: 'Mexican-style soft tacos with seasoned beef and fresh toppings',
      flavors: 'spicy, fresh, savory, tex-mex' }
  ]);
  const [weeklyPlan, setWeeklyPlan] = useState<{[key: string]: Recipe}>({});
  const [suggestionRatio, setSuggestionRatio] = useState(70);
  const [newMemberName, setNewMemberName] = useState('');
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeCookTime, setNewRecipeCookTime] = useState(30);
  const [calendarEvents] = useState<CalendarEvent[]>([
    { date: '2025-06-09', busyLevel: 'high', availableTime: 20 },
    { date: '2025-06-10', busyLevel: 'medium', availableTime: 45 },
    { date: '2025-06-11', busyLevel: 'low', availableTime: 60 },
    { date: '2025-06-12', busyLevel: 'high', availableTime: 15 },
    { date: '2025-06-13', busyLevel: 'medium', availableTime: 40 },
    { date: '2025-06-14', busyLevel: 'low', availableTime: 90 },
    { date: '2025-06-15', busyLevel: 'medium', availableTime: 35 }
  ]);
  const [nutritionPreferences, setNutritionPreferences] = useState({
    priority: 'protein-dominant',
    restrictions: []
  });
  const [mealPrepStartTime, setMealPrepStartTime] = useState('17:30'); // 5:30 PM default
  const [acceptedMeals, setAcceptedMeals] = useState<{[key: string]: Recipe}>({});
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  const suggestedRecipes: Recipe[] = [
    { id: 101, name: 'Honey Garlic Salmon', cookTime: 25, difficulty: 'Medium', matchScore: 85,
      ingredients: ['salmon fillets', 'honey', 'garlic', 'soy sauce', 'green beans'],
      nutritionType: 'protein-dominant',
      description: 'Pan-seared salmon with sweet and savory glaze',
      flavors: 'sweet, savory, garlic, light soy' },
    { id: 102, name: 'Vegetable Curry', cookTime: 35, difficulty: 'Medium', matchScore: 78,
      ingredients: ['mixed vegetables', 'coconut milk', 'curry powder', 'rice', 'onions'],
      nutritionType: 'vegetarian',
      description: 'Creamy coconut curry with seasonal vegetables over rice',
      flavors: 'spicy, creamy, aromatic, coconut' },
    { id: 103, name: 'BBQ Chicken Wraps', cookTime: 15, difficulty: 'Easy', matchScore: 92,
      ingredients: ['chicken breast', 'BBQ sauce', 'tortillas', 'lettuce', 'tomatoes'],
      nutritionType: 'protein-dominant',
      description: 'Quick wraps with smoky BBQ chicken and fresh vegetables',
      flavors: 'smoky, tangy, fresh, barbecue' },
    { id: 104, name: 'Mushroom Risotto', cookTime: 45, difficulty: 'Hard', matchScore: 70,
      ingredients: ['arborio rice', 'mushrooms', 'chicken broth', 'parmesan', 'white wine'],
      nutritionType: 'balanced',
      description: 'Creamy Italian rice dish with earthy mushrooms and parmesan',
      flavors: 'creamy, earthy, rich, wine notes' },
    { id: 105, name: 'Beef and Broccoli', cookTime: 20, difficulty: 'Easy', matchScore: 88,
      ingredients: ['beef strips', 'broccoli', 'soy sauce', 'garlic', 'ginger'],
      nutritionType: 'protein-dominant',
      description: 'Chinese-American classic with tender beef and crisp broccoli',
      flavors: 'savory, ginger, garlic, umami' }
  ];

  const addFamilyMember = () => {
    if (newMemberName.trim()) {
      setFamilyMembers([...familyMembers, {
        id: Date.now(),
        name: newMemberName,
        preferences: [],
        dislikes: []
      }]);
      setNewMemberName('');
    }
  };

  const addRecipe = () => {
    if (newRecipeName.trim()) {
      setFavoriteRecipes([...favoriteRecipes, {
        id: Date.now(),
        name: newRecipeName,
        cookTime: newRecipeCookTime,
        difficulty: newRecipeCookTime <= 20 ? 'Easy' : newRecipeCookTime <= 40 ? 'Medium' : 'Hard',
        ingredients: [],
        nutritionType: 'balanced',
        description: 'Custom recipe',
        flavors: 'delicious'
      }]);
      setNewRecipeName('');
      setNewRecipeCookTime(30);
    }
  };

  const generateWeeklyPlan = () => {
    const plan: {[key: string]: Recipe} = {};
    calendarEvents.forEach(event => {
      if (acceptedMeals[event.date]) {
        plan[event.date] = acceptedMeals[event.date];
        return;
      }

      const allRecipes = [...favoriteRecipes, ...suggestedRecipes];
      const nutritionFilteredRecipes = allRecipes.filter(recipe => 
        recipe.nutritionType === nutritionPreferences.priority || nutritionPreferences.priority === 'any'
      );
      const availableRecipes = nutritionFilteredRecipes.filter(r => r.cookTime <= event.availableTime);
      
      if (availableRecipes.length === 0) {
        const timeFilteredRecipes = allRecipes.filter(r => r.cookTime <= event.availableTime);
        if (timeFilteredRecipes.length > 0) {
          plan[event.date] = timeFilteredRecipes[0];
        }
        return;
      }

      const shouldUseFavorite = Math.random() < (suggestionRatio / 100);
      
      let selectedRecipe;
      if (shouldUseFavorite) {
        const viablesFavorites = availableRecipes.filter(r => r.id < 100);
        selectedRecipe = viablesFavorites[Math.floor(Math.random() * viablesFavorites.length)] || availableRecipes[0];
      } else {
        const viablesSuggested = availableRecipes.filter(r => r.id >= 100);
        selectedRecipe = viablesSuggested[Math.floor(Math.random() * viablesSuggested.length)] || availableRecipes[0];
      }
      
      plan[event.date] = selectedRecipe;
    });
    setWeeklyPlan(plan);
  };

  const acceptMeal = (date: string, meal: Recipe) => {
    setAcceptedMeals(prev => ({
      ...prev,
      [date]: meal
    }));
  };

  const rejectMeal = (date: string) => {
    setAcceptedMeals(prev => {
      const updated = { ...prev };
      delete updated[date];
      return updated;
    });
    
    const event = calendarEvents.find(e => e.date === date);
    if (event) {
      const allRecipes = [...favoriteRecipes, ...suggestedRecipes];
      const nutritionFilteredRecipes = allRecipes.filter(recipe => 
        recipe.nutritionType === nutritionPreferences.priority || nutritionPreferences.priority === 'any'
      );
      const availableRecipes = nutritionFilteredRecipes.filter(r => 
        r.cookTime <= event.availableTime && r.id !== weeklyPlan[date]?.id
      );
      
      if (availableRecipes.length > 0) {
        const newMeal = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        setWeeklyPlan(prev => ({
          ...prev,
          [date]: newMeal
        }));
      }
    }
  };

  const generateShoppingList = () => {
    const ingredients: {[key: string]: number} = {};
    
    Object.values(acceptedMeals).forEach(meal => {
      if (meal && meal.ingredients) {
        meal.ingredients.forEach(ingredient => {
          ingredients[ingredient] = (ingredients[ingredient] || 0) + 1;
        });
      }
    });

    const list: ShoppingItem[] = Object.entries(ingredients).map(([ingredient, count]) => ({
      ingredient,
      count,
      checked: false
    }));
    
    setShoppingList(list);
  };

  const toggleShoppingItem = (index: number) => {
    setShoppingList(prev => prev.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    ));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getBusyLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'badge-busy-high';
      case 'medium': return 'badge-busy-medium';
      case 'low': return 'badge-busy-low';
      default: return 'badge';
    }
  };

  useEffect(() => {
    generateWeeklyPlan();
  }, [suggestionRatio, nutritionPreferences, mealPrepStartTime]);

  useEffect(() => {
    generateShoppingList();
  }, [acceptedMeals]);

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="header-content">
            <div className="header-title">
              <ChefHat />
              <h1>Family Meal Planner</h1>
            </div>
            <div className="nav-tabs">
              <button
                onClick={() => setActiveTab('planner')}
                className={`nav-tab ${activeTab === 'planner' ? 'active' : ''}`}
              >
                <Calendar />
                Meal Planner
              </button>
              <button
                onClick={() => setActiveTab('family')}
                className={`nav-tab ${activeTab === 'family' ? 'active' : ''}`}
              >
                <Users />
                Family
              </button>
              <button
                onClick={() => setActiveTab('recipes')}
                className={`nav-tab ${activeTab === 'recipes' ? 'active' : ''}`}
              >
                <Heart />
                Recipes
              </button>
              <button
                onClick={() => setActiveTab('shopping')}
                className={`nav-tab ${activeTab === 'shopping' ? 'active' : ''}`}
              >
                <ShoppingCart />
                Shopping List
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Settings />
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="content">
          {activeTab === 'planner' && (
            <div>
              <div className="section-header">
                <h2 className="section-title">This Week's Meal Plan</h2>
                <button
                  onClick={generateWeeklyPlan}
                  className="btn btn-primary"
                >
                  <Calendar />
                  <span>Generate New Plan</span>
                </button>
              </div>

              <div className="grid grid-cols-3">
                {calendarEvents.map(event => {
                  const meal = weeklyPlan[event.date];
                  const isAccepted = acceptedMeals[event.date];
                  return (
                    <div key={event.date} className={`meal-card ${isAccepted ? 'accepted' : ''}`}>
                      <div className="meal-card-header">
                        <h3 className="meal-title">{formatDate(event.date)}</h3>
                        <span className={`badge ${getBusyLevelColor(event.busyLevel)}`}>
                          {event.availableTime} min available after {mealPrepStartTime}
                        </span>
                      </div>
                      
                      {meal && (
                        <div className="meal-info">
                          <div className="meal-card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ChefHat />
                              <span className="meal-title">{meal.name}</span>
                              {meal.matchScore && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '14px' }}>
                                  <Star />
                                  <span>{meal.matchScore}%</span>
                                </span>
                              )}
                            </div>
                            
                            {!isAccepted && (
                              <div className="meal-actions">
                                <button
                                  onClick={() => acceptMeal(event.date, meal)}
                                  className="btn btn-success btn-small"
                                  title="Accept meal"
                                >
                                  <Check />
                                </button>
                                <button
                                  onClick={() => rejectMeal(event.date)}
                                  className="btn btn-danger btn-small"
                                  title="Reject meal"
                                >
                                  <X />
                                </button>
                              </div>
                            )}
                          </div>

                          {meal.description && (
                            <p className="meal-description">{meal.description}</p>
                          )}

                          <div>
                            <div className="meal-details">
                              <strong>Ingredients:</strong> {meal.ingredients?.join(', ')}
                            </div>
                            {meal.flavors && (
                              <div className="meal-details">
                                <strong>Flavors:</strong> {meal.flavors}
                              </div>
                            )}
                          </div>

                          <div className="meal-meta">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock />
                              <span>{meal.cookTime} min</span>
                            </span>
                            <span className="badge badge-blue">
                              {meal.difficulty}
                            </span>
                            <span className="badge badge-purple">
                              <Utensils />
                              <span>{meal.nutritionType}</span>
                            </span>
                          </div>
                          
                          {isAccepted && (
                            <div className="accepted-indicator">
                              <Check />
                              <span>Added to meal plan</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div>
              <h2 className="section-title">Family Members & Preferences</h2>
              
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: '500', color: '#1e40af', marginBottom: '12px' }}>Add Family Member</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Enter name"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={addFamilyMember}
                    className="btn btn-primary"
                  >
                    <Plus />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {familyMembers.map(member => (
                  <div key={member.id} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontWeight: '500', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users />
                      <span>{member.name}</span>
                    </h3>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Food Preferences</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {member.preferences.map((pref, idx) => (
                          <span key={idx} className="badge badge-green">
                            {pref}
                          </span>
                        ))}
                        <button 
                          style={{ padding: '4px 8px', backgroundColor: '#e5e7eb', color: '#6b7280', borderRadius: '12px', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                          onClick={() => {
                            const newPref = prompt('Add food preference:');
                            if (newPref) {
                              setFamilyMembers(prev => prev.map(m => 
                                m.id === member.id 
                                  ? { ...m, preferences: [...m.preferences, newPref] }
                                  : m
                              ));
                            }
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Foods to Avoid</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {member.dislikes.map((dislike, idx) => (
                          <span key={idx} style={{ padding: '4px 8px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                            {dislike}
                          </span>
                        ))}
                        <button 
                          style={{ padding: '4px 8px', backgroundColor: '#e5e7eb', color: '#6b7280', borderRadius: '12px', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                          onClick={() => {
                            const newDislike = prompt('Add food to avoid:');
                            if (newDislike) {
                              setFamilyMembers(prev => prev.map(m => 
                                m.id === member.id 
                                  ? { ...m, dislikes: [...m.dislikes, newDislike] }
                                  : m
                              ));
                            }
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div>
              <h2 className="section-title">Recipe Collection</h2>
              
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: '500', color: '#16a34a', marginBottom: '12px' }}>Add Favorite Recipe</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={newRecipeName}
                      onChange={(e) => setNewRecipeName(e.target.value)}
                      placeholder="Recipe name"
                      className="form-input"
                    />
                  </div>
                  <div style={{ minWidth: '120px' }}>
                    <input
                      type="number"
                      value={newRecipeCookTime}
                      onChange={(e) => setNewRecipeCookTime(parseInt(e.target.value))}
                      placeholder="Cook time (min)"
                      className="form-input"
                    />
                  </div>
                  <button
                    onClick={addRecipe}
                    className="btn btn-success"
                  >
                    <Plus />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontWeight: '500', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart style={{ color: '#dc2626' }} />
                    <span>Your Favorite Recipes</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {favoriteRecipes.map(recipe => (
                      <div key={recipe.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h4 style={{ fontWeight: '500', margin: 0 }}>{recipe.name}</h4>
                          <Heart style={{ color: '#dc2626' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock />
                            <span>{recipe.cookTime} min</span>
                          </span>
                          <span className="badge badge-blue">
                            {recipe.difficulty}
                          </span>
                          <span className="badge badge-purple">
                            {recipe.nutritionType}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic', margin: '0 0 8px 0' }}>{recipe.description}</p>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontWeight: '500', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star style={{ color: '#fbbf24' }} />
                    <span>Suggested for You</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {suggestedRecipes.slice(0, 5).map(recipe => (
                      <div key={recipe.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h4 style={{ fontWeight: '500', margin: 0 }}>{recipe.name}</h4>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '14px' }}>
                            <Star />
                            <span>{recipe.matchScore}%</span>
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock />
                            <span>{recipe.cookTime} min</span>
                          </span>
                          <span className="badge badge-blue">
                            {recipe.difficulty}
                          </span>
                          <span className="badge badge-purple">
                            {recipe.nutritionType}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic', margin: '0 0 8px 0' }}>{recipe.description}</p>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                          <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                        </div>
                        <button 
                          style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                          onClick={() => {
                            setFavoriteRecipes([...favoriteRecipes, { ...recipe, id: Date.now() }]);
                          }}
                        >
                          Add to Favorites
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shopping' && (
            <div>
              <div className="section-header">
                <h2 className="section-title">Shopping List</h2>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {shoppingList.filter(item => item.checked).length} of {shoppingList.length} items checked
                </div>
              </div>

              {shoppingList.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><ShoppingCart /></div>
                  <p style={{ color: '#6b7280', marginBottom: '8px' }}>No items in your shopping list yet</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>Accept some meals from your weekly plan to generate a shopping list</p>
                </div>
              ) : (
                <div className="shopping-list">
                  <div>
                    {shoppingList.map((item, index) => (
                      <div key={index} className="shopping-item">
                        <div
                          onClick={() => toggleShoppingItem(index)}
                          className={`checkbox ${item.checked ? 'checked' : ''}`}
                        >
                          {item.checked && <Check />}
                        </div>
                        <span className={item.checked ? 'text-strikethrough' : ''} style={{ flex: 1 }}>
                          {item.ingredient}
                        </span>
                        {item.count > 1 && (
                          <span className="badge badge-blue">
                           {item.count} meals
                         </span>
                       )}
                     </div>
                   ))}
                 </div>
                 
                 <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                     <span style={{ color: '#6b7280' }}>
                       Shopping for {Object.keys(acceptedMeals).length} accepted meals
                     </span>
                     <button style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                       Export List
                     </button>
                   </div>
                 </div>
               </div>
             )}
           </div>
         )}

         {activeTab === 'settings' && (
           <div>
             <h2 className="section-title">App Settings</h2>
             
             <div style={{ marginBottom: '24px' }}>
               <div className="settings-section">
                 <h3 style={{ fontWeight: '500', marginBottom: '16px' }}>Nutrition Preferences</h3>
                 <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                   Tell us about your family's nutrition priorities to get better meal suggestions
                 </p>
                 
                 <div className="form-group">
                   <label className="form-label">Primary Nutrition Focus</label>
                   <select
                     value={nutritionPreferences.priority}
                     onChange={(e) => setNutritionPreferences(prev => ({ ...prev, priority: e.target.value }))}
                     className="form-select"
                   >
                     <option value="protein-dominant">Protein-Dominant</option>
                     <option value="balanced">Balanced</option>
                     <option value="low-carb">Low-Carb</option>
                     <option value="vegetarian">Vegetarian</option>
                     <option value="any">Any (No Preference)</option>
                   </select>
                 </div>
               </div>

               <div className="settings-section">
                 <h3 style={{ fontWeight: '500', marginBottom: '16px' }}>Calendar Integration</h3>
                 <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                   Connect your Google Calendar to automatically plan meals based on your schedule
                 </p>
                 
                 <div style={{ marginBottom: '16px' }}>
                   <label className="form-label">Daily Meal Prep Start Time</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                     <input
                       type="time"
                       value={mealPrepStartTime}
                       onChange={(e) => setMealPrepStartTime(e.target.value)}
                       className="form-input"
                       style={{ width: '140px' }}
                     />
                     <span style={{ fontSize: '14px', color: '#6b7280' }}>
                       The app will check your calendar from this time onwards to determine available cooking time
                     </span>
                   </div>
                 </div>
                 
                 <button className="btn btn-primary" style={{ marginBottom: '8px' }}>
                   <Calendar />
                   <span>Connect Google Calendar</span>
                 </button>
                 <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                   Note: In this demo, sample calendar data is used. In a real deployment, this would connect to your actual Google Calendar and use your meal prep start time to calculate available cooking windows.
                 </p>
               </div>

               <div className="settings-section">
                 <h3 style={{ fontWeight: '500', marginBottom: '16px' }}>Suggestion Balance</h3>
                 <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                   Control how often the app suggests your favorite recipes vs. new recommendations
                 </p>
                 
                 <div style={{ marginBottom: '16px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontSize: '14px', color: '#374151' }}>Favorite Recipes</span>
                     <span style={{ fontSize: '14px', fontWeight: '500' }}>{suggestionRatio}%</span>
                   </div>
                   <input
                     type="range"
                     min="0"
                     max="100"
                     value={suggestionRatio}
                     onChange={(e) => setSuggestionRatio(parseInt(e.target.value))}
                     className="slider"
                   />
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                     <span style={{ fontSize: '14px', color: '#374151' }}>New Suggestions</span>
                     <span style={{ fontSize: '14px', fontWeight: '500' }}>{100 - suggestionRatio}%</span>
                   </div>
                 </div>
               </div>

               <div className="settings-section">
                 <h3 style={{ fontWeight: '500', marginBottom: '16px' }}>Notification Preferences</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                     <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                     <span style={{ color: '#374151' }}>Daily meal reminders</span>
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                     <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                     <span style={{ color: '#374151' }}>Shopping list notifications</span>
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                     <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                     <span style={{ color: '#374151' }}>Recipe suggestions</span>
                   </label>
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default FamilyMealPlanner;