(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     var hasOwn_1 = hasOwn;

var _hasDontEnumBug;
var _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) { checkDontEnum(); }

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }


        if (_hasDontEnumBug) {
            var ctor = obj.constructor,
                isProto = !!ctor && obj === ctor.prototype;

            while (key = _dontEnums[i++]) {
                // For constructor, if it is a prototype object the constructor
                // is always non-enumerable unless defined otherwise (and
                // enumerated above).  For non-prototype objects, it will have
                // to be defined on this object, since it cannot be defined on
                // any prototype objects.
                //
                // For other [[DontEnum]] properties, check if the value is
                // different than Object prototype value.
                if (
                    (key !== 'constructor' ||
                        (!isProto && hasOwn_1(obj, key))) &&
                    obj[key] !== Object.prototype[key]
                ) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    var forIn_1 = forIn;

/**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn_1(obj, function(val, key){
            if (hasOwn_1(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    var forOwn_1 = forOwn;

/**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var arguments$1 = arguments;

        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments$1[i];
            if (obj != null) {
                forOwn_1(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    var mixIn_1 = mixIn;

/**
     * Create Object using prototypal inheritance and setting custom properties.
     * - Mix between Douglas Crockford Prototypal Inheritance <http://javascript.crockford.com/prototypal.html> and the EcmaScript 5 `Object.create()` method.
     * @param {object} parent    Parent Object.
     * @param {object} [props] Object properties.
     * @return {object} Created object.
     */
    function createObject(parent, props){
        function F(){}
        F.prototype = parent;
        return mixIn_1(new F(), props);

    }
    var createObject_1 = createObject;

var _rKind = /^\[object (.*)\]$/;
var _toString = Object.prototype.toString;
var UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    var kindOf_1 = kindOf;

var hasDescriptors = true;

try {
    Object.defineProperty({}, "~", {});
    Object.getOwnPropertyDescriptor({}, "~");
} catch (e){
    hasDescriptors = false;
}

// we only need to be able to implement "toString" and "valueOf" in IE < 9
var hasEnumBug = !({valueOf: 0}).propertyIsEnumerable("valueOf");
var buggy      = ["toString", "valueOf"];

var verbs = /^constructor|inherits|mixin$/;

var implement = function(proto){
    var prototype = this.prototype;

    for (var key in proto){
        if (key.match(verbs)) { continue }
        if (hasDescriptors){
            var descriptor = Object.getOwnPropertyDescriptor(proto, key);
            if (descriptor){
                Object.defineProperty(prototype, key, descriptor);
                continue
            }
        }
        prototype[key] = proto[key];
    }

    if (hasEnumBug) { for (var i = 0; (key = buggy[i]); i++){
        var value = proto[key];
        if (value !== Object.prototype[key]) { prototype[key] = value; }
    } }

    return this
};

var prime = function(proto){

    if (kindOf_1(proto) === "Function") { proto = {constructor: proto}; }

    var superprime = proto.inherits;

    // if our nice proto object has no own constructor property
    // then we proceed using a ghosting constructor that all it does is
    // call the parent's constructor if it has a superprime, else an empty constructor
    // proto.constructor becomes the effective constructor
    var constructor = (hasOwn_1(proto, "constructor")) ? proto.constructor : (superprime) ? function(){
        return superprime.apply(this, arguments)
    } : function(){};

    if (superprime){

        mixIn_1(constructor, superprime);

        var superproto = superprime.prototype;
        // inherit from superprime
        var cproto = constructor.prototype = createObject_1(superproto);

        // setting constructor.parent to superprime.prototype
        // because it's the shortest possible absolute reference
        constructor.parent = superproto;
        cproto.constructor = constructor;
    }

    if (!constructor.implement) { constructor.implement = implement; }

    var mixins = proto.mixin;
    if (mixins){
        if (kindOf_1(mixins) !== "Array") { mixins = [mixins]; }
        for (var i = 0; i < mixins.length; i++) { constructor.implement(createObject_1(mixins[i].prototype)); }
    }

    // implement proto and return constructor
    return constructor.implement(proto)

};

var index$1 = prime;

var Vector3 = index$1({

  constructor: function Vector3(x, y, z) {
    this[0] = x || 0;
    this[1] = y || 0;
    this[2] = z || 0;
  },

  clone: function() {
    return new Vector3(this[0], this[1], this[2]);
  },

  get x() {
    return this[0];
  },

  get y() {
    return this[1];
  },

  get z() {
    return this[2];
  },

  equals: function(v3) {
    return this[0] === v3[0] && this[1] === v3[1] && this[2] === v3[2];
  },

  // three.js
  length: function() {
    return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
  },

  // three.js
  normalize: function() {
    var length = this.length();
    if (length === 0) { return new Vector3(); }
    return new Vector3(this[0] / length, this[1] / length, this[2] / length);
  },

  // three.js
  dot: function(v3) {
    return this[0] * v3[0] + this[1] * v3[1] + this[2] * v3[2];
  },

  // three.js
  cross: function(v3) {
    var x = this[0], y = this[1], z = this[2];

    return new Vector3(
      y * v3[2] - z * v3[1],
      z * v3[0] - x * v3[2],
      x * v3[1] - y * v3[0]
    );
  },

  lerp: function (v3, delta) {
    var scale1 = delta;
    var scale2 = 1 - delta;
    return v3.combine(this, scale1, scale2);
  },

  // trasform_util
  combine: function(v3, scale1, scale2) {
    var this$1 = this;

    var result = new Vector3;
    for (var i = 0; i < 3; i++) { result[i] = this$1[i] * scale1 + v3[i] * scale2; }
    return result;
  },

});

var Vector3_1 = Vector3;

var degToRad = function(degrees) {
  return degrees * Math.PI / 180;
};

var radToDeg = function(radians) {
  return radians * 180 / Math.PI;
};

var Vector4 = index$1({

  constructor: function Vector4(x, y, z, w) {
    this[0] = x || 0;
    this[1] = y || 0;
    this[2] = z || 0;
    this[3] = w || 0;
  },

  clone: function() {
    return new Vector4(this[0], this[1], this[2], this[3]);
  },

  get x() {
    return this[0];
  },

  get y() {
    return this[1];
  },

  get z() {
    return this[2];
  },

  get w() {
    return this[3];
  },

  equals: function(v3) {
    return this[0] === v3[0] && this[1] === v3[1] && this[2] === v3[2] && this[3] === v3[3];
  },

  // three.js
  length: function() {
    return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3]);
  },

  // three.js
  dot: function(v4) {
    return this[0] * v4[0] + this[1] * v4[1] + this[2] * v4[2] + this[3] * v4[3];
  },

  // three.js
  normalize: function() {
    var length = this.length();
    if (length === 0) { return new Vector4(0, 0, 0, 1); }

    var inv = 1 / length;
    return new Vector4(this[0] * inv, this[1] * inv, this[2] * inv, this[3] * inv);
  },

  // three.js
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
  // deg indicates you want the angle in degrees in the resulting Vector4
  quaternionToAngle: function(deg) {
    var v4 = this;
    // if w>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised
    if (v4[3] > 1) { v4 = v4.normalize(); }
    var w = 2 * Math.acos(v4[3]);
    var s = Math.sqrt(1 - v4[3] * v4[3]); // assuming quaternion normalised then w is less than 1, so term always positive.

    if (s < 1e-4) { // test to avoid divide by zero, s is always positive due to sqrt
      // if s close to zero then direction of axis not important
      return new Vector4(v4[0], v4[1], v4[2], w);
    } else {
      // normalise axis
      return new Vector4(v4[0] / s, v4[1] / s, v4[2] / s, deg ? radToDeg(w) : w);
    }

  },

  // three.js
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
  // deg indicates the Vector4 contains the angle in degrees
  angleToQuaternion: function(deg) {
    var angle = deg ? degToRad(this[3]) : this[3];
    var half = angle / 2, s = Math.sin(half);
    return new Vector4(this[0] * s, this[1] * s, this[2] * s, Math.cos(half));
  },

  // transform_util
  combine: function(v4, scale1, scale2) {
    var this$1 = this;

    var result = new Vector4;
    for (var i = 0; i < 4; i++) { result[i] = this$1[i] * scale1 + v4[i] * scale2; }
    return result;
  },

  lerp: function (v4, delta) {
    var scale1 = delta;
    var scale2 = 1 - delta;
    return v4.combine(this, scale1, scale2);
  },

  // transform_util
  slerp: function(v4q, delta) {
    var this$1 = this;

    var interpolated = new Vector4;

    var product = this.dot(v4q);

    // Clamp product to -1.0 <= product <= 1.0.
    product = Math.min(Math.max(product, -1), 1);

    // Interpolate angles along the shortest path. For example, to interpolate
    // between a 175 degree angle and a 185 degree angle, interpolate along the
    // 10 degree path from 175 to 185, rather than along the 350 degree path in
    // the opposite direction. This matches WebKit's implementation but not
    // the current W3C spec. Fixing the spec to match this approach is discussed
    // at:
    // http://lists.w3.org/Archives/Public/www-style/2013May/0131.html
    var scale1 = 1;
    if (product < 0) {
      product = -product;
      scale1 = -1.0;
    }

    var epsilon = 1e-5;
    if (Math.abs(product - 1.0) < epsilon) {
      for (var i = 0; i < 4; ++i) { interpolated[i] = this$1[i]; }
      return interpolated;
    }

    var denom = Math.sqrt(1 - product * product);
    var theta = Math.acos(product);
    var w = Math.sin(delta * theta) * (1 / denom);

    scale1 *= Math.cos(delta * theta) - product * w;
    var scale2 = w;

    return this.combine(v4q, scale1, scale2);
  }

});

var Vector4_1 = Vector4;

var stringify = function(array, places) {
  if (places == null || places > 20) { places = 20; }

  var strings = [];
  for (var i = 0; i < array.length; i++) { strings[i] = array[i].toFixed(10).replace(/\.?0+$/, ''); }
  return strings;
};

var TypeMask = {
    Identity: 0,
    Translate: 0x01,  //!< set if the matrix has translation
    Scale: 0x02,  //!< set if the matrix has any scale != 1
    Affine: 0x04,  //!< set if the matrix skews or rotates
    Perspective: 0x08,   //!< set if the matrix is in perspective
    All: 0xF,
    Unknown: 0x80
};

var Matrix3d = index$1({

  constructor: function Matrix3d() {
    var this$1 = this;


    // m.m11, m.m12, m.m13, m.m14,
    // m.m21, m.m22, m.m23, m.m24,
    // m.m31, m.m32, m.m33, m.m34,
    // m.m41, m.m42, m.m43, m.m44

    var values = arguments;

    if (values.length === 1) { values = values[0]; } // matrix as list

    if (!values.length) { values = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]; }

    var i = 0, j, k = 0;

    if (values.length === 6) { // 2d matrix

      var a = values[0];
      var b = values[1];
      var c = values[2];
      var d = values[3];
      var e = values[4];
      var f = values[5];

      values = [
        a, b, 0, 0,
        c, d, 0, 0,
        0, 0, 1, 0,
        e, f, 0, 1
      ];

    }

    if (values.length !== 16) { throw new Error('invalid matrix'); }

    // always 16

    for (i = 0; i < 4; i++) {
      var col = this$1[i] = [];
      for (j = 0; j < 4; j++) {
        col[j] = values[k++];
      }
    }

  },

  // get 2x3

  get a() { return this.m11; },
  get b() { return this.m12; },
  get c() { return this.m21; },
  get d() { return this.m22; },
  get e() { return this.m41; },
  get f() { return this.m42; },

  // set 2x3

  set a(value) { this.m11 = value; },
  set b(value) { this.m12 = value; },
  set c(value) { this.m21 = value; },
  set d(value) { this.m22 = value; },
  set e(value) { this.m41 = value; },
  set f(value) { this.m42 = value; },

  // get 4x4

  get m11() { return this[0][0]; },
  get m12() { return this[0][1]; },
  get m13() { return this[0][2]; },
  get m14() { return this[0][3]; },
  get m21() { return this[1][0]; },
  get m22() { return this[1][1]; },
  get m23() { return this[1][2]; },
  get m24() { return this[1][3]; },
  get m31() { return this[2][0]; },
  get m32() { return this[2][1]; },
  get m33() { return this[2][2]; },
  get m34() { return this[2][3]; },
  get m41() { return this[3][0]; },
  get m42() { return this[3][1]; },
  get m43() { return this[3][2]; },
  get m44() { return this[3][3]; },

  // set 4x4

  set m11(value) { this[0][0] = value; },
  set m12(value) { this[0][1] = value; },
  set m13(value) { this[0][2] = value; },
  set m14(value) { this[0][3] = value; },
  set m21(value) { this[1][0] = value; },
  set m22(value) { this[1][1] = value; },
  set m23(value) { this[1][2] = value; },
  set m24(value) { this[1][3] = value; },
  set m31(value) { this[2][0] = value; },
  set m32(value) { this[2][1] = value; },
  set m33(value) { this[2][2] = value; },
  set m34(value) { this[2][3] = value; },
  set m41(value) { this[3][0] = value; },
  set m42(value) { this[3][1] = value; },
  set m43(value) { this[3][2] = value; },
  set m44(value) { this[3][3] = value; },

  // get shortcuts

  get transX() { return this[3][0]; },
  get transY() { return this[3][1]; },
  get transZ() { return this[3][2]; },
  get scaleX() { return this[0][0]; },
  get scaleY() { return this[1][1]; },
  get scaleZ() { return this[2][2]; },
  get perspX() { return this[0][3]; },
  get perspY() { return this[1][3]; },
  get perspZ() { return this[2][3]; },

  // set shortcuts

  set transX(value) { this[3][0] = value; },
  set transY(value) { this[3][1] = value; },
  set transZ(value) { this[3][2] = value; },
  set scaleX(value) { this[0][0] = value; },
  set scaleY(value) { this[1][1] = value; },
  set scaleZ(value) { this[2][2] = value; },
  set perspX(value) { this[0][3] = value; },
  set perspY(value) { this[1][3] = value; },
  set perspZ(value) { this[2][3] = value; },

  // type getter

  get type() {
    var m = this;
    var mask = 0;

    if (0 !== m.perspX || 0 !== m.perspY || 0 !== m.perspZ || 1 !== m[3][3]) {
      return TypeMask.Translate | TypeMask.Scale | TypeMask.Affine | TypeMask.Perspective;
    }

    if (0 !== m.transX || 0 !== m.transY || 0 !== m.transZ) {
      mask |= TypeMask.Translate;
    }

    if (1 !== m.scaleX || 1 !== m.scaleY || 1 !== m.scaleZ) {
      mask |= TypeMask.Scale;
    }

    if (0 !== m[1][0] || 0 !== m[0][1] || 0 !== m[0][2] ||
        0 !== m[2][0] || 0 !== m[1][2] || 0 !== m[2][1]) {
          mask |= TypeMask.Affine;
    }

    return mask;
  },

  // W3C
  is2d: function() {
    var m = this;

    return m.m31 === 0 && m.m32 === 0 &&
           m.m13 === 0 && m.m14 === 0 &&
           m.m23 === 0 && m.m24 === 0 &&
           m.m33 === 1 && m.m34 === 0 &&
           m.m43 === 0 && m.m44 === 1;
  },

  equals: function(m2) {
    var m1 = this;

    return
      m1.m11 === m2.m11 && m1.m12 === m2.m12 && m1.m13 === m2.m13 && m1.m14 === m2.m14 &&
      m1.m21 === m2.m21 && m1.m22 === m2.m22 && m1.m23 === m2.m23 && m1.m24 === m2.m24 &&
      m1.m31 === m2.m31 && m1.m32 === m2.m32 && m1.m33 === m2.m33 && m1.m34 === m2.m34 &&
      m1.m41 === m2.m41 && m1.m42 === m2.m42 && m1.m43 === m2.m43 && m1.m44 === m2.m44;
  },

  clone: function() {
    var m = this;

    return new Matrix3d(
      m.m11, m.m12, m.m13, m.m14,
      m.m21, m.m22, m.m23, m.m24,
      m.m31, m.m32, m.m33, m.m34,
      m.m41, m.m42, m.m43, m.m44
    );
  },

  /**
   *  Return true if the matrix is identity.
   */
  isIdentity: function() {
    return this.type === TypeMask.Identity;
  },

  /**
   *  Return true if the matrix contains translate or is identity.
   */
  isTranslate: function() {
    return !(this.type & ~TypeMask.Translate);
  },

  /**
   *  Return true if the matrix only contains scale or translate or is identity.
   */
  isScaleTranslate: function() {
    return !(this.type & ~(TypeMask.Scale | TypeMask.Translate));
  },

  concat: function(m2) {
    var this$1 = this;

    if (this.isIdentity()) { return m2.clone(); }
    if (m2.isIdentity()) { return this.clone(); }

    var m = new Matrix3d;

    for (var j = 0; j < 4; j++) {
      for (var i = 0; i < 4; i++) {
        var value = 0;
        for (var k = 0; k < 4; k++) {
          value += this$1[k][i] * m2[j][k];
        }
        m[j][i] = value;
      }
    }

    return m;
  },

  translate: function(v3) {
    var translationMatrix = new Matrix3d;
    translationMatrix.m41 = v3[0];
    translationMatrix.m42 = v3[1];
    translationMatrix.m43 = v3[2];
    return this.concat(translationMatrix);
  },

  scale: function(v3) {
    var m = new Matrix3d;
    m.m11 = v3[0];
    m.m22 = v3[1];
    m.m33 = v3[2];
    return this.concat(m);
  },

  rotate: function(v4q) {
    var rotationMatrix = new Matrix3d;

    var x = v4q[0];
    var y = v4q[1];
    var z = v4q[2];
    var w = v4q[3];

    rotationMatrix.m11 = 1 - 2 * (y * y + z * z);
    rotationMatrix.m21 = 2 * (x * y - z * w);
    rotationMatrix.m31 = 2 * (x * z + y * w);
    rotationMatrix.m12 = 2 * (x * y + z * w);
    rotationMatrix.m22 = 1 - 2 * (x * x + z * z);
    rotationMatrix.m32 = 2 * (y * z - x * w);
    rotationMatrix.m13 = 2 * (x * z - y * w);
    rotationMatrix.m23 = 2 * (y * z + x * w);
    rotationMatrix.m33 = 1 - 2 * (x * x + y * y);

    return this.concat(rotationMatrix);
  },

  skew: function(v3) {
    var skewMatrix = new Matrix3d;

    skewMatrix[1][0] = v3[0];
    skewMatrix[2][0] = v3[1];
    skewMatrix[2][1] = v3[2];

    return this.concat(skewMatrix);
  },

  perspective: function(v4) {
    var perspectiveMatrix = new Matrix3d;

    perspectiveMatrix.m14 = v4[0];
    perspectiveMatrix.m24 = v4[1];
    perspectiveMatrix.m34 = v4[2];
    perspectiveMatrix.m44 = v4[3];

    return this.concat(perspectiveMatrix);
  },

  map: function(v4) {
    var this$1 = this;

    var result = new Vector4_1;

    for (var i = 0; i < 4; i++) {
      var value = 0;
      for (var j = 0; j < 4; j++) {
        value += this$1[j][i] * v4[j];
      }
      result[i] = value;
    }

    return result;
  },

  determinant: function() {
    if (this.isIdentity()) { return 1; }
    if (this.isScaleTranslate()) { return this[0][0] * this[1][1] * this[2][2] * this[3][3]; }

    var a00 = this[0][0];
    var a01 = this[0][1];
    var a02 = this[0][2];
    var a03 = this[0][3];
    var a10 = this[1][0];
    var a11 = this[1][1];
    var a12 = this[1][2];
    var a13 = this[1][3];
    var a20 = this[2][0];
    var a21 = this[2][1];
    var a22 = this[2][2];
    var a23 = this[2][3];
    var a30 = this[3][0];
    var a31 = this[3][1];
    var a32 = this[3][2];
    var a33 = this[3][3];

    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  },

  normalize: function() {
    var this$1 = this;

    var m44 = this.m44;
    // Cannot normalize.
    if (m44 === 0) { return false; }

    var normalizedMatrix = new Matrix3d;

    var scale = 1 / m44;

    for (var i = 0; i < 4; i++)
      { for (var j = 0; j < 4; j++)
        { normalizedMatrix[j][i] = this$1[j][i] * scale; } }

    return normalizedMatrix;
  },

  decompose: function() {
    // We'll operate on a copy of the matrix.
    var matrix = this.normalize();

    // If we cannot normalize the matrix, then bail early as we cannot decompose.
    if (!matrix) { return false; }

    var perspectiveMatrix = matrix.clone();

    var i, j;

    for (i = 0; i < 3; i++) { perspectiveMatrix[i][3] = 0; }
    perspectiveMatrix[3][3] = 1;

    // If the perspective matrix is not invertible, we are also unable to
    // decompose, so we'll bail early. Constant taken from SkMatrix44::invert.
    if (Math.abs(perspectiveMatrix.determinant()) < 1e-8) { return false; }

    var perspective;

    if (matrix[0][3] !== 0 || matrix[1][3] !== 0 || matrix[2][3] !== 0) {
      // rhs is the right hand side of the equation.
      var rightHandSide = new Vector4_1(
        matrix[0][3],
        matrix[1][3],
        matrix[2][3],
        matrix[3][3]
      );

      // Solve the equation by inverting perspectiveMatrix and multiplying
      // rightHandSide by the inverse.
      var inversePerspectiveMatrix = perspectiveMatrix.invert();
      if (!inversePerspectiveMatrix) { return false; }

      var transposedInversePerspectiveMatrix = inversePerspectiveMatrix.transpose();

      perspective = transposedInversePerspectiveMatrix.map(rightHandSide);

    } else {
      // No perspective.
      perspective = new Vector4_1(0, 0, 0, 1);
    }

    var translate = new Vector3_1;
    for (i = 0; i < 3; i++) { translate[i] = matrix[3][i]; }

    var row = [];

    for (i = 0; i < 3; i++) {
      var v3 = row[i] = new Vector3_1;
      for (j = 0; j < 3; ++j)
        { v3[j] = matrix[i][j]; }
    }

    // Compute X scale factor and normalize first row.
    var scale = new Vector3_1;
    scale[0] = row[0].length();
    row[0] = row[0].normalize();

    // Compute XY shear factor and make 2nd row orthogonal to 1st.
    var skew = new Vector3_1;
    skew[0] = row[0].dot(row[1]);
    row[1] = row[1].combine(row[0], 1.0, -skew[0]);

    // Now, compute Y scale and normalize 2nd row.
    scale[1] = row[1].length();
    row[1] = row[1].normalize();

    skew[0] /= scale[1];

    // Compute XZ and YZ shears, orthogonalize 3rd row
    skew[1] = row[0].dot(row[2]);
    row[2] = row[2].combine(row[0], 1.0, -skew[1]);
    skew[2] = row[1].dot(row[2]);
    row[2] = row[2].combine(row[1], 1.0, -skew[2]);

    // Next, get Z scale and normalize 3rd row.
    scale[2] = row[2].length();
    row[2] = row[2].normalize();
    skew[1] /= scale[2];
    skew[2] /= scale[2];

    // At this point, the matrix (in rows) is orthonormal.
    // Check for a coordinate system flip.  If the determinant
    // is -1, then negate the matrix and the scaling factors.
    var pdum3 = row[1].cross(row[2]);
    if (row[0].dot(pdum3) < 0) {
      for (i = 0; i < 3; i++) {
        scale[i] *= -1;
        for (j = 0; j < 3; ++j)
          { row[i][j] *= -1; }
      }
    }

    var quaternion = new Vector4_1(
      0.5 * Math.sqrt(Math.max(1 + row[0][0] - row[1][1] - row[2][2], 0)),
      0.5 * Math.sqrt(Math.max(1 - row[0][0] + row[1][1] - row[2][2], 0)),
      0.5 * Math.sqrt(Math.max(1 - row[0][0] - row[1][1] + row[2][2], 0)),
      0.5 * Math.sqrt(Math.max(1 + row[0][0] + row[1][1] + row[2][2], 0))
    );

    if (row[2][1] > row[1][2]) { quaternion[0] = -quaternion[0]; }
    if (row[0][2] > row[2][0]) { quaternion[1] = -quaternion[1]; }
    if (row[1][0] > row[0][1]) { quaternion[2] = -quaternion[2]; }

    return new DecomposedMatrix(perspective, translate, quaternion, skew, scale);
  },

  invert: function() {
    var a00 = this[0][0];
    var a01 = this[0][1];
    var a02 = this[0][2];
    var a03 = this[0][3];
    var a10 = this[1][0];
    var a11 = this[1][1];
    var a12 = this[1][2];
    var a13 = this[1][3];
    var a20 = this[2][0];
    var a21 = this[2][1];
    var a22 = this[2][2];
    var a23 = this[2][3];
    var a30 = this[3][0];
    var a31 = this[3][1];
    var a32 = this[3][2];
    var a33 = this[3][3];

    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    // If det is zero, we want to return false. However, we also want to return false
    // if 1/det overflows to infinity (i.e. det is denormalized). Both of these are
    // handled by checking that 1/det is finite.
    if (det === 0 || !isFinite(det)) { return false; }

    var invdet = 1.0 / det;

    b00 *= invdet;
    b01 *= invdet;
    b02 *= invdet;
    b03 *= invdet;
    b04 *= invdet;
    b05 *= invdet;
    b06 *= invdet;
    b07 *= invdet;
    b08 *= invdet;
    b09 *= invdet;
    b10 *= invdet;
    b11 *= invdet;

    return new Matrix3d(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00
    );
  },

  // W3C
  transpose: function() {
    var m = this;

    return new Matrix3d(
      m.m11, m.m21, m.m31, m.m41,
      m.m12, m.m22, m.m32, m.m42,
      m.m13, m.m23, m.m33, m.m43,
      m.m14, m.m24, m.m34, m.m44
    );
  },

  interpolation: function(matrix) {
    return new MatrixInterpolation(this, matrix);
  },

  toArray: function() {
    return this.is2d() ? this.toArray2d() : this.toArray3d();
  },

  toArray3d: function() {
    var m = this;

    return [
      m.m11, m.m12, m.m13, m.m14,
      m.m21, m.m22, m.m23, m.m24,
      m.m31, m.m32, m.m33, m.m34,
      m.m41, m.m42, m.m43, m.m44
    ];
  },

  toArray2d: function() {
    var m = this;

    return  [
      m.a, m.b,
      m.c, m.d,
      m.e, m.f
    ];
  },

  toString: function(places) {
    return this.is2d() ? this.toString2d(places) : this.toString3d(places);
  },

  toString3d: function(places) {
    return 'matrix3d(' + stringify(this.toArray3d()).join(', ') + ')';
  },

  toString2d: function(places) {
    return  'matrix(' + stringify(this.toArray2d()).join(', ') + ')';
  }

});

