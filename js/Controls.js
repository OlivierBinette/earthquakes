
/**
 * Controls used to rotate <target> and adjust the FOV of the camera.
 */
function Controls(target, camera, renderer, domElement) {
    this.target = target;
    this.camera = camera;
    this.renderer = renderer;
    this.domElement = domElement;

    this.fovScale = 1;
    this.maxfov = 40;
    this.zoom = 0;

    // Flag for dragging action.
    this.dragging = false;

    this.mousePosition = {x:0, y:0};
    this.pastMousePosition = {x:0, y:0};
}

    Controls.prototype.handleMouseMove = function(event) {
        let posX = (event.clientX || event.targetTouches[0].pageX);
        let posY = (event.clientY || event.targetTouches[0].pageY);

        let tooltip = document.getElementById("tooltip");
        tooltip.style.left = (posX + tooltip.clientWidth < document.body.clientWidth)? posX:document.body.clientWidth-tooltip.clientWidth;
        tooltip.style.top = (posY + tooltip.clientHeight < document.body.clientHeight)? posY:document.body.clientHeight-tooltip.clientHeight;

        this.mousePosition.x = 2 * posX / window.innerWidth - 1;
        this.mousePosition.y = 1 - 2 * posY / window.innerHeight;

        if(this.dragging){
            dx = this.mousePosition.x - this.pastMousePosition.x;
            dy = this.mousePosition.y - this.pastMousePosition.y;

            var len = Math.sqrt(dx*dx + dy*dy);
            var axis = {x:0, y:0, z:0}
            var quat = new THREE.Quaternion();
            if(len > 0) {
                axis.y = dx/len;
                axis.x = -dy/len;
                axis.z = 0;
                quat.setFromAxisAngle(axis, Math.PI * this.fovScale * len);

                this.target.applyQuaternion(quat);
            }


        }

        this.pastMousePosition.x = this.mousePosition.x;
        this.pastMousePosition.y = this.mousePosition.y;

        this.onMouseMove(event);
    }

    Controls.prototype.handleMouseUp = function(event) {
        this.dragging = false;

        this.onMouseUp(event);
    }

    Controls.prototype.handleMouseDown = function(event) {
        this.dragging = true;
        this.onMouseDown(event);
    }

    Controls.prototype.handleMouseWheel = function(event) {
        event.preventDefault();
        this.zoom -= event.deltaY;
        if (this.zoom < 0) this.zoom = 0;
        if (this.zoom > 5000) zoom = 5000;
        this.fovScale = Math.exp(-this.zoom/200.0);
        this.camera.fov = this.maxfov*this.fovScale;
        this.camera.updateProjectionMatrix();

        this.onMouseWheel(event);
    }

    Controls.prototype.handleResize = function(event) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.onResize(event);
    }

    Controls.prototype.onMouseMove = function(event) {}
    Controls.prototype.onMouseDown = function(event) {}
    Controls.prototype.onMouseUp = function(event) {}
    Controls.prototype.onMouseWheel = function(event) {}
    Controls.prototype.onResize = function(event) {}

    Controls.prototype.setup = function() {
        this.domElement.addEventListener("mousemove", (e)=>this.handleMouseMove(e));
        this.domElement.addEventListener("touchmove", (e)=>this.handleMouseMove(e));
        this.domElement.addEventListener("mouseup", (e)=>this.handleMouseUp(e));
        this.domElement.addEventListener("touchend", (e)=>this.handleMouseUp(e));
        this.domElement.addEventListener("mousedown", (e)=>this.handleMouseDown(e));
        this.domElement.addEventListener("touchstart", (e)=>this.handleMouseDown(e));
        this.domElement.addEventListener("mousewheel", (e)=>this.handleMouseWheel(e));
        this.domElement.addEventListener("wheel", (e)=>this.handleMouseWheel(e));
        this.domElement.addEventListener("resize", (e)=>this.handleResize(e));
    }