

/**
 * Instance of THREE.Mesh.
 *
 * @constructor
 */
function Globe(){
    THREE.Mesh.call(this, Globe.DEFAULT_GEO, Globe.DEFAULT_MAT)
}

Globe.prototype = Object.create(THREE.Mesh.prototype);
Globe.prototype.constructor = Globe;

Globe.OPACITY = 0.6;
Globe.DEFAULT_GEO = new THREE.SphereGeometry(1, 128, 128);
Globe.DEFAULT_MAT = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    wireframe: false,
    transparent: true,
    opacity: Globe.OPACITY
});

/*
 * Helper member functions
 */

Globe.prototype.setOpacity = function(newOpacity){
    this.material.opacity = newOpacity;
}

Globe.prototype.setColor = function(newColor, g, b) {
    if ( newColor instanceof THREE.Color ) this.material.color = newColor;
    else this.material.color.setRGB(newColor, g, b);
}

