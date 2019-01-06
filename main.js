
// Renderer
var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Scene
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

// Camera
var camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
scene.add(camera);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7) );
var light = new THREE.PointLight( 0xffffff, 0.2, 1000 );
light.position.set( 50, 25, 50 );
camera.add( light );

// Globe
var world = new THREE.Group();
var globe = new Globe();
world.add( globe );
/*
 * Points
 */

// Generating the dataset
/*var x=rnorm(), y=rnorm(), z=rnorm();
function rsphere(){
    x += 0.03*rnorm(); y+= 0.03*rnorm(); z+=0.03*rnorm();
    s = Math.sqrt(x*x + y*y + z*z);
    x = x/s; y = y/s; z = z/s;
    return [x, y, z];
}
var dataset = [];
for (var i = 0; i < 5000; i ++) dataset.push(rsphere());
*/

var points = new THREE.Group();
var x, y, z, phi, lambda;
data = d3.csv('quakes-small.csv', function(d){
    phi = Math.PI*d.latitude/180.0;
    lambda = Math.PI*d.longitude/180.0;
    x = Math.cos(phi) * Math.cos(lambda);
    y = Math.sin(phi);
    z = -Math.cos(phi) * Math.sin(lambda);
    var pt = new Point([x, y, z], 0.04*(d.mag**2)/64);
    pt["magnitude"] = d.mag;
    pt["place"] = d.place;
    pt["time"] = new Date(d.time);
    pt.material = Point.DEFAULT_MAT.clone();
    pt.material.color.setRGB(
        (d.mag**2 - 12) / 69.0,
        1 - (d.mag**2 - 12) / 69.0,
        1 - (d.mag**2 - 12) / 69.0
    );
    points.add(pt);
}).then(
    function(data) {
        world.add(points);
        scene.add(world);

        // Removing the loading indicator;
        var ind = document.getElementById("loading_indicator");
        ind.parentElement.removeChild(ind);
        animate();
    });

// Controls
var controls = new Controls(world, camera, renderer, window);
controls.onMouseWheel = function(event) {
    for (i=0; i < points.children.length; i++){
        points.children[i].setScale(controls.fovScale);
    }
    globe.setOpacity(1 - (1-Globe.OPACITY) * controls.fovScale);
    highlightPoints();
};
controls.onMouseMove = function(event) {
    highlightPoints();
};
controls.onMouseUp = function(event) {
    document.body.style.cursor = "crosshair";
}
controls.onMouseDown = function(event) {
    document.body.style.cursor = "grabbing";
}
controls.setup();

var highlighted = [];
var raycaster = new THREE.Raycaster();
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function highlightPoints(){
    // Highlighting points
    raycaster.setFromCamera(controls.mousePosition, camera);
    var intersects = raycaster.intersectObjects(points.children);

    // Unhighlighting
    for (var i = 0; i < highlighted.length; i++){
        highlighted[i].object.unHighlight();
        highlighted[i].object.setScale(controls.fovScale);
    }
    // Highlighting
    highlighted = [];
    if (intersects.length > 0) {
        intersects[0].object.highlight();
        intersects[0].object.setScale(1.25 * controls.fovScale);
        highlighted.push(intersects[0])

        document.getElementById("tooltip").style.display="block";
        document.getElementById("tooltip_magnitude").innerHTML = intersects[0].object["magnitude"];
        var date = intersects[0].object["time"];
        document.getElementById("tooltip_date").innerHTML = MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
        document.getElementById("tooltip_note").innerHTML = intersects[0].object["place"];
    }
    else {
        document.getElementById("tooltip").style.display="none";
    }
}

makeLand();

var quat = new THREE.Quaternion();
function animate() {
    quat.setFromAxisAngle({x:1/Math.sqrt(2), y:1/Math.sqrt(2), z:0}, -0.0005*controls.fovScale);
    world.applyQuaternion(quat);
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
};
animate();