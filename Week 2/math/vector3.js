/*
 * An "object" representing a 3d vector to make operations simple and concise.
 *
 * Similar to how we work with plain numbers, we will work with vectors as
 * an entity unto itself.  Note the syntax below: var Vector3 = function...
 * This is different than you might be used to in most programming languages.
 * Here, the function is meant to be instantiated rather than called and the
 * instantiation process IS similar to other object oriented languages => new Vector3()
 */

var Vector3 = function(x = 0, y = 0, z = 0) {
  this.x = x; this.y = y; this.z = z;

  // Sanity check to prevent accidentally using this as a normal function call
  if (!(this instanceof Vector3)) {
    console.error("Vector3 constructor must be called with the 'new' operator");
  }

  // todo - make sure to set a default value in case x, y, or z is not passed in
}

Vector3.prototype = {

  //----------------------------------------------------------------------------- 
  set: function(x, y, z) {
    // todo set 'this' object's values to those from x, y, and z
    this.x = x; this.y = y; this.z = z;
    return this;
  },

  //----------------------------------------------------------------------------- 
  clone: function() {
    return new Vector3(this.x, this.y, this.z);
  },

  //----------------------------------------------------------------------------- 
  copy: function(other) {
    // copy the values from other into 'this'
    this.x = other.x; this.y = other.y; this.z = other.z;
    return this;
  },

  //----------------------------------------------------------------------------- 
  negate: function() {
    // multiply 'this' vector by -1
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x *= -1; this.y *= -1; this.z *= -1;
    return this;
  },

  //----------------------------------------------------------------------------- 
  add: function(v) {
    // todo - add v to 'this' vector
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x += v.x; this.y += v.y; this.z += v.z;
    return this;
  },

  //----------------------------------------------------------------------------- 
  subtract: function(v) {
    // todo - subtract v from 'this' vector
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x -= v.x; this.y -= v.y; this.z -= v.z;
    return this;
  },

  //----------------------------------------------------------------------------- 
  multiplyScalar: function(scalar) {
    // multiply 'this' vector by "scalar"
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x *= scalar; this.y *= scalar; this.z *= scalar;
    return this;
  },

  //----------------------------------------------------------------------------- 
  length: function() {
    // todo - return the magnitude (A.K.A. length) of 'this' vector
    // This should NOT change the values of this.x, this.y, and this.z
    totalSquared = this.x * this.x + this.y * this.y + this.z * this.z;
    return Math.sqrt(totalSquared);
  },

  //----------------------------------------------------------------------------- 
  lengthSqr: function() {
    // todo - return the squared magnitude of this vector ||v||^2
    // This should NOT change the values of this.x, this.y, and this.z

    // There are many occasions where knowing the exact length is unnecessary 
    // and the square can be substituted instead (for performance reasons).  
    // This function should NOT have to take the square root of anything.
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },

  //----------------------------------------------------------------------------- 
  normalize: function() {
    // todo - Change the components of this vector so that its magnitude will equal 1.
    // This SHOULD change the values of this.x, this.y, and this.z
    magnitude = this.length();
    this.x /= magnitude; this.y /= magnitude; this.z /= magnitude;
    return this;
  },

  //----------------------------------------------------------------------------- 
  dot: function(other) {
    // todo - return the dot product betweent this vector and "other"
    // This should NOT change the values of this.x, this.y, and this.z
    return this.x * other.x + this.y * other.y + this.z * other.z;
  },


    //----------------------------------------------------------------------------- 
    fromTo: function(fromPoint, toPoint) {
      if (!(fromPoint instanceof Vector3) || !(toPoint instanceof Vector3)) {
        console.error("fromTo requires to vectors: 'from' and 'to'");
      }
      // todo - return the vector that goes from "fromPoint" to "toPoint"
      //        NOTE - "fromPoint" and "toPoint" should not be altered
    },
  
    //----------------------------------------------------------------------------- 
    rescale: function(newScale) {
      // todo - Change this vector's length to be newScale
      return this;
    },
  
    //----------------------------------------------------------------------------- 
    angle: function(v1, v2) {
      // todo - calculate the angle in degrees between vectors v1 and v2. Do NOT
      //        change any values on the vectors themselves
      return 0;
    },
  
    //----------------------------------------------------------------------------- 
    project: function(vectorToProject, otherVector) {
      // todo - return a vector that points in the same direction as "otherVector"
      //        but whose length is the projection of "vectorToProject" onto "otherVector"
      //        NOTE - "vectorToProject" and "otherVector" should NOT be altered (i.e. use clone)
      //        See "Vector Projection Slides" under "Extras" for more info.
  
    }
  };
  
   
  