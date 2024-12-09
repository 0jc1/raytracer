// -------------------------
// Utility Vector Class
// -------------------------
class Vec3 {
    constructor(x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    mul(t) {
        return new Vec3(this.x * t, this.y * t, this.z * t);
    }

    div(t) {
        return new Vec3(this.x / t, this.y / t, this.z / t);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    length() {
        return Math.sqrt(this.dot(this));
    }

    normalize() {
        let len = this.length();
        return this.div(len);
    }
}

// -------------------------
// Ray Class
// -------------------------
class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    pointAtParameter(t) {
        return this.origin.add(this.direction.mul(t));
    }
}

// -------------------------
// Sphere Class
// -------------------------
class Sphere {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }

    // Returns t if ray hits sphere, else -1
    hit(ray) {
        let oc = ray.origin.sub(this.center);
        let a = ray.direction.dot(ray.direction);
        let b = 2.0 * oc.dot(ray.direction);
        let c = oc.dot(oc) - this.radius * this.radius;
        let discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            return -1.0; // no hit
        } else {
            return (-b - Math.sqrt(discriminant)) / (2.0 * a);
        }
    }
}

// -------------------------
// Helper Functions
// -------------------------
function color(ray, sphere) {
    // Check if ray hits the sphere
    let t = sphere.hit(ray);
    if (t > 0.0) {
        // If it hits, let's color it
        // We'll use a simple shading: the normal vector from the sphere hit point.
        let hitPoint = ray.pointAtParameter(t);
        let normal = hitPoint.sub(sphere.center).normalize();
        // Convert normal from [-1,1] range to a color [0,1]
        let r = 0.5 * (normal.x + 1.0);
        let g = 0.5 * (normal.y + 1.0);
        let b = 0.5 * (normal.z + 1.0);
        return new Vec3(r, g, b);
    }

    // If no hit, draw a gradient background:
    // direction normalized will have -1 < y < 1 typically, 
    // we transform this to a range for our background blend
    let unitDirection = ray.direction.normalize();
    t = 0.5 * (unitDirection.y + 1.0);
    // Blend between white (1,1,1) and a sky color (0.5,0.7,1.0)
    let white = new Vec3(1.0, 1.0, 1.0);
    let sky = new Vec3(0.5, 0.7, 1.0);
    return white.mul(1.0 - t).add(sky.mul(t));
}

// -------------------------
// Main Rendering
// -------------------------
window.onload = function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    // Camera setup:
    // We'll define a simple camera looking at -Z.
    // We'll assume the camera is at the origin (0,0,0).
    // We'll define the viewport size in "world space" units.
    let lowerLeftCorner = new Vec3(-2.0, -1.0, -1.0);
    let horizontal = new Vec3(4.0, 0.0, 0.0);
    let vertical = new Vec3(0.0, 2.0, 0.0);
    let origin = new Vec3(0.0, 0.0, 0.0);

    // Define a single sphere
    let sphere = new Sphere(new Vec3(0,0,-1), 0.5);

    let imageData = ctx.getImageData(0, 0, width, height);
    let pixels = imageData.data;

    // Render loop
    for (let j = height - 1; j >= 0; j--) {
        for (let i = 0; i < width; i++) {
            let u = i / (width - 1);
            let v = j / (height - 1);

            // Construct the ray for pixel (i,j)
            let dir = lowerLeftCorner.add(horizontal.mul(u)).add(vertical.mul(v)).sub(origin);
            let r = new Ray(origin, dir);

            let col = color(r, sphere);

            // Convert to [0,255] and write to pixel buffer
            let pixelIndex = ((height - 1 - j) * width + i) * 4; 
            pixels[pixelIndex + 0] = Math.floor(255.99 * col.x);
            pixels[pixelIndex + 1] = Math.floor(255.99 * col.y);
            pixels[pixelIndex + 2] = Math.floor(255.99 * col.z);
            pixels[pixelIndex + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
};