var DecomposedMatrix = index$1({

  constructor: function DecomposedMatrix(perspective, translate, quaternion, skew, scale) {
    this.perspective = perspective;
    this.translate = translate;
    this.quaternion = quaternion;
    this.skew = skew;
    this.scale = scale;
  },

  interpolate: function(to, delta) {
    var from = this;

    var perspective = from.perspective.lerp(to.perspective, delta);
    var translate = from.translate.lerp(to.translate, delta);
    var quaternion = from.quaternion.slerp(to.quaternion, delta);
    var skew = from.skew.lerp(to.skew, delta);
    var scale = from.scale.lerp(to.scale, delta);
    return new DecomposedMatrix(perspective, translate, quaternion, skew, scale);
  },

  compose: function() {
    return new Matrix3d()
      .perspective(this.perspective)
      .translate(this.translate)
      .rotate(this.quaternion)
      .skew(this.skew)
      .scale(this.scale);
  }

});

var MatrixInterpolation = index$1({

  constructor: function MatrixInterpolation(from, to) {
    this.matrix1 = from;
    this.matrix2 = to;
    this.from = from.decompose();
    this.to = to.decompose();
  },

  step: function(delta) {
    if (delta === 0) { return this.matrix1; }
    if (delta === 1) { return this.matrix2; }
    return this.from.interpolate(this.to, delta).compose();
  }

});

Matrix3d.Decomposed = DecomposedMatrix;
Matrix3d.Interpolation = MatrixInterpolation;

var Matrix3d_1 = Matrix3d;

var index$3 = Matrix3d_1;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var operations = createCommonjsModule(function (module, exports) {
// Transform Operations
// Some methods are ported from the Chromium source: transform.cc, transform_opertaion.cc, transform_operations.cc
'use strict';







var epsilon = 1e-4;

var tanDeg = function(degrees) {
  var radians = degrees * Math.PI / 180;
  return Math.tan(radians);
};

var TranslateOperation = exports.Translate = index$1({

  type: 'Translate',

  constructor: function TranslateOperation(v3) {
    this.value = v3 || new Vector3_1(0, 0, 0);
  },

  equals: function(translateOperation) {
    return this.value.equals(translateOperation.value);
  },

  interpolate: function(translateOperation, delta) {
    return new TranslateOperation(this.value.lerp(translateOperation.value, delta));
  },

  isIdentity: function() {
    return this.value.equals(new Vector3_1(0, 0, 0));
  },

  compose: function() {
    return new index$3().translate(this.value);
  },

  toString: function() {
    var v = this.value;
    return 'translate3d(' + [v.x + 'px', v.y + 'px', v.z + 'px'].join(', ') + ')';
  }

});

var ScaleOperation = exports.Scale = index$1({

  type: 'Scale',

  constructor: function ScaleOperation(v3) {
    this.value = v3 || new Vector3_1(1, 1, 1);
  },

  equals: function(scaleOperation) {
    return this.value.equals(scaleOperation.value);
  },

  interpolate: function(scaleOperation, delta) {
    return new ScaleOperation(this.value.lerp(scaleOperation.value, delta));
  },

  isIdentity: function() {
    return this.value.equals(new Vector3_1(1, 1, 1));
  },

  compose: function() {
    return new index$3().scale(this.value);
  },

  toString: function() {
    var v = this.value;
    return 'scale3d(' + [v.x, v.y, v.z].join(', ') + ')';
  }

});

var RotateOperation = exports.Rotate = index$1({

  type: 'Rotate',

  constructor: function RotateOperation(v4) {
    this.value = v4 || new Vector4_1(1, 1, 1, 0);
  },

  equals: function(to) {
    return this.value.equals(to.value);
  },

  interpolate: function(rotateOperation, delta) {

    var from = this.value;
    var to = rotateOperation.value;

    var fromAxis = new Vector3_1(from.x, from.y, from.z);
    var toAxis = new Vector3_1(to.x, to.y, to.z);

    if (fromAxis.equals(toAxis)) {
      return new RotateOperation(new Vector4_1(
        from.x,
        from.y,
        from.z,
        from.w * (1 - delta) + to.w * delta
      ));
    }

    var length1 = fromAxis.length();
    var length2 = toAxis.length();

    if (length1 > epsilon && length2 > epsilon) {
      var dot = fromAxis.dot(toAxis);

      var error = Math.abs(1 - (dot * dot) / (length1 * length2));
      var result = error < epsilon;
      if (result) { return new RotateOperation(new Vector4_1(
        to.x,
        to.y,
        to.z,
        // If the axes are pointing in opposite directions, we need to reverse
        // the angle.
        dot > 0 ? from.w : -from.w
      )); }
    }

    var interpolated = from.angleToQuaternion(true).slerp(to.angleToQuaternion(true));
    return new RotateOperation(interpolated.quaternionToAngle(true));
  },

  isIdentity: function() {
    return this.value.equals(new Vector4_1(1, 1, 1, 0));
  },

  compose: function() {
    return new index$3().rotate(this.value.angleToQuaternion(true));
  },

  toString: function() {
    var v = this.value;
    return 'rotate3d(' + [v.x, v.y, v.z, v.w + 'deg'].join(', ') + ')';
  }

});

var PerspectiveOperation = exports.Perspective = index$1({

  type: 'Perspective',

  constructor: function PerspectiveOperation(length) {
    this.value = length || 0;
  },

  equals: function(perspectiveOperation) {
    return this.value === perspectiveOperation.value;
  },

  interpolate: function(perspectiveOperation, delta) {
    return new PerspectiveOperation(this.value * (1 - delta) + perspectiveOperation.value * delta);
  },

  isIdentity: function() {
    return this.value === 0;
  },

  compose: function() {
    var perspectiveMatrix = new index$3;
    var value = this.value;
    if (value !== 0) { perspectiveMatrix.m34 = -1 / value; }
    return perspectiveMatrix;
  },

  toString: function() {
    return 'perspective(' + this.value + ')';
  }

});

var SkewOperation = exports.Skew = index$1({

  type: 'Skew',

  constructor: function SkewOperation(XY) {
    this.value = XY || [0, 0];
  },

  equals: function(skewOperation) {
    var array1 = this.value;
    var array2 = skewOperation.value;
    return array1[0] === array2[0] && array1[1] === array2[1];
  },

  interpolate: function(skewOperation, delta) {
    return new SkewOperation([
      this[0] * (1 - delta) + skewOperation[0] * delta,
      this[1] * (1 - delta) + skewOperation[1] * delta
    ]);
  },

  isIdentity: function() {
    var array = this.value;
    return array[0] === 0 && array[1] === 0;
  },

  compose: function() {
    var value = this.value;
    var skewMatrix = new index$3;
    skewMatrix.m21 = tanDeg(value[0]);
    skewMatrix.m12 = tanDeg(value[1]);
    return skewMatrix;
  },

  toString: function() {
    var v = this.value;
    return 'skewX(' + v[0] + ') skewY(' + v[1] + ')';
  }

});

var MatrixOperation = exports.Matrix = index$1({

  type: 'Matrix',

  constructor: function MatrixOperation(matrix, _decomposed) {
    this.value = matrix || new index$3;
    this.decomposed = _decomposed || this.value.decompose();
  },

  equals: function(matrixOperation) {
    return this.value.equals(matrixOperation.value);
  },

  interpolate: function(matrixOperation, delta) {
    var decomposed = this.decomposed.interpolate(matrixOperation.decomposed, delta);
    return new MatrixOperation(decomposed.compose(), decomposed);
  },

  isIdentity: function() {
    return this.value.isIdentity();
  },

  compose: function() {
    return this.value;
  },

  toString: function() {
    return this.value.toString();
  }

});
});

var slice_ = Array.prototype.slice;

var Transform3d$1 = index$1({

  constructor: function Transform3d(operations$$1) {
    this.operations = operations$$1 || [];
  },

  append: function(operation) {
    this.operations.push(operation);
    return this;
  },

  isIdentity: function() {
    var operations$$1 = this.operations;
    for (var i = 0; i < operations$$1.length; i++) {
      if (!operations$$1[i].isIdentity()) { return false; }
    }
    return true;
  },

  // matrix

  matrix3d: function() {
    return this.append(new operations.Matrix(new index$3(arguments)));
  },

  matrix: function(a, b, c, d, e, f) {
    return this.matrix3d(a, b, c, d, e, f);
  },

  // translate

  translate3d: function(x, y, z) {
    return this.append(new operations.Translate(new Vector3_1(x, y, z)));
  },

  translate: function(x, y) {
    if (y == null) { y = 0; }
    return this.translate3d(x, y, 0);
  },

  translateX: function(x) {
    return this.translate(x, 0);
  },

  translateY: function(y) {
    return this.translate(0, y);
  },

  translateZ: function(z) {
    return this.translate3d(0, 0, z);
  },

  // scale

  scale3d: function(x, y, z) {
    return this.append(new operations.Scale(new Vector3_1(x, y, z)));
  },

  scale: function(x, y) {
    if (y == null) { y = x; }
    return this.scale3d(x, y, 1);
  },

  scaleX: function(x) {
    return this.scale(x, 1);
  },

  scaleY: function(y) {
    return this.scale(1, y);
  },

  scaleZ: function(z) {
    return this.scale3d(1, 1, z);
  },

  // rotate

  rotate3d: function(x, y, z, angle) {
    return this.append(new operations.Rotate(new Vector4_1(x, y, z, angle)));
  },

  rotate: function(angle) {
    return this.rotate3d(0, 0, 1, angle);
  },

  rotateX: function(angle) {
    return this.rotate3d(1, 0, 0, angle);
  },

  rotateY: function(angle) {
    return this.rotate3d(0, 1, 0, angle);
  },

  rotateZ: function(angle) {
    return this.rotate3d(0, 0, 1, angle);
  },

  // skew

  skew: function(x, y) {
    if (y == null) { y = 0; }
    return this.append(new operations.Skew([x, y]));
  },

  skewX: function(x) {
    return this.skew(x, 0);
  },

  skewY: function(y) {
    return this.skew(0, y);
  },

  // perspective

  perspective: function(len) {
    return this.append(new operations.Perspective(len));
  },

  // interpolation

  interpolation: function(transform) {
    return new TransformInterpolation(this, transform);
  },

  // matrix conversion

  compose: function() {
    var matrix = new index$3;
    var operations$$1 = this.operations;
    for (var i = 0; i < operations$$1.length; i++) {
      matrix = matrix.concat(operations$$1[i].compose());
    }
    return matrix;
  },

  // string

  toString: function() {
    var string = [];
    var operations$$1 = this.operations;
    for (var i = 0; i < operations$$1.length; i++) {
      string.push(operations$$1[i].toString());
    }
    return string.join(' ');
  }

});

var TransformInterpolation = index$1({

  constructor: function TransformInterpolation(from, to) {
    var operations1 = slice_.call(from.operations);
    var operations2 = slice_.call(to.operations);

    var length1 = operations1.length, length2 = operations2.length;
    var operation1, operation2, i, interpolateTransform = true;

    if (!length1 || from.isIdentity()) {
      operations1 = [];
      for (i = 0; i < length2; i++) { operations1.push(new operations[operations2[i].type]); }
      length1 = operations1.length;
    } else if (!length2 || to.isIdentity()) {
      operations2 = [];
      for (i = 0; i < length1; i++) { operations2.push(new operations[operations1[i].type]); }
      length2 = operations2.length;
    } else if (length1 === length2) {

      for (i = 0; i < length1; i++) {
        operation1 = operations1[i];
        operation2 = operations2[i];
        var type1 = operation1.type;
        var type2 = operation2.type;

        if (type1 !== type2) {
          if (operation1.isIdentity()) {
            operations1.splice(i, 1, new operations[type2]);
          } else if (operation2.isIdentity()) {
            operations1.splice(i, 1, new operations[type1]);
          } else {
            interpolateTransform = false;
            break;
          }
        }
      }

    } else {
      interpolateTransform = false;
    }

    if (interpolateTransform) {
      this.from = operations1;
      this.to = operations2;
      this.length = length1;
    } else {
      this.from = [new operations.Matrix(from.compose())];
      this.to = [new operations.Matrix(to.compose())];
      this.length = 1;
    }

  },

  step: function(delta) {
    var this$1 = this;

    if (delta === 0) { return new Transform3d$1(this.from); }
    if (delta === 1) { return new Transform3d$1(this.to); }

    var interpolated = new Transform3d$1;

    for (var i = 0; i < this.length; i++) {
      var from = this$1.from[i];
      var to = this$1.to[i];
      var operation = from.equals(to) ? from : from.interpolate(to, delta);
      interpolated.append(operation);
    }

    return interpolated;
  }

});

Transform3d$1.Interpolation = TransformInterpolation;

var Transform3d_1 = Transform3d$1;

var index = Transform3d_1;

function cubicOut(t) {
  var f = t - 1.0;
  return f * f * f + 1.0
}

function transform$1( node,
				   ref) {
  var easing = ref.easing; if ( easing === void 0 ) easing = cubicOut;
  var scaleX = ref.scaleX; if ( scaleX === void 0 ) scaleX = 1;
  var scaleY = ref.scaleY; if ( scaleY === void 0 ) scaleY = 1;
  var scaleZ = ref.scaleZ; if ( scaleZ === void 0 ) scaleZ = 1;
  var rotateX = ref.rotateX; if ( rotateX === void 0 ) rotateX = 0;
  var rotateY = ref.rotateY; if ( rotateY === void 0 ) rotateY = 0;
  var rotateZ = ref.rotateZ; if ( rotateZ === void 0 ) rotateZ = 0;
  var translateX = ref.translateX; if ( translateX === void 0 ) translateX = 0;
  var translateY = ref.translateY; if ( translateY === void 0 ) translateY = 0;
  var translateZ = ref.translateZ; if ( translateZ === void 0 ) translateZ = 0;
  var delay = ref.delay; if ( delay === void 0 ) delay = 0;
  var duration = ref.duration; if ( duration === void 0 ) duration = 400;

  
  var el = getComputedStyle(node,null);
  var tr  =
	  el.getPropertyValue("-webkit-transform") ||
	  el.getPropertyValue("-moz-transform") ||
	  el.getPropertyValue("-ms-transform") ||
	  el.getPropertyValue("-o-transform") ||
	  el.getPropertyValue("transform");

  var or = '';
  var matrix = '';
  
  if(tr == '' || tr == "none") {
    console.log("none");
    or = new index().matrix3d(1,0,0,0,0,1,0,.000001,0,0,1,0,0,0,1,1);
  } else {
    
    if(/^matrix3d.*/.test(tr)) {
      matrix = tr.substr(9,tr.length-10).split(", ").map(parseFloat);
    } else {
      matrix = tr.substr(7,tr.length-7).split(", ").map(parseFloat);
    }
    if(matrix.length==6) {
      matrix = [
	matrix[0],
	matrix[1],
	0,
	0,
	matrix[2],
	matrix[3],
	0,
	0,
	0,
	0,
	1,
	0,
	matrix[4],
	matrix[5],
	0,
	1];
    }
    if(matrix.length!==16) {
      or = new index().matrix3d();
    } else {
      or = new index().matrix3d(matrix[0],
				      matrix[1],
				      matrix[2],
				      matrix[3],
				      matrix[4],
				      matrix[5],
				      matrix[6],
				      matrix[7],
				      matrix[8],
				      matrix[9],
				      matrix[10],
				      matrix[11],
				      matrix[12],
				      matrix[13],
				      matrix[14],
				      matrix[15] );
    }
  }
  var to = new index().
	  matrix3d().	  
	  scaleX(scaleX).
	  scaleY(scaleY).
	  scaleZ(scaleZ).
	  rotateX(rotateX).
	  rotateY(rotateY).
	  rotateZ(rotateZ).
	  translateX(translateX).
	  translateY(translateY).
	  translateZ(translateZ);
  
  var interpolation = new index.Interpolation( to, or );
  
  return {
    delay: delay,
    duration: duration,
    easing: easing,
    css: function (t) { return "-webkit-transform: " + (interpolation.step(t).compose()) + ";" +
      "-moz-transform: " + (interpolation.step(t).compose()) + ";" +
      "-ms-transform: " + (interpolation.step(t).compose()) + ";" +
      "-o-transform: " + (interpolation.step(t).compose()) + ";" +      
      "transform: " + (interpolation.step(t).compose()) + ";"; }            
  };
}

function fade ( node, ref ) {
	var delay = ref.delay; if ( delay === void 0 ) { delay = 0; }
	var duration = ref.duration; if ( duration === void 0 ) { duration = 400; }

	var o = +getComputedStyle( node ).opacity;

	return {
		delay: delay,
		duration: duration,
		css: function (t) { return ("opacity: " + (t * o)); }
	};
}

function noop() {}

function assign(target) {
	var arguments$1 = arguments;

	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments$1[i];
		for (k in source) { target[k] = source[k]; }
	}

	return target;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function linear$1(t) {
	return t;
}

function generateKeyframes(
	a,
	b,
	delta,
	duration,
	ease,
	fn,
	node,
	style
) {
	var id = '__svelte' + ~~(Math.random() * 1e9); // TODO make this more robust
	var keyframes = '@keyframes ' + id + '{\n';

	for (var p = 0; p <= 1; p += 16.666 / duration) {
		var t = a + delta * ease(p);
		keyframes += p * 100 + '%{' + fn(t) + '}\n';
	}

	keyframes += '100% {' + fn(b) + '}\n}';
	style.textContent += keyframes;

	document.head.appendChild(style);

	node.style.animation = (node.style.animation || '')
		.split(',')
		.filter(function(anim) {
			// when introing, discard old animations if there are any
			return anim && (delta < 0 || !/__svelte/.test(anim));
		})
		.concat(id + ' ' + duration + 'ms linear 1 forwards')
		.join(', ');
}

function wrapTransition(node, fn, params, intro, outgroup) {
	var obj = fn(node, params);
	var duration = obj.duration || 300;
	var ease = obj.easing || linear$1;
	var cssText;

	// TODO share <style> tag between all transitions?
	if (obj.css) {
		var style = document.createElement('style');
	}

	if (intro) {
		if (obj.css && obj.delay) {
			cssText = node.style.cssText;
			node.style.cssText += obj.css(0);
		}

		if (obj.tick) { obj.tick(0); }
	}

	return {
		t: intro ? 0 : 1,
		running: false,
		program: null,
		pending: null,
		run: function(intro, callback) {
			var program = {
				start: window.performance.now() + (obj.delay || 0),
				intro: intro,
				callback: callback
			};

			if (obj.delay) {
				this.pending = program;
			} else {
				this.start(program);
			}

			if (!this.running) {
				this.running = true;
				transitionManager.add(this);
			}
		},
		start: function(program) {
			program.a = this.t;
			program.b = program.intro ? 1 : 0;
			program.delta = program.b - program.a;
			program.duration = duration * Math.abs(program.b - program.a);
			program.end = program.start + program.duration;

			if (obj.css) {
				if (obj.delay) { node.style.cssText = cssText; }
				generateKeyframes(
					program.a,
					program.b,
					program.delta,
					program.duration,
					ease,
					obj.css,
					node,
					style
				);
			}

			this.program = program;
			this.pending = null;
		},
		update: function(now) {
			var program = this.program;
			if (!program) { return; }

			var p = now - program.start;
			this.t = program.a + program.delta * ease(p / program.duration);
			if (obj.tick) { obj.tick(this.t); }
		},
		done: function() {
			this.t = this.program.b;
			if (obj.tick) { obj.tick(this.t); }
			if (obj.css) { document.head.removeChild(style); }
			this.program.callback();
			this.program = null;
			this.running = !!this.pending;
		},
		abort: function() {
			if (obj.tick) { obj.tick(1); }
			if (obj.css) { document.head.removeChild(style); }
			this.program = this.pending = null;
			this.running = false;
		}
	};
}

var transitionManager = {
	running: false,
	transitions: [],
	bound: null,

	add: function(transition) {
		this.transitions.push(transition);

		if (!this.running) {
			this.running = true;
			this.next();
		}
	},

	next: function() {
		var this$1 = this;

		this.running = false;

		var now = window.performance.now();
		var i = this.transitions.length;

		while (i--) {
			var transition = this$1.transitions[i];

			if (transition.program && now >= transition.program.end) {
				transition.done();
			}

			if (transition.pending && now >= transition.pending.start) {
				transition.start(transition.pending);
			}

			if (transition.running) {
				transition.update(now);
				this$1.running = true;
			} else if (!transition.pending) {
				this$1.transitions.splice(i, 1);
			}
		}

		if (this.running) {
			requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
		}
	}
};

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, newState, oldState) {
	for (var key in group) {
		if (!(key in newState)) { continue; }

		var newValue = newState[key];
		var oldValue = oldState[key];

		if (differs(newValue, oldValue)) {
			var callbacks = group[key];
			if (!callbacks) { continue; }

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) { continue; }

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function fire(eventName, data) {
	var this$1 = this;

	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) { return; }

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this$1, data);
	}
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) { group[key].splice(index, 1); }
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') { return this.on('destroy', handler); }

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) { handlers.splice(index, 1); }
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	this._root._flush();
}

function _flush() {
	var this$1 = this;

	if (!this._renderHooks) { return; }

	while (this._renderHooks.length) {
		this$1._renderHooks.pop()();
	}
}

var proto = {
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	_flush: _flush
};

var template = (function () {
  
  return {
    transitions: { transform: transform$1 , fade: fade }
  };
}());

function create_main_fragment ( state, component ) {
	var input_updating = false;

	var label = createElement( 'label' );
	var input = createElement( 'input' );
	appendNode( input, label );
	input.type = "checkbox";

	function input_change_handler () {
		input_updating = true;
		component._set({ visible: input.checked });
		input_updating = false;
	}

	addListener( input, 'change', input_change_handler );

	input.checked = state.visible;

	appendNode( createText( " animate" ), label );
	var text_1 = createText( "\n" );

	var if_block = (state.visible) && create_if_block( state, component );

	var if_block_anchor = createComment();

	return {
		mount: function ( target, anchor ) {
			insertNode( label, target, anchor );
			insertNode( text_1, target, anchor );
			if ( if_block ) { if_block.intro( target, anchor ); }
			insertNode( if_block_anchor, target, anchor );
		},

		update: function ( changed, state ) {
			if ( !input_updating ) {
				input.checked = state.visible;
			}

			if ( state.visible ) {
				if ( !if_block ) { if_block = create_if_block( state, component ); }
				if_block.intro( if_block_anchor.parentNode, if_block_anchor );
			} else if ( if_block ) {
				if_block.outro( function () {
					if_block.unmount();
					if_block.destroy();
					if_block = null;
				});
			}
		},

		unmount: function () {
			detachNode( label );
			detachNode( text_1 );
			if ( if_block ) { if_block.unmount(); }
			detachNode( if_block_anchor );
		},

		destroy: function () {
			removeListener( input, 'change', input_change_handler );
			if ( if_block ) { if_block.destroy(); }
		}
	};
}

function create_if_block ( state, component ) {
	var div_transition, div_1_transition, introing, outroing;

	var div = createElement( 'div' );
	var div_1 = createElement( 'div' );
	appendNode( div_1, div );
	var h1 = createElement( 'h1' );
	appendNode( h1, div_1 );
	appendNode( createText( "Hey look at me rolling and fading." ), h1 );
	appendNode( createText( "\n    " ), div_1 );
	var p = createElement( 'p' );
	appendNode( p, div_1 );
	appendNode( createText( "but take the style tag out of the above tag and recompile and we lose the rotateY. Also with rotateY(0deg) in the style tag it breaks." ), p );
	appendNode( createText( "\n    " ), div_1 );
	var p_1 = createElement( 'p' );
	appendNode( p_1, div_1 );
	appendNode( createText( "Also cant add 2 transitions to an element so had to wrap 1 transition in another, which gives an odd result" ), p_1 );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},

		intro: function ( target, anchor ) {
			if ( introing ) { return; }
			introing = true;
			outroing = false;

			component._renderHooks.push( function () {
				if ( !div_transition ) { div_transition = wrapTransition( div, template.transitions.fade, {duration:2000}, true, null ); }
				div_transition.run( true, function () {
					component.fire( 'intro.end', { node: div });
				});
			});

			component._renderHooks.push( function () {
				if ( !div_1_transition ) { div_1_transition = wrapTransition( div_1, template.transitions.transform, {rotateX:-170, translateY:-140, scaleX:.8,scaleY:.8,scaleZ:.8, translateX:50, rotateY:-100, duration:800 }, true, null ); }
				div_1_transition.run( true, function () {
					component.fire( 'intro.end', { node: div_1 });
				});
			});

			this.mount( target, anchor );
		},

		outro: function ( outrocallback ) {
			if ( outroing ) { return; }
			outroing = true;
			introing = false;

			var outros = 2;

			div_transition.run( false, function () {
				component.fire( 'outro.end', { node: div });
				if ( --outros === 0 ) { outrocallback(); }
				div_transition = null;
			});

			div_1_transition.run( false, function () {
				component.fire( 'outro.end', { node: div_1 });
				if ( --outros === 0 ) { outrocallback(); }
				div_1_transition = null;
			});
		},

		unmount: function () {
			detachNode( div );
		},

		destroy: noop
	};
}

function Transform_svelte$1 ( options ) {
	options = options || {};
	this._state = options.data || {};

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;
	this._renderHooks = [];

	this._fragment = create_main_fragment( this._state, this );
	if ( options.target ) { this._fragment.mount( options.target, null ); }
	this._flush();
}

assign( Transform_svelte$1.prototype, proto );

Transform_svelte$1.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
	this._flush();
};

Transform_svelte$1.prototype.teardown = Transform_svelte$1.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	if ( detach !== false ) { this._fragment.unmount(); }
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

var transform = new Transform_svelte$1({
  target: document.getElementById("svelte-example")
});

})));
