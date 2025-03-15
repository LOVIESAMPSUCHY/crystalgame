// Zmienne globalne
let scene, camera, renderer, controls;
let selectedIngredients = [];
let objects = []; // Tablica przechowująca obiekty 3D
let score = 0;
let timeLeft = 60; // Czas w sekundach
let timerInterval;
let gameActive = true;

// Inicjalizacja sceny 3D
function init() {
    // Utworzenie sceny
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333); // Ciemne tło w stylu laboratorium

    // Utworzenie kamery
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Utworzenie renderera
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.8, 400);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    // Dodanie kontroli kamery
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 20;

    // Dodanie światła
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Dodanie stołu laboratoryjnego
    const tableGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -1;
    scene.add(table);

    // Dodanie reaktora (model GLTF)
    const loader = new THREE.GLTFLoader();
    loader.load(
        'assets/models/reactor.gltf',
        (gltf) => {
            const reactor = gltf.scene;
            reactor.scale.set(1, 1, 1);
            reactor.position.set(0, 0, 0);
            scene.add(reactor);
            objects.push(reactor);
        },
        undefined,
        (error) => {
            console.error('Błąd podczas ładowania modelu reaktora:', error);
        }
    );

    // Uruchomienie licznika czasu
    startTimer();

    // Animacja
    animate();
}

// Funkcja animacji
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Funkcja dodawania składników (probówek)
function addIngredient(ingredient) {
    if (!gameActive) return;

    if (selectedIngredients.length >= 3) {
        alert("Wybrałeś już maksymalną liczbę składników!");
        return;
    }

    selectedIngredients.push(ingredient);

    // Dodanie probówki 3D (model GLTF)
    const loader = new THREE.GLTFLoader();
    loader.load(
        'assets/models/tube.gltf',
        (gltf) => {
            const tube = gltf.scene;
            tube.scale.set(0.5, 0.5, 0.5);
            tube.position.set(selectedIngredients.length * 2 - 4, 0, 0);
            let tubeMaterial;
            if (ingredient === "chem1") {
                tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Czerwony
            } else if (ingredient === "chem2") {
                tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Zielony
            } else if (ingredient === "chem3") {
                tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Niebieski
            }
            tube.traverse((child) => {
                if (child.isMesh) child.material = tubeMaterial;
            });
            scene.add(tube);
            objects.push(tube);
        },
        undefined,
        (error) => {
            console.error('Błąd podczas ładowania modelu probówki:', error);
        }
    );
}

// Funkcja rozpoczynająca reakcję
function startReaction() {
    if (!gameActive) return;

    const resultText = document.getElementById("result-text");
    if (selectedIngredients.length === 3) {
        if (
            selectedIngredients.includes("chem1") &&
            selectedIngredients.includes("chem2") &&
            selectedIngredients.includes("chem3")
        ) {
            resultText.textContent = "Gratulacje! Utworzyłeś substancję!";
            score += 10;
            document.getElementById("score").textContent = score;
            addParticleEffect(); // Efekt wizualny
            playSound('assets/sounds/reaction.mp3'); // Efekt dźwiękowy
        } else {
            resultText.textContent = "Reakcja nieudana. Ryzyko eksplozji!";
            if (Math.random() < 0.3) { // 30% szans na eksplozję
                gameOver("Eksplozja zniszczyła laboratorium!");
                addExplosionEffect();
                playSound('assets/sounds/explosion.mp3');
            }
        }

        // Losowe ryzyko nalotu policji
        if (Math.random() < 0.1) { // 10% szans na nalot
            gameOver("Nalot policji! Gra zakończona!");
            playSound('assets/sounds/police_siren.mp3');
        }
    } else {
        resultText.textContent = "Wybierz dokładnie 3 składniki, aby rozpocząć reakcję.";
    }
}

// Funkcja resetowania gry
function resetGame() {
    if (!gameActive) {
        gameActive = true;
        timeLeft = 60;
        document.getElementById("timer").textContent = timeLeft;
        startTimer();
    }

    selectedIngredients = [];
    document.getElementById("result-text").textContent = "Brak wyniku.";
    score = 0;
    document.getElementById("score").textContent = score;

    // Usunięcie wszystkich probówek ze sceny
    objects.forEach(obj => scene.remove(obj));
    objects = [];

    // Przywrócenie koloru stołu
    const table = scene.children.find(obj => obj.geometry && obj.geometry.type === "BoxGeometry");
    if (table) table.material.color.set(0x808080);
}

// Funkcja licznika czasu
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (gameActive) {
            timeLeft--;
            document.getElementById("timer").textContent = timeLeft;
            if (timeLeft <= 0) {
                gameOver("Czas się skończył!");
            }
        }
    }, 1000);
}

// Funkcja zakończenia gry
function gameOver(message) {
    gameActive = false;
    clearInterval(timerInterval);
    document.getElementById("result-text").textContent = message;
}

// Funkcja dodawania efektu cząsteczek (reakcja udana)
function addParticleEffect() {
    const particleCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2; // x
        positions[i + 1] = Math.random() * 2; // y
        positions[i + 2] = (Math.random() - 0.5) * 2; // z
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 0.1 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animacja cząsteczek (usunięcie po 2 sekundach)
    setTimeout(() => {
        scene.remove(particles);
    }, 2000);
}

// Funkcja dodawania efektu eksplozji
function addExplosionEffect() {
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 5; // x
        positions[i + 1] = Math.random() * 5; // y
        positions[i + 2] = (Math.random() - 0.5) * 5; // z
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xff4500, size: 0.2 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animacja eksplozji (usunięcie po 1 sekundzie)
    setTimeout(() => {
        scene.remove(particles);
    }, 1000);
}

// Funkcja odtwarzania dźwięku
function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}

// Uruchomienie inicjalizacji po załadowaniu strony
window.onload = init;

// Obsługa zmiany rozmiaru okna
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth * 0.8, 400);
});