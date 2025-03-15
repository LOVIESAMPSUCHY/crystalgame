// Zmienne globalne
let scene, camera, renderer, controls;
let selectedIngredients = [];
let objects = []; // Tablica przechowująca obiekty 3D (np. probówki)

// Inicjalizacja sceny 3D
function init() {
    // Utworzenie sceny
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);

    // Utworzenie kamery
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Utworzenie renderera
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.8, 400);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    // Dodanie światła
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Dodanie stołu laboratoryjnego (prosta płaszczyzna)
    const tableGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -1;
    scene.add(table);

    // Animacja
    animate();
}

// Funkcja animacji
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Funkcja dodawania składników (probówek)
function addIngredient(ingredient) {
    if (selectedIngredients.length >= 3) {
        alert("Wybrałeś już maksymalną liczbę składników!");
        return;
    }

    selectedIngredients.push(ingredient);

    // Dodanie probówki 3D
    const tubeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    let tubeMaterial;
    if (ingredient === "chem1") {
        tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Czerwony
    } else if (ingredient === "chem2") {
        tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Zielony
    } else if (ingredient === "chem3") {
        tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Niebieski
    }
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.position.set(selectedIngredients.length * 2 - 4, 0, 0); // Rozmieszczenie probówek
    scene.add(tube);
    objects.push(tube);
}

// Funkcja rozpoczynająca reakcję
function startReaction() {
    const resultText = document.getElementById("result-text");
    if (selectedIngredients.length === 3) {
        if (
            selectedIngredients.includes("chem1") &&
            selectedIngredients.includes("chem2") &&
            selectedIngredients.includes("chem3")
        ) {
            resultText.textContent = "Gratulacje! Utworzyłeś substancję!";
            // Efekt reakcji (np. zmiana koloru stołu)
            const table = scene.children.find(obj => obj.geometry.type === "BoxGeometry");
            table.material.color.set(0xffff00); // Żółty stół jako efekt reakcji
        } else {
            resultText.textContent = "Reakcja nieudana. Spróbuj innej kombinacji.";
            // Efekt nieudanej reakcji (np. czerwony stół)
            const table = scene.children.find(obj => obj.geometry.type === "BoxGeometry");
            table.material.color.set(0xff0000);
        }
    } else {
        resultText.textContent = "Wybierz dokładnie 3 składniki, aby rozpocząć reakcję.";
    }
}

// Funkcja resetowania gry
function resetGame() {
    selectedIngredients = [];
    document.getElementById("result-text").textContent = "Brak wyniku.";

    // Usunięcie wszystkich probówek ze sceny
    objects.forEach(obj => scene.remove(obj));
    objects = [];

    // Przywrócenie koloru stołu
    const table = scene.children.find(obj => obj.geometry.type === "BoxGeometry");
    table.material.color.set(0x808080);
}

// Uruchomienie inicjalizacji po załadowaniu strony
window.onload = init;

// Obsługa zmiany rozmiaru okna
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth * 0.8, 400);
});