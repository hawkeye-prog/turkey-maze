import * as THREE from 'three';
import { SpriteGenerator } from './SpriteGenerator.js';

export class Turkey {
    constructor(scene, position) {
        this.scene = scene;

        // Textures
        this.normalMap = SpriteGenerator.loadTextureWithRemovedBackground('turkey_walking.png');
        this.fanningMap = SpriteGenerator.loadTextureWithRemovedBackground('turkey_fanning.png');

        // Sprite
        const material = new THREE.SpriteMaterial({ map: this.normalMap });
        this.mesh = new THREE.Sprite(material);
        this.mesh.scale.set(2, 2, 1);
        this.mesh.position.copy(position);
        this.mesh.position.y = 1.5;
        this.scene.add(this.mesh);

        // Physics
        this.speed = 3;
        this.velocity = new THREE.Vector3();
        this.collider = new THREE.Box3();

        // AI State
        this.changeDirTimer = 0;
        this.chooseRandomDirection();
        this.isFanning = false;
        this.fanningTimer = 0;

        // Animation
        this.time = Math.random() * 100;
    }

    chooseRandomDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.velocity.set(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(this.speed);
        this.changeDirTimer = Math.random() * 2 + 1; // 1-3 seconds
    }

    update(dt, maze, playerPosition) {
        this.time += dt * 10;

        // Proximity Check
        const dist = this.mesh.position.distanceTo(playerPosition);
        if (dist < 5 && !this.isFanning) {
            this.startFanning();
        } else if (dist >= 5 && this.isFanning) {
            this.stopFanning();
        }

        // Wobble Animation (Scale)
        const s = 2 + Math.sin(this.time) * 0.2;
        this.mesh.scale.set(s, s, 1);

        if (!this.isFanning) {
            this.changeDirTimer -= dt;
            if (this.changeDirTimer <= 0) {
                this.chooseRandomDirection();
            }

            // Move X
            this.mesh.position.x += this.velocity.x * dt;
            if (this.checkCollisions(maze.walls)) {
                this.mesh.position.x -= this.velocity.x * dt;
                this.velocity.x *= -1; // Bounce
            }

            // Move Z
            this.mesh.position.z += this.velocity.z * dt;
            if (this.checkCollisions(maze.walls)) {
                this.mesh.position.z -= this.velocity.z * dt;
                this.velocity.z *= -1; // Bounce
            }
        }
    }

    startFanning() {
        this.isFanning = true;
        this.mesh.material.map = this.fanningMap;
        this.gobble();
    }

    stopFanning() {
        this.isFanning = false;
        this.mesh.material.map = this.normalMap;
    }

    gobble() {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance("Gobble gobble!");
            utterance.rate = 1.5;
            utterance.pitch = 1.5;
            window.speechSynthesis.speak(utterance);
        }
    }

    checkCollisions(walls) {
        const box = new THREE.Box3().setFromCenterAndSize(this.mesh.position, new THREE.Vector3(1, 1, 1));
        for (const wall of walls) {
            const wallCollider = new THREE.Box3().setFromObject(wall);
            if (box.intersectsBox(wallCollider)) {
                return true;
            }
        }
        return false;
    }
}
