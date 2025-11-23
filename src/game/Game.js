import * as THREE from 'three';
import { Maze } from './Maze.js';
import { Player } from './Player.js';
import { Turkey } from './Turkey.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();

        // Orthographic Camera for 2D Top-Down view
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

        // Fix for looking straight down: Change UP vector
        this.camera.up.set(0, 0, -1); // Screen UP is World -Z (North)
        this.camera.position.set(42, 50, 42); // Center of 21x4 maze (21*4/2 = 42)
        this.camera.lookAt(42, 0, 42);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x333333); // Darker background for 2D
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        // UI
        this.createUI();

        // Components
        this.maze = new Maze(this.scene);
        this.player = new Player(this.scene, this.camera);
        this.turkeys = [];

        // State
        this.clock = new THREE.Clock();
        this.score = 0;
        this.timeLeft = 120; // 2 minutes
        this.gameOver = false;

        // Bindings
        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.init();
    }

    createUI() {
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '20px';
        this.uiContainer.style.left = '20px';
        this.uiContainer.style.color = 'white';
        this.uiContainer.style.fontFamily = 'Arial, sans-serif';
        this.uiContainer.style.fontSize = '24px';
        this.uiContainer.style.textShadow = '2px 2px 0 #000';
        document.body.appendChild(this.uiContainer);

        this.timerElement = document.createElement('div');
        this.uiContainer.appendChild(this.timerElement);

        this.scoreElement = document.createElement('div');
        this.uiContainer.appendChild(this.scoreElement);

        this.messageElement = document.createElement('div');
        this.messageElement.style.position = 'absolute';
        this.messageElement.style.top = '50%';
        this.messageElement.style.left = '50%';
        this.messageElement.style.transform = 'translate(-50%, -50%)';
        this.messageElement.style.color = 'white';
        this.messageElement.style.fontSize = '48px';
        this.messageElement.style.fontWeight = 'bold';
        this.messageElement.style.textShadow = '4px 4px 0 #000';
        this.messageElement.style.display = 'none';
        document.body.appendChild(this.messageElement);
    }

    init() {
        this.maze.generate();
        this.player.reset(this.maze.getStartPosition());

        // Spawn Turkeys
        for (let i = 0; i < 10; i++) {
            const pos = this.maze.getRandomFreePosition();
            const turkey = new Turkey(this.scene, pos);
            this.turkeys.push(turkey);
        }

        this.animate();
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if (this.gameOver) return;

        requestAnimationFrame(this.animate.bind(this));

        const dt = this.clock.getDelta();
        this.timeLeft -= dt;

        if (this.timeLeft <= 0) {
            this.endGame("Time's Up! Game Over!");
            return;
        }

        // Update UI
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60).toString().padStart(2, '0');
        this.timerElement.innerText = `Time: ${minutes}:${seconds}`;
        this.scoreElement.innerText = `Turkeys Caught: ${this.score}`;

        this.player.update(dt, this.maze);

        // Update Turkeys and Check Collisions
        for (let i = this.turkeys.length - 1; i >= 0; i--) {
            const turkey = this.turkeys[i];
            turkey.update(dt, this.maze, this.player.mesh.position);

            // Collision with Player
            const dist = this.player.mesh.position.distanceTo(turkey.mesh.position);
            if (dist < 1.0) {
                // Caught!
                this.scene.remove(turkey.mesh);
                this.turkeys.splice(i, 1);
                this.score++;
            }
        }

        // Check Win Condition (Exit)
        const exitPos = this.maze.getExitPosition();
        if (this.player.mesh.position.distanceTo(exitPos) < 2.0) {
            this.endGame(`You Escaped! Score: ${this.score}`);
        }

        this.renderer.render(this.scene, this.camera);
    }

    endGame(message) {
        this.gameOver = true;
        this.messageElement.innerText = message;
        this.messageElement.style.display = 'block';
    }
}
