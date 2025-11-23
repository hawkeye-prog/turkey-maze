import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export class Maze {
    constructor(scene) {
        this.scene = scene;
        this.width = 21; // Larger odd number for more variety
        this.height = 21;
        this.cellSize = 4;
        this.grid = []; // 1 = wall, 0 = path
        this.walls = [];
    }

    generate() {
        // Initialize grid with walls
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 1;
            }
        }

        // DFS Algorithm
        const stack = [];
        const startX = 1;
        const startY = 1;
        this.grid[startY][startX] = 0;
        stack.push({ x: startX, y: startY });

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.x, current.y);

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                // Remove wall between
                this.grid[current.y + (next.y - current.y) / 2][current.x + (next.x - current.x) / 2] = 0;
                this.grid[next.y][next.x] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }

        // Ensure exit
        this.grid[this.height - 2][this.width - 1] = 0; // Exit on the right side

        this.render();
    }

    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -2 }, // Up
            { x: 0, y: 2 },  // Down
            { x: -2, y: 0 }, // Left
            { x: 2, y: 0 }   // Right
        ];

        for (const dir of directions) {
            const nx = x + dir.x;
            const ny = y + dir.y;

            if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1 && this.grid[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny });
            }
        }
        return neighbors;
    }

    render() {
        // Floor
        const floorGeo = new THREE.PlaneGeometry(this.width * this.cellSize, this.height * this.cellSize);
        const floorMat = new THREE.MeshToonMaterial({ color: 0x228B22 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set((this.width * this.cellSize) / 2 - this.cellSize / 2, 0, (this.height * this.cellSize) / 2 - this.cellSize / 2);
        this.scene.add(floor);

        // Walls
        const wallGeo = new RoundedBoxGeometry(this.cellSize, 2, this.cellSize, 4, 0.5); // Rounded
        const wallMat = new THREE.MeshToonMaterial({ color: 0x555555 }); // Dark Grey Walls

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 1) {
                    const wall = new THREE.Mesh(wallGeo, wallMat);
                    wall.position.set(x * this.cellSize, 1, y * this.cellSize);
                    this.scene.add(wall);
                    this.walls.push(wall); // Keep track for collision
                }
            }
        }
    }

    getStartPosition() {
        return new THREE.Vector3(1 * this.cellSize, 1, 1 * this.cellSize);
    }

    getExitPosition() {
        return new THREE.Vector3((this.width - 1) * this.cellSize, 1, (this.height - 2) * this.cellSize);
    }

    getRandomFreePosition() {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.width);
            y = Math.floor(Math.random() * this.height);
        } while (this.grid[y][x] === 1 || (x === 1 && y === 1)); // Avoid walls and start pos

        return new THREE.Vector3(x * this.cellSize, 1, y * this.cellSize);
    }
}
