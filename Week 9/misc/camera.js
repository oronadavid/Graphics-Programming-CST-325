function Camera(input) {
    // The following two parameters will be used to automatically create the cameraWorldMatrix in this.update()
    this.cameraYaw = 0;
    this.cameraPosition = new Vector3();

    this.cameraWorldMatrix = new Matrix4();

    // -------------------------------------------------------------------------
    this.getViewMatrix = function() {
        return this.cameraWorldMatrix.clone().inverse();
    }

    // -------------------------------------------------------------------------
    this.getForward = function() {
        // todo #6 - pull out the forward direction from the world matrix and return as a vector
        //         - recall that the camera looks in the "backwards" direction
        return new Vector3(
            this.cameraWorldMatrix.elements[3],
            this.cameraWorldMatrix.elements[7],
            this.cameraWorldMatrix.elements[11]);
    }
    // -------------------------------------------------------------------------
    this.update = function(dt) {
        var currentForward = this.getForward();
        var movementPerSecond = 1;

        if (input.up) {
            // todo #7 - move the camera position a little bit in its forward direction
            this.cameraPosition = currentForward.add(new Vector3(0, 0, -.05));
            // this.cameraPosition.add(currentForward.multiplyScalar(movementPerSecond * dt));
        }

        if (input.down) {
            // todo #7 - move the camera position a little bit in its backward direction
            // this.cameraPosition.subtract(currentForward.multiplyScalar(movementPerSecond * dt));
            this.cameraPosition = currentForward.add(new Vector3(0, 0, .05));
        }

        if (input.left) {
            // todo #8 - add a little bit to the current camera yaw
            this.cameraYaw += 1;
        }

        if (input.right) {
            // todo #8 - subtract a little bit from the current camera yaw
            this.cameraYaw -= 1;
        }

        // todo #7 - create the cameraWorldMatrix from scratch based on this.cameraPosition
        this.cameraWorldMatrix.makeTranslation(this.cameraPosition)
            .multiply(new Matrix4().makeRotationY(this.cameraYaw));

        // todo #8 - create a rotation matrix based on cameraYaw and apply it to the cameraWorldMatrix
        // (order matters!)
    }
}

// EOF 00100001-10