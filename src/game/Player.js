import * as THREE from 'three';
import { SpriteGenerator } from './SpriteGenerator.js';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Sprite
        const texture = SpriteGenerator.createSkeletonTexture();
        const material = new THREE.SpriteMaterial({ map: texture });
        this.mesh = new THREE.Sprite(material);
        this.mesh.scale.set(3, 3, 1); // Scale up sprite
        this.scene.add(this.mesh);

        // Physics
        this.speed = 10;
        this.velocity = new THREE.Vector3();
        this.collider = new THREE.Box3();

        // Input
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Animation
        this.bobTime = 0;
    }

    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.keys.w = true; break;
            case 'a': case 'arrowleft': this.keys.a = true; break;
            case 's': case 'arrowdown': this.keys.s = true; break;
            case 'd': case 'arrowright': this.keys.d = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.keys.w = false; break;
            case 'a': case 'arrowleft': this.keys.a = false; break;
            case 's': case 'arrowdown': this.keys.s = false; break;
            case 'd': case 'arrowright': this.keys.d = false; break;
        }
    }

    reset(position) {
        this.mesh.position.copy(position);
        this.mesh.position.y = 2; // Float slightly above ground
        this.velocity.set(0, 0, 0);
    }

    update(dt, maze) {
        // Input to Velocity
        this.velocity.set(0, 0, 0);
        if (this.keys.w) this.velocity.z -= 1;
        if (this.keys.s) this.velocity.z += 1;
        if (this.keys.a) this.velocity.x -= 1;
        if (this.keys.d) this.velocity.x += 1;

        if (this.velocity.length() > 0) {
            this.velocity.normalize().multiplyScalar(this.speed * dt);

            // Bobbing
            this.bobTime += dt * 15;
            this.mesh.position.y = 2 + Math.sin(this.bobTime) * 0.2;

            // Flip sprite based on direction
            if (this.velocity.x < 0) {
                this.mesh.material.rotation = 0.2; // Tilt left
            } else if (this.velocity.x > 0) {
                this.mesh.material.rotation = -0.2; // Tilt right
            } else {
                this.mesh.material.rotation = 0;
            }
        } else {
            this.mesh.position.y = 2;
            this.mesh.material.rotation = 0;
        }

        // Move X
        this.mesh.position.x += this.velocity.x;
        if (this.checkCollisions(maze.walls)) {
            this.mesh.position.x -= this.velocity.x;
        }

        // Move Z
        this.mesh.position.z += this.velocity.z;
        if (this.checkCollisions(maze.walls)) {
            this.mesh.position.z -= this.velocity.z;
        }

        // Camera Follow (Orthographic Top-Down)
        this.camera.position.x = this.mesh.position.x;
        this.camera.position.z = this.mesh.position.z;
        this.camera.lookAt(this.mesh.position.x, 0, this.mesh.position.z);
    }

    checkCollisions(walls) {
        // Simple point collision for sprite vs box
        const playerBox = new THREE.Box3().setFromCenterAndSize(this.mesh.position, new THREE.Vector3(1, 1, 1));

        for (const wall of walls) {
            const wallCollider = new THREE.Box3().setFromObject(wall);
            if (playerBox.intersectsBox(wallCollider)) {
                return true;
            }
        }
        return false;
    }
}
