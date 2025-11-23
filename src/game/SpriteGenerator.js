import * as THREE from 'three';

export class SpriteGenerator {
    static createSkeletonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, 128, 128);

        // Skull
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(64, 30, 20, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(58, 30, 4, 0, Math.PI * 2);
        ctx.arc(70, 30, 4, 0, Math.PI * 2);
        ctx.fill();

        // Ribs / Body
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(64, 50);
        ctx.lineTo(64, 100); // Spine
        ctx.stroke();

        // Ribs
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(44, 60 + i * 10);
            ctx.lineTo(84, 60 + i * 10);
            ctx.stroke();
        }

        // Arms
        ctx.beginPath();
        ctx.moveTo(40, 60);
        ctx.lineTo(64, 55);
        ctx.lineTo(88, 60);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        return texture;
    }

    static createTurkeyTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, 128, 128);

        // Body (Brown Circle)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(64, 70, 30, 0, Math.PI * 2);
        ctx.fill();

        // Tail Feathers (Fan)
        ctx.fillStyle = '#CD853F'; // Peru
        ctx.beginPath();
        ctx.arc(64, 70, 50, Math.PI, Math.PI * 2);
        ctx.fill();

        // Head (Red/Blue)
        ctx.fillStyle = '#A52A2A'; // Brown
        ctx.beginPath();
        ctx.arc(64, 40, 15, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(64, 40);
        ctx.lineTo(75, 45);
        ctx.lineTo(64, 50);
        ctx.fill();

        // Wattle (Red thing)
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(60, 50, 5, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        return texture;
    }

    static loadTextureWithRemovedBackground(url) {
        const texture = new THREE.Texture();
        const loader = new THREE.ImageLoader();

        loader.load(url, (image) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // If white (or close to white)
                if (r > 240 && g > 240 && b > 240) {
                    data[i + 3] = 0; // Alpha 0
                }
            }

            ctx.putImageData(imageData, 0, 0);

            texture.image = canvas;
            texture.needsUpdate = true;
        });

        return texture;
    }
}
