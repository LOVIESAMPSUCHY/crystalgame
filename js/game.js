let selectedIngredients = [];

function selectIngredient(ingredient) {
    if (selectedIngredients.length < 3) {
        selectedIngredients.push(ingredient);
        updateReaction();
    } else {
        alert("Wybrałeś już maksymalną liczbę składników!");
    }
}

function updateReaction() {
    const reactionText = document.getElementById("reaction-text");
    if (selectedIngredients.length === 0) {
        reactionText.textContent = "Wybierz składniki, aby rozpocząć reakcję.";
    } else {
        reactionText.textContent = "Wybrane składniki: " + selectedIngredients.join(", ");
        checkReaction();
    }
}

function checkReaction() {
    const resultText = document.getElementById("result-text");
    // Przykładowa logika sprawdzania reakcji
    if (selectedIngredients.length === 3) {
        if (
            selectedIngredients.includes("chem1") &&
            selectedIngredients.includes("chem2") &&
            selectedIngredients.includes("chem3")
        ) {
            resultText.textContent = "Gratulacje! Utworzyłeś substancję!";
        } else {
            resultText.textContent = "Reakcja nieudana. Spróbuj innej kombinacji.";
        }
    } else {
        resultText.textContent = "Brak wyniku.";
    }
}

function resetGame() {
    selectedIngredients = [];
    document.getElementById("reaction-text").textContent = "Wybierz składniki, aby rozpocząć reakcję.";
    document.getElementById("result-text").textContent = "Brak wyniku.";
}