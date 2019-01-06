
function Point(coordinates, size){
    if (typeof size !== "undefined"){
        THREE.Mesh.call(this, new THREE.SphereGeometry(size, 12, 12), Point.DEFAULT_MAT);
    }
    else {
        THREE.Mesh.call(this, Point.DEFAULT_GEO, Point.DEFAULT_MAT);
    }
    if (typeof coordinates !== "undefined"){
        this.position.set(...coordinates);
    }

    // Temporary Material memory used for highlighting.
    this.pastMaterial = Point.DEFAULT_MAT;
}

Point.prototype = Object.create(THREE.Mesh.prototype);
Point.prototype.constructor = Point;


Point.DEFAULT_GEO = new THREE.SphereGeometry(0.02, 12, 12);
Point.DEFAULT_MAT = new THREE.MeshBasicMaterial({
    color: 0x3388ff,
    side: THREE.FrontSide,
    transparent: true,
    opacity:0.8
});
Point.DEFAULT_HIGHLIGHT_MAT = new THREE.MeshBasicMaterial({
    color: 0x555555,
    side: THREE.FrontSide
});

Point.prototype.highlight = function(material) {
    this.pastMaterial = this.material;

    if (typeof material === "undefined") {
        this.material = Point.DEFAULT_HIGHLIGHT_MAT;
    }
    else {
        this.material = material;
    }
}

Point.prototype.unHighlight = function() {
    this.material = this.pastMaterial;
}

Point.prototype.setScale = function(scale) {
    this.scale.set(scale, scale, scale);
}

