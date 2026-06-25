function showPage(pageId, clickedButton) {
  const pages = document.querySelectorAll(".page");
  const buttons = document.querySelectorAll(".tab-btn");

  pages.forEach(page => page.classList.remove("active"));
  buttons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(pageId).classList.add("active");
  clickedButton.classList.add("active");
}

const btn = document.getElementById("findRecipeBtn");
const input = document.getElementById("ingredientsInput");
const results = document.getElementById("results");
const encouragement = document.getElementById("encouragement");

const encouragementMessages = [
  "You’re doing amazing — tiny ingredients can still make a great meal 💙",
  "Cooking doesn’t have to be fancy to be delicious ✨",
  "One step at a time — you’ve got this 💜",
  "Your fridge is full of possibilities!"
];

function normalizeList(text) {
  return text
    .toLowerCase()
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function renderMealCard(meal, userIngredients) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : ""
      });
    }
  }

  const matchCount = ingredients.filter(item =>
    userIngredients.includes(item.ingredient.toLowerCase())
  ).length;

  const matchScore = Math.round((matchCount / Math.max(ingredients.length, 1)) * 100);

  return `
    <article class="recipe-card">
      <img class="recipe-image" src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="recipe-body">
        <h3>${meal.strMeal}</h3>
        <div class="match">${matchCount} match${matchCount !== 1 ? "es" : ""} • ${matchScore}%</div>
        <p><strong>Category:</strong> ${meal.strCategory || "Recipe"}</p>
        <p>${meal.strInstructions.slice(0, 160)}...</p>

        <strong>Ingredients:</strong>
        <ul>
          ${ingredients.slice(0, 6).map(item => `<li>${item.measure ? item.measure + " " : ""}${item.ingredient}</li>`).join("")}
        </ul>

        <div class="recipe-actions">
          <a class="link-btn open" href="${meal.strSource || meal.strYoutube || `https://www.themealdb.com/meal/${meal.idMeal}`}" target="_blank" rel="noopener noreferrer">View full recipe</a>
        </div>
      </div>
    </article>
  `;
}

async function searchRecipes() {
  const userIngredients = normalizeList(input.value);

  if (userIngredients.length === 0) {
    results.innerHTML = `
      <div class="empty-state">
        <h4>Please type at least one ingredient</h4>
        <p>Example: eggs, cheese, bread</p>
      </div>
    `;
    return;
  }

  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  encouragement.innerHTML = `<p>${randomMessage}</p>`;

  results.innerHTML = `
    <div class="empty-state">
      <h4>Searching recipes...</h4>
      <p>Hang tight — we’re finding tasty ideas for you.</p>
    </div>
  `;

  try {
    const queries = [...new Set(userIngredients)];
    const allMeals = new Map();

    for (const ingredient of queries.slice(0, 5)) {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
      const data = await res.json();

      if (data.meals) {
        data.meals.forEach(meal => allMeals.set(meal.idMeal, meal));
      }
    }

    const mealsArray = Array.from(allMeals.values()).slice(0, 12);

    if (mealsArray.length === 0) {
      results.innerHTML = `
        <div class="empty-state">
          <h4>No recipes found yet</h4>
          <p>Try ingredients like chicken, eggs, rice, pasta, tuna, or potatoes.</p>
        </div>
      `;
      return;
    }

    const detailedMeals = await Promise.all(
      mealsArray.map(async meal => {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const data = await res.json();
        return data.meals ? data.meals[0] : null;
      })
    );

    const finalMeals = detailedMeals.filter(Boolean);

    results.innerHTML = finalMeals.map(meal => renderMealCard(meal, userIngredients)).join("");
  } catch (error) {
    console.error(error);
    results.innerHTML = `
      <div class="empty-state">
        <h4>Oops — something went wrong</h4>
        <p>Check your internet connection and try again.</p>
      </div>
    `;
  }
}

btn.addEventListener("click", searchRecipes);
