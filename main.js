
// Renderer
var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Scene
var scene = new THREE.Scene();
//scene.background = new THREE.Color( 0xffffff );

// Camera
var camera = new THREE.PerspectiveCamera( 40, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
scene.add(camera);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8) );
var light = new THREE.PointLight( 0xffffff, 0.35, 1500 );
light.position.set( 50, 25, 50 );
camera.add( light );

// Globe
var world = new THREE.Group();
var globe = new Globe();
world.add( globe );

var axisGeo = new THREE.Geometry();
axisGeo.vertices.push(
    new THREE.Vector3( 0, 1.2, 0 ),
    new THREE.Vector3( 0, -1.2, 0 ),
);
var axisMat = new THREE.LineBasicMaterial({
    color: 0xeeeeee
});
var axis = new THREE.Line(axisGeo, axisMat);
world.add(axis);

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
var depths = new THREE.Group();
var lineMat;
var ptMat1 = Point.DEFAULT_MAT.clone();
ptMat1.color.setHex(0x4B98C3);
var ptMat2 = Point.DEFAULT_MAT.clone();
ptMat2.color.setHex(0xF58D12);
var ptMat3 = Point.DEFAULT_MAT.clone();
ptMat3.color.setHex(0xC72525);
var lineMat1 = new THREE.LineBasicMaterial();
lineMat1.color.setHex(0x4B98C3);
var lineMat2 = lineMat1.clone();
lineMat2.color.setHex(0xF58D12);
var lineMat3 = lineMat1.clone();
lineMat3.color.setHex(0xC72525);
var x, y, z, phi, lambda;
data = d3.csv('quakes-small.csv', function(d){
    phi = Math.PI*d.latitude/180.0;
    lambda = Math.PI*d.longitude/180.0;
    x = Math.cos(phi) * Math.cos(lambda);
    y = Math.sin(phi);
    z = -Math.cos(phi) * Math.sin(lambda);
    var pt = new Point([x, y, z], 0.02*(d.mag**2)/64);
    pt["magnitude"] = d.mag;
    pt["place"] = d.place;
    pt["time"] = new Date(d.time);
    pt["depth"] = d.depth;

    var lineMat = new THREE.LineBasicMaterial();
    if (d.mag < 7){
        pt.material = ptMat1;
        lineMat = lineMat1;
    }
    else if (d.mag < 8){
        pt.material = ptMat2;
        lineMat = lineMat2;
    }
    else {
        pt.material = ptMat3;
        lineMat = lineMat3;
    }
    var s = 1 - d.depth / 6371.0;
    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(
        new THREE.Vector3( x, y, z ),
        new THREE.Vector3( s*x, s*y, s*z ),
    );
    depths.add(new THREE.Line(lineGeo, lineMat));
    points.add(pt);
}).then(
    function(data) {
        world.add(points);
        world.add(depths);
        scene.add(world);

        // Removing the loading indicator
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
    document.body.style.cursor = "initial";
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

        document.getElementById("tooltip_magnitude").innerHTML = intersects[0].object["magnitude"];
        var date = intersects[0].object["time"];
        document.getElementById("tooltip_date").innerHTML = MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
        document.getElementById("tooltip_depth").innerHTML = intersects[0].object["depth"] + " km";
        document.getElementById("tooltip_note").innerHTML = intersects[0].object["place"];
        document.getElementById("tooltip").style.display="block";
    }
    else {
        document.getElementById("tooltip").style.display="none";
    }
}

makeLand();

var quat = new THREE.Quaternion();
function animate() {
    var vector = new THREE.Vector3(0,1,0);
    vector.applyQuaternion(world.quaternion);
    quat.setFromAxisAngle(vector, 0.0003*controls.fovScale);
    world.applyQuaternion(quat);
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
};
animate();