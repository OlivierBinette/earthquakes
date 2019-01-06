/*
 Code from https://beta.observablehq.com/@mbostock/geojson-in-three-js.
 */

function vertex([longitude, latitude], radius) {
    const lambda = longitude * Math.PI / 180;
    const phi = latitude * Math.PI / 180;
    return new THREE.Vector3(
        radius * Math.cos(phi) * Math.cos(lambda),
        radius * Math.sin(phi),
        -radius * Math.cos(phi) * Math.sin(lambda)
    );
}

function wireframe(multilinestring, radius, material) {
    const geometry = new THREE.Geometry();
    for (const P of multilinestring.coordinates) {
        for (let p0, p1 = vertex(P[0], radius), i = 1; i < P.length; ++i) {
            geometry.vertices.push(p0 = p1, p1 = vertex(P[i], radius));
        }
    }
    return new THREE.LineSegments(geometry, material);
}

async function makeLand() {
    const response = await fetch("https://unpkg.com/world-atlas@1.1.4/world/50m.json");
    const topology = await response.json();
    const mesh = topojson.mesh(topology, topology.objects.land);
    const land = wireframe(mesh, 1, new THREE.LineBasicMaterial({color: 0xffffff}));
    world.add(land);
}