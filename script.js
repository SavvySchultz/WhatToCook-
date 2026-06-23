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
const result = document.getElementById("result");

btn.addEventListener("click", () => {
  const ingredients = input.value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");

  if (ingredients.length === 0) {
    result.innerHTML = "<p>Please enter at least one ingredient.</p>";
    return;
  }

  const searchQuery = ingredients.join(" ") + " recipe";
  const pinterestUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;

  result.innerHTML = `
    <h3>Recipe search ready</h3>
    <p><strong>Searching for:</strong> ${searchQuery}</p>
    <p>Opening Pinterest in a new tab...</p>
  `;

  window.open(pinterestUrl, "_blank");
});
