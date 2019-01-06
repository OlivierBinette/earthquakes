
Srand.seed(1);

/**
 * Returns a normal variate using th Box-Muller transform.
 */
function rnorm() {
    var u = Srand.random(), v = Srand.random();
    while(u === 0) u = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}