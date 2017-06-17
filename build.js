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
    or = new index().matrix3d();
  } else {
    
    if(!/^matrix3d.*/.test(tr)) {
      matrix = tr.substr(9,tr.length-10).split(", ").map(parseFloat);
      console.log(matrix.length);
      for(var i = matrix.length || 0; i < 16; i++) {
//	matrix.push(0.1);
      }
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
      
    } else {
      matrix = tr.substr(7,tr.length-8).split(", ").map(parseFloat);
      
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
	div_1.style.cssText = "transform:rotateY(0.1deg)";
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
				if ( !div_1_transition ) { div_1_transition = wrapTransition( div_1, template.transitions.transform, {rotateX:-170, translateY:-140, scaleX:.8,scaleY:.8,scaleZ:.8, rotateY:-100, duration:800 }, true, null ); }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9tb3V0L29iamVjdC9oYXNPd24uanMiLCJub2RlX21vZHVsZXMvbW91dC9vYmplY3QvZm9ySW4uanMiLCJub2RlX21vZHVsZXMvbW91dC9vYmplY3QvZm9yT3duLmpzIiwibm9kZV9tb2R1bGVzL21vdXQvb2JqZWN0L21peEluLmpzIiwibm9kZV9tb2R1bGVzL21vdXQvbGFuZy9jcmVhdGVPYmplY3QuanMiLCJub2RlX21vZHVsZXMvbW91dC9sYW5nL2tpbmRPZi5qcyIsIm5vZGVfbW9kdWxlcy9wcmltZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRyaXgzZC9saWIvVmVjdG9yMy5qcyIsIm5vZGVfbW9kdWxlcy9tYXRyaXgzZC9saWIvVmVjdG9yNC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRyaXgzZC9saWIvTWF0cml4M2QuanMiLCJub2RlX21vZHVsZXMvbWF0cml4M2QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdHJhbnNmb3JtM2QvbGliL29wZXJhdGlvbnMuanMiLCJub2RlX21vZHVsZXMvdHJhbnNmb3JtM2QvbGliL1RyYW5zZm9ybTNkLmpzIiwibm9kZV9tb2R1bGVzL3RyYW5zZm9ybTNkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Vhc2VzLWpzbmV4dC9kaXN0L2Vhc2VzLmVzLmpzIiwic3ZlbHRlLXRyYW5zaXRpb25zLXRyYW5zZm9ybS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUtdHJhbnNpdGlvbnMtZmFkZS9tb2R1bGUuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NoYXJlZC5qcyIsInRyYW5zZm9ybS5zdmVsdGUuaHRtbCIsImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuXG4gICAgLyoqXG4gICAgICogU2FmZXIgT2JqZWN0Lmhhc093blByb3BlcnR5XG4gICAgICovXG4gICAgIGZ1bmN0aW9uIGhhc093bihvYmosIHByb3Ape1xuICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xuICAgICB9XG5cbiAgICAgbW9kdWxlLmV4cG9ydHMgPSBoYXNPd247XG5cblxuIiwidmFyIGhhc093biA9IHJlcXVpcmUoJy4vaGFzT3duJyk7XG5cbiAgICB2YXIgX2hhc0RvbnRFbnVtQnVnLFxuICAgICAgICBfZG9udEVudW1zO1xuXG4gICAgZnVuY3Rpb24gY2hlY2tEb250RW51bSgpe1xuICAgICAgICBfZG9udEVudW1zID0gW1xuICAgICAgICAgICAgICAgICd0b1N0cmluZycsXG4gICAgICAgICAgICAgICAgJ3RvTG9jYWxlU3RyaW5nJyxcbiAgICAgICAgICAgICAgICAndmFsdWVPZicsXG4gICAgICAgICAgICAgICAgJ2hhc093blByb3BlcnR5JyxcbiAgICAgICAgICAgICAgICAnaXNQcm90b3R5cGVPZicsXG4gICAgICAgICAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcbiAgICAgICAgICAgICAgICAnY29uc3RydWN0b3InXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgIF9oYXNEb250RW51bUJ1ZyA9IHRydWU7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHsndG9TdHJpbmcnOiBudWxsfSkge1xuICAgICAgICAgICAgX2hhc0RvbnRFbnVtQnVnID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaW1pbGFyIHRvIEFycmF5L2ZvckVhY2ggYnV0IHdvcmtzIG92ZXIgb2JqZWN0IHByb3BlcnRpZXMgYW5kIGZpeGVzIERvbid0XG4gICAgICogRW51bSBidWcgb24gSUUuXG4gICAgICogYmFzZWQgb246IGh0dHA6Ly93aGF0dGhlaGVhZHNhaWQuY29tLzIwMTAvMTAvYS1zYWZlci1vYmplY3Qta2V5cy1jb21wYXRpYmlsaXR5LWltcGxlbWVudGF0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZm9ySW4ob2JqLCBmbiwgdGhpc09iail7XG4gICAgICAgIHZhciBrZXksIGkgPSAwO1xuICAgICAgICAvLyBubyBuZWVkIHRvIGNoZWNrIGlmIGFyZ3VtZW50IGlzIGEgcmVhbCBvYmplY3QgdGhhdCB3YXkgd2UgY2FuIHVzZVxuICAgICAgICAvLyBpdCBmb3IgYXJyYXlzLCBmdW5jdGlvbnMsIGRhdGUsIGV0Yy5cblxuICAgICAgICAvL3Bvc3QtcG9uZSBjaGVjayB0aWxsIG5lZWRlZFxuICAgICAgICBpZiAoX2hhc0RvbnRFbnVtQnVnID09IG51bGwpIGNoZWNrRG9udEVudW0oKTtcblxuICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChleGVjKGZuLCBvYmosIGtleSwgdGhpc09iaikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChfaGFzRG9udEVudW1CdWcpIHtcbiAgICAgICAgICAgIHZhciBjdG9yID0gb2JqLmNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgICAgIGlzUHJvdG8gPSAhIWN0b3IgJiYgb2JqID09PSBjdG9yLnByb3RvdHlwZTtcblxuICAgICAgICAgICAgd2hpbGUgKGtleSA9IF9kb250RW51bXNbaSsrXSkge1xuICAgICAgICAgICAgICAgIC8vIEZvciBjb25zdHJ1Y3RvciwgaWYgaXQgaXMgYSBwcm90b3R5cGUgb2JqZWN0IHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIC8vIGlzIGFsd2F5cyBub24tZW51bWVyYWJsZSB1bmxlc3MgZGVmaW5lZCBvdGhlcndpc2UgKGFuZFxuICAgICAgICAgICAgICAgIC8vIGVudW1lcmF0ZWQgYWJvdmUpLiAgRm9yIG5vbi1wcm90b3R5cGUgb2JqZWN0cywgaXQgd2lsbCBoYXZlXG4gICAgICAgICAgICAgICAgLy8gdG8gYmUgZGVmaW5lZCBvbiB0aGlzIG9iamVjdCwgc2luY2UgaXQgY2Fubm90IGJlIGRlZmluZWQgb25cbiAgICAgICAgICAgICAgICAvLyBhbnkgcHJvdG90eXBlIG9iamVjdHMuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBGb3Igb3RoZXIgW1tEb250RW51bV1dIHByb3BlcnRpZXMsIGNoZWNrIGlmIHRoZSB2YWx1ZSBpc1xuICAgICAgICAgICAgICAgIC8vIGRpZmZlcmVudCB0aGFuIE9iamVjdCBwcm90b3R5cGUgdmFsdWUuXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAoa2V5ICE9PSAnY29uc3RydWN0b3InIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoIWlzUHJvdG8gJiYgaGFzT3duKG9iaiwga2V5KSkpICYmXG4gICAgICAgICAgICAgICAgICAgIG9ialtrZXldICE9PSBPYmplY3QucHJvdG90eXBlW2tleV1cbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4ZWMoZm4sIG9iaiwga2V5LCB0aGlzT2JqKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlYyhmbiwgb2JqLCBrZXksIHRoaXNPYmope1xuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzT2JqLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gZm9ySW47XG5cblxuIiwidmFyIGhhc093biA9IHJlcXVpcmUoJy4vaGFzT3duJyk7XG52YXIgZm9ySW4gPSByZXF1aXJlKCcuL2ZvckluJyk7XG5cbiAgICAvKipcbiAgICAgKiBTaW1pbGFyIHRvIEFycmF5L2ZvckVhY2ggYnV0IHdvcmtzIG92ZXIgb2JqZWN0IHByb3BlcnRpZXMgYW5kIGZpeGVzIERvbid0XG4gICAgICogRW51bSBidWcgb24gSUUuXG4gICAgICogYmFzZWQgb246IGh0dHA6Ly93aGF0dGhlaGVhZHNhaWQuY29tLzIwMTAvMTAvYS1zYWZlci1vYmplY3Qta2V5cy1jb21wYXRpYmlsaXR5LWltcGxlbWVudGF0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZm9yT3duKG9iaiwgZm4sIHRoaXNPYmope1xuICAgICAgICBmb3JJbihvYmosIGZ1bmN0aW9uKHZhbCwga2V5KXtcbiAgICAgICAgICAgIGlmIChoYXNPd24ob2JqLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpc09iaiwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmb3JPd247XG5cblxuIiwidmFyIGZvck93biA9IHJlcXVpcmUoJy4vZm9yT3duJyk7XG5cbiAgICAvKipcbiAgICAqIENvbWJpbmUgcHJvcGVydGllcyBmcm9tIGFsbCB0aGUgb2JqZWN0cyBpbnRvIGZpcnN0IG9uZS5cbiAgICAqIC0gVGhpcyBtZXRob2QgYWZmZWN0cyB0YXJnZXQgb2JqZWN0IGluIHBsYWNlLCBpZiB5b3Ugd2FudCB0byBjcmVhdGUgYSBuZXcgT2JqZWN0IHBhc3MgYW4gZW1wdHkgb2JqZWN0IGFzIGZpcnN0IHBhcmFtLlxuICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCAgICBUYXJnZXQgT2JqZWN0XG4gICAgKiBAcGFyYW0gey4uLm9iamVjdH0gb2JqZWN0cyAgICBPYmplY3RzIHRvIGJlIGNvbWJpbmVkICgwLi4ubiBvYmplY3RzKS5cbiAgICAqIEByZXR1cm4ge29iamVjdH0gVGFyZ2V0IE9iamVjdC5cbiAgICAqL1xuICAgIGZ1bmN0aW9uIG1peEluKHRhcmdldCwgb2JqZWN0cyl7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgIG4gPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICAgICAgb2JqO1xuICAgICAgICB3aGlsZSgrK2kgPCBuKXtcbiAgICAgICAgICAgIG9iaiA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGlmIChvYmogIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvck93bihvYmosIGNvcHlQcm9wLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29weVByb3AodmFsLCBrZXkpe1xuICAgICAgICB0aGlzW2tleV0gPSB2YWw7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBtaXhJbjtcblxuIiwidmFyIG1peEluID0gcmVxdWlyZSgnLi4vb2JqZWN0L21peEluJyk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgT2JqZWN0IHVzaW5nIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UgYW5kIHNldHRpbmcgY3VzdG9tIHByb3BlcnRpZXMuXG4gICAgICogLSBNaXggYmV0d2VlbiBEb3VnbGFzIENyb2NrZm9yZCBQcm90b3R5cGFsIEluaGVyaXRhbmNlIDxodHRwOi8vamF2YXNjcmlwdC5jcm9ja2ZvcmQuY29tL3Byb3RvdHlwYWwuaHRtbD4gYW5kIHRoZSBFY21hU2NyaXB0IDUgYE9iamVjdC5jcmVhdGUoKWAgbWV0aG9kLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnQgICAgUGFyZW50IE9iamVjdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3Byb3BzXSBPYmplY3QgcHJvcGVydGllcy5cbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IENyZWF0ZWQgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZU9iamVjdChwYXJlbnQsIHByb3BzKXtcbiAgICAgICAgZnVuY3Rpb24gRigpe31cbiAgICAgICAgRi5wcm90b3R5cGUgPSBwYXJlbnQ7XG4gICAgICAgIHJldHVybiBtaXhJbihuZXcgRigpLCBwcm9wcyk7XG5cbiAgICB9XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVPYmplY3Q7XG5cblxuIiwiXG5cbiAgICB2YXIgX3JLaW5kID0gL15cXFtvYmplY3QgKC4qKVxcXSQvLFxuICAgICAgICBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgICAgICBVTkRFRjtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIFwia2luZFwiIG9mIHZhbHVlLiAoZS5nLiBcIlN0cmluZ1wiLCBcIk51bWJlclwiLCBldGMpXG4gICAgICovXG4gICAgZnVuY3Rpb24ga2luZE9mKHZhbCkge1xuICAgICAgICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJ051bGwnO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gVU5ERUYpIHtcbiAgICAgICAgICAgIHJldHVybiAnVW5kZWZpbmVkJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcktpbmQuZXhlYyggX3RvU3RyaW5nLmNhbGwodmFsKSApWzFdO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1vZHVsZS5leHBvcnRzID0ga2luZE9mO1xuXG4iLCIvKlxucHJpbWVcbiAtIHByb3RvdHlwYWwgaW5oZXJpdGFuY2VcbiovXCJ1c2Ugc3RyaWN0XCJcblxudmFyIGhhc093biA9IHJlcXVpcmUoXCJtb3V0L29iamVjdC9oYXNPd25cIiksXG4gICAgbWl4SW4gID0gcmVxdWlyZShcIm1vdXQvb2JqZWN0L21peEluXCIpLFxuICAgIGNyZWF0ZSA9IHJlcXVpcmUoXCJtb3V0L2xhbmcvY3JlYXRlT2JqZWN0XCIpLFxuICAgIGtpbmRPZiA9IHJlcXVpcmUoXCJtb3V0L2xhbmcva2luZE9mXCIpXG5cbnZhciBoYXNEZXNjcmlwdG9ycyA9IHRydWVcblxudHJ5IHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sIFwiflwiLCB7fSlcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHt9LCBcIn5cIilcbn0gY2F0Y2ggKGUpe1xuICAgIGhhc0Rlc2NyaXB0b3JzID0gZmFsc2Vcbn1cblxuLy8gd2Ugb25seSBuZWVkIHRvIGJlIGFibGUgdG8gaW1wbGVtZW50IFwidG9TdHJpbmdcIiBhbmQgXCJ2YWx1ZU9mXCIgaW4gSUUgPCA5XG52YXIgaGFzRW51bUJ1ZyA9ICEoe3ZhbHVlT2Y6IDB9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZShcInZhbHVlT2ZcIiksXG4gICAgYnVnZ3kgICAgICA9IFtcInRvU3RyaW5nXCIsIFwidmFsdWVPZlwiXVxuXG52YXIgdmVyYnMgPSAvXmNvbnN0cnVjdG9yfGluaGVyaXRzfG1peGluJC9cblxudmFyIGltcGxlbWVudCA9IGZ1bmN0aW9uKHByb3RvKXtcbiAgICB2YXIgcHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGVcblxuICAgIGZvciAodmFyIGtleSBpbiBwcm90byl7XG4gICAgICAgIGlmIChrZXkubWF0Y2godmVyYnMpKSBjb250aW51ZVxuICAgICAgICBpZiAoaGFzRGVzY3JpcHRvcnMpe1xuICAgICAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvLCBrZXkpXG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcil7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwga2V5LCBkZXNjcmlwdG9yKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG90eXBlW2tleV0gPSBwcm90b1trZXldXG4gICAgfVxuXG4gICAgaWYgKGhhc0VudW1CdWcpIGZvciAodmFyIGkgPSAwOyAoa2V5ID0gYnVnZ3lbaV0pOyBpKyspe1xuICAgICAgICB2YXIgdmFsdWUgPSBwcm90b1trZXldXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gT2JqZWN0LnByb3RvdHlwZVtrZXldKSBwcm90b3R5cGVba2V5XSA9IHZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxudmFyIHByaW1lID0gZnVuY3Rpb24ocHJvdG8pe1xuXG4gICAgaWYgKGtpbmRPZihwcm90bykgPT09IFwiRnVuY3Rpb25cIikgcHJvdG8gPSB7Y29uc3RydWN0b3I6IHByb3RvfVxuXG4gICAgdmFyIHN1cGVycHJpbWUgPSBwcm90by5pbmhlcml0c1xuXG4gICAgLy8gaWYgb3VyIG5pY2UgcHJvdG8gb2JqZWN0IGhhcyBubyBvd24gY29uc3RydWN0b3IgcHJvcGVydHlcbiAgICAvLyB0aGVuIHdlIHByb2NlZWQgdXNpbmcgYSBnaG9zdGluZyBjb25zdHJ1Y3RvciB0aGF0IGFsbCBpdCBkb2VzIGlzXG4gICAgLy8gY2FsbCB0aGUgcGFyZW50J3MgY29uc3RydWN0b3IgaWYgaXQgaGFzIGEgc3VwZXJwcmltZSwgZWxzZSBhbiBlbXB0eSBjb25zdHJ1Y3RvclxuICAgIC8vIHByb3RvLmNvbnN0cnVjdG9yIGJlY29tZXMgdGhlIGVmZmVjdGl2ZSBjb25zdHJ1Y3RvclxuICAgIHZhciBjb25zdHJ1Y3RvciA9IChoYXNPd24ocHJvdG8sIFwiY29uc3RydWN0b3JcIikpID8gcHJvdG8uY29uc3RydWN0b3IgOiAoc3VwZXJwcmltZSkgPyBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gc3VwZXJwcmltZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfSA6IGZ1bmN0aW9uKCl7fVxuXG4gICAgaWYgKHN1cGVycHJpbWUpe1xuXG4gICAgICAgIG1peEluKGNvbnN0cnVjdG9yLCBzdXBlcnByaW1lKVxuXG4gICAgICAgIHZhciBzdXBlcnByb3RvID0gc3VwZXJwcmltZS5wcm90b3R5cGVcbiAgICAgICAgLy8gaW5oZXJpdCBmcm9tIHN1cGVycHJpbWVcbiAgICAgICAgdmFyIGNwcm90byA9IGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNyZWF0ZShzdXBlcnByb3RvKVxuXG4gICAgICAgIC8vIHNldHRpbmcgY29uc3RydWN0b3IucGFyZW50IHRvIHN1cGVycHJpbWUucHJvdG90eXBlXG4gICAgICAgIC8vIGJlY2F1c2UgaXQncyB0aGUgc2hvcnRlc3QgcG9zc2libGUgYWJzb2x1dGUgcmVmZXJlbmNlXG4gICAgICAgIGNvbnN0cnVjdG9yLnBhcmVudCA9IHN1cGVycHJvdG9cbiAgICAgICAgY3Byb3RvLmNvbnN0cnVjdG9yID0gY29uc3RydWN0b3JcbiAgICB9XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmltcGxlbWVudCkgY29uc3RydWN0b3IuaW1wbGVtZW50ID0gaW1wbGVtZW50XG5cbiAgICB2YXIgbWl4aW5zID0gcHJvdG8ubWl4aW5cbiAgICBpZiAobWl4aW5zKXtcbiAgICAgICAgaWYgKGtpbmRPZihtaXhpbnMpICE9PSBcIkFycmF5XCIpIG1peGlucyA9IFttaXhpbnNdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWl4aW5zLmxlbmd0aDsgaSsrKSBjb25zdHJ1Y3Rvci5pbXBsZW1lbnQoY3JlYXRlKG1peGluc1tpXS5wcm90b3R5cGUpKVxuICAgIH1cblxuICAgIC8vIGltcGxlbWVudCBwcm90byBhbmQgcmV0dXJuIGNvbnN0cnVjdG9yXG4gICAgcmV0dXJuIGNvbnN0cnVjdG9yLmltcGxlbWVudChwcm90bylcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByaW1lXG4iLCIvKlxuVmVjdG9yM1xuVGhpcyBpcyBtb3N0bHkgZnJvbSB0aHJlZS5qcyAvIHRyYW5zZm9ybV91dGlsIHNvdXJjZSBjb2RlLlxuKi8ndXNlIHN0cmljdCc7XG5cbnZhciBwcmltZSA9IHJlcXVpcmUoJ3ByaW1lJyk7XG5cbnZhciBWZWN0b3IzID0gcHJpbWUoe1xuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBWZWN0b3IzKHgsIHksIHopIHtcbiAgICB0aGlzWzBdID0geCB8fCAwO1xuICAgIHRoaXNbMV0gPSB5IHx8IDA7XG4gICAgdGhpc1syXSA9IHogfHwgMDtcbiAgfSxcblxuICBjbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0pO1xuICB9LFxuXG4gIGdldCB4KCkge1xuICAgIHJldHVybiB0aGlzWzBdO1xuICB9LFxuXG4gIGdldCB5KCkge1xuICAgIHJldHVybiB0aGlzWzFdO1xuICB9LFxuXG4gIGdldCB6KCkge1xuICAgIHJldHVybiB0aGlzWzJdO1xuICB9LFxuXG4gIGVxdWFsczogZnVuY3Rpb24odjMpIHtcbiAgICByZXR1cm4gdGhpc1swXSA9PT0gdjNbMF0gJiYgdGhpc1sxXSA9PT0gdjNbMV0gJiYgdGhpc1syXSA9PT0gdjNbMl07XG4gIH0sXG5cbiAgLy8gdGhyZWUuanNcbiAgbGVuZ3RoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXNbMF0gKiB0aGlzWzBdICsgdGhpc1sxXSAqIHRoaXNbMV0gKyB0aGlzWzJdICogdGhpc1syXSk7XG4gIH0sXG5cbiAgLy8gdGhyZWUuanNcbiAgbm9ybWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGgoKTtcbiAgICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gbmV3IFZlY3RvcjMoKTtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjModGhpc1swXSAvIGxlbmd0aCwgdGhpc1sxXSAvIGxlbmd0aCwgdGhpc1syXSAvIGxlbmd0aCk7XG4gIH0sXG5cbiAgLy8gdGhyZWUuanNcbiAgZG90OiBmdW5jdGlvbih2Mykge1xuICAgIHJldHVybiB0aGlzWzBdICogdjNbMF0gKyB0aGlzWzFdICogdjNbMV0gKyB0aGlzWzJdICogdjNbMl07XG4gIH0sXG5cbiAgLy8gdGhyZWUuanNcbiAgY3Jvc3M6IGZ1bmN0aW9uKHYzKSB7XG4gICAgdmFyIHggPSB0aGlzWzBdLCB5ID0gdGhpc1sxXSwgeiA9IHRoaXNbMl07XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoXG4gICAgICB5ICogdjNbMl0gLSB6ICogdjNbMV0sXG4gICAgICB6ICogdjNbMF0gLSB4ICogdjNbMl0sXG4gICAgICB4ICogdjNbMV0gLSB5ICogdjNbMF1cbiAgICApO1xuICB9LFxuXG4gIGxlcnA6IGZ1bmN0aW9uICh2MywgZGVsdGEpIHtcbiAgICB2YXIgc2NhbGUxID0gZGVsdGE7XG4gICAgdmFyIHNjYWxlMiA9IDEgLSBkZWx0YTtcbiAgICByZXR1cm4gdjMuY29tYmluZSh0aGlzLCBzY2FsZTEsIHNjYWxlMik7XG4gIH0sXG5cbiAgLy8gdHJhc2Zvcm1fdXRpbFxuICBjb21iaW5lOiBmdW5jdGlvbih2Mywgc2NhbGUxLCBzY2FsZTIpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IFZlY3RvcjM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHJlc3VsdFtpXSA9IHRoaXNbaV0gKiBzY2FsZTEgKyB2M1tpXSAqIHNjYWxlMjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3IzO1xuIiwiLypcblZlY3RvcjRcblRoaXMgaXMgbW9zdGx5IGZyb20gdGhyZWUuanMgLyBldWNsaWRlYW5zcGFjZS5jb20gLyB0cmFuc2Zvcm1fdXRpbCBzb3VyY2UgY29kZS5cbiovICd1c2Ugc3RyaWN0JztcblxudmFyIHByaW1lID0gcmVxdWlyZSgncHJpbWUnKTtcblxudmFyIGRlZ1RvUmFkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG52YXIgcmFkVG9EZWcgPSBmdW5jdGlvbihyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbnZhciBWZWN0b3I0ID0gcHJpbWUoe1xuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBWZWN0b3I0KHgsIHksIHosIHcpIHtcbiAgICB0aGlzWzBdID0geCB8fCAwO1xuICAgIHRoaXNbMV0gPSB5IHx8IDA7XG4gICAgdGhpc1syXSA9IHogfHwgMDtcbiAgICB0aGlzWzNdID0gdyB8fCAwO1xuICB9LFxuXG4gIGNsb25lOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQodGhpc1swXSwgdGhpc1sxXSwgdGhpc1syXSwgdGhpc1szXSk7XG4gIH0sXG5cbiAgZ2V0IHgoKSB7XG4gICAgcmV0dXJuIHRoaXNbMF07XG4gIH0sXG5cbiAgZ2V0IHkoKSB7XG4gICAgcmV0dXJuIHRoaXNbMV07XG4gIH0sXG5cbiAgZ2V0IHooKSB7XG4gICAgcmV0dXJuIHRoaXNbMl07XG4gIH0sXG5cbiAgZ2V0IHcoKSB7XG4gICAgcmV0dXJuIHRoaXNbM107XG4gIH0sXG5cbiAgZXF1YWxzOiBmdW5jdGlvbih2Mykge1xuICAgIHJldHVybiB0aGlzWzBdID09PSB2M1swXSAmJiB0aGlzWzFdID09PSB2M1sxXSAmJiB0aGlzWzJdID09PSB2M1syXSAmJiB0aGlzWzNdID09PSB2M1szXTtcbiAgfSxcblxuICAvLyB0aHJlZS5qc1xuICBsZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpc1swXSAqIHRoaXNbMF0gKyB0aGlzWzFdICogdGhpc1sxXSArIHRoaXNbMl0gKiB0aGlzWzJdICsgdGhpc1szXSAqIHRoaXNbM10pO1xuICB9LFxuXG4gIC8vIHRocmVlLmpzXG4gIGRvdDogZnVuY3Rpb24odjQpIHtcbiAgICByZXR1cm4gdGhpc1swXSAqIHY0WzBdICsgdGhpc1sxXSAqIHY0WzFdICsgdGhpc1syXSAqIHY0WzJdICsgdGhpc1szXSAqIHY0WzNdO1xuICB9LFxuXG4gIC8vIHRocmVlLmpzXG4gIG5vcm1hbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuIG5ldyBWZWN0b3I0KDAsIDAsIDAsIDEpO1xuXG4gICAgdmFyIGludiA9IDEgLyBsZW5ndGg7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KHRoaXNbMF0gKiBpbnYsIHRoaXNbMV0gKiBpbnYsIHRoaXNbMl0gKiBpbnYsIHRoaXNbM10gKiBpbnYpO1xuICB9LFxuXG4gIC8vIHRocmVlLmpzXG4gIC8vIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2dlb21ldHJ5L3JvdGF0aW9ucy9jb252ZXJzaW9ucy9xdWF0ZXJuaW9uVG9BbmdsZS9pbmRleC5odG1cbiAgLy8gZGVnIGluZGljYXRlcyB5b3Ugd2FudCB0aGUgYW5nbGUgaW4gZGVncmVlcyBpbiB0aGUgcmVzdWx0aW5nIFZlY3RvcjRcbiAgcXVhdGVybmlvblRvQW5nbGU6IGZ1bmN0aW9uKGRlZykge1xuICAgIHZhciB2NCA9IHRoaXM7XG4gICAgLy8gaWYgdz4xIGFjb3MgYW5kIHNxcnQgd2lsbCBwcm9kdWNlIGVycm9ycywgdGhpcyBjYW50IGhhcHBlbiBpZiBxdWF0ZXJuaW9uIGlzIG5vcm1hbGlzZWRcbiAgICBpZiAodjRbM10gPiAxKSB2NCA9IHY0Lm5vcm1hbGl6ZSgpO1xuICAgIHZhciB3ID0gMiAqIE1hdGguYWNvcyh2NFszXSk7XG4gICAgdmFyIHMgPSBNYXRoLnNxcnQoMSAtIHY0WzNdICogdjRbM10pOyAvLyBhc3N1bWluZyBxdWF0ZXJuaW9uIG5vcm1hbGlzZWQgdGhlbiB3IGlzIGxlc3MgdGhhbiAxLCBzbyB0ZXJtIGFsd2F5cyBwb3NpdGl2ZS5cblxuICAgIGlmIChzIDwgMWUtNCkgeyAvLyB0ZXN0IHRvIGF2b2lkIGRpdmlkZSBieSB6ZXJvLCBzIGlzIGFsd2F5cyBwb3NpdGl2ZSBkdWUgdG8gc3FydFxuICAgICAgLy8gaWYgcyBjbG9zZSB0byB6ZXJvIHRoZW4gZGlyZWN0aW9uIG9mIGF4aXMgbm90IGltcG9ydGFudFxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3I0KHY0WzBdLCB2NFsxXSwgdjRbMl0sIHcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBub3JtYWxpc2UgYXhpc1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3I0KHY0WzBdIC8gcywgdjRbMV0gLyBzLCB2NFsyXSAvIHMsIGRlZyA/IHJhZFRvRGVnKHcpIDogdyk7XG4gICAgfVxuXG4gIH0sXG5cbiAgLy8gdGhyZWUuanNcbiAgLy8gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL2FuZ2xlVG9RdWF0ZXJuaW9uL2luZGV4Lmh0bVxuICAvLyBkZWcgaW5kaWNhdGVzIHRoZSBWZWN0b3I0IGNvbnRhaW5zIHRoZSBhbmdsZSBpbiBkZWdyZWVzXG4gIGFuZ2xlVG9RdWF0ZXJuaW9uOiBmdW5jdGlvbihkZWcpIHtcbiAgICB2YXIgYW5nbGUgPSBkZWcgPyBkZWdUb1JhZCh0aGlzWzNdKSA6IHRoaXNbM107XG4gICAgdmFyIGhhbGYgPSBhbmdsZSAvIDIsIHMgPSBNYXRoLnNpbihoYWxmKTtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQodGhpc1swXSAqIHMsIHRoaXNbMV0gKiBzLCB0aGlzWzJdICogcywgTWF0aC5jb3MoaGFsZikpO1xuICB9LFxuXG4gIC8vIHRyYW5zZm9ybV91dGlsXG4gIGNvbWJpbmU6IGZ1bmN0aW9uKHY0LCBzY2FsZTEsIHNjYWxlMikge1xuICAgIHZhciByZXN1bHQgPSBuZXcgVmVjdG9yNDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykgcmVzdWx0W2ldID0gdGhpc1tpXSAqIHNjYWxlMSArIHY0W2ldICogc2NhbGUyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgbGVycDogZnVuY3Rpb24gKHY0LCBkZWx0YSkge1xuICAgIHZhciBzY2FsZTEgPSBkZWx0YTtcbiAgICB2YXIgc2NhbGUyID0gMSAtIGRlbHRhO1xuICAgIHJldHVybiB2NC5jb21iaW5lKHRoaXMsIHNjYWxlMSwgc2NhbGUyKTtcbiAgfSxcblxuICAvLyB0cmFuc2Zvcm1fdXRpbFxuICBzbGVycDogZnVuY3Rpb24odjRxLCBkZWx0YSkge1xuICAgIHZhciBpbnRlcnBvbGF0ZWQgPSBuZXcgVmVjdG9yNDtcblxuICAgIHZhciBwcm9kdWN0ID0gdGhpcy5kb3QodjRxKTtcblxuICAgIC8vIENsYW1wIHByb2R1Y3QgdG8gLTEuMCA8PSBwcm9kdWN0IDw9IDEuMC5cbiAgICBwcm9kdWN0ID0gTWF0aC5taW4oTWF0aC5tYXgocHJvZHVjdCwgLTEpLCAxKTtcblxuICAgIC8vIEludGVycG9sYXRlIGFuZ2xlcyBhbG9uZyB0aGUgc2hvcnRlc3QgcGF0aC4gRm9yIGV4YW1wbGUsIHRvIGludGVycG9sYXRlXG4gICAgLy8gYmV0d2VlbiBhIDE3NSBkZWdyZWUgYW5nbGUgYW5kIGEgMTg1IGRlZ3JlZSBhbmdsZSwgaW50ZXJwb2xhdGUgYWxvbmcgdGhlXG4gICAgLy8gMTAgZGVncmVlIHBhdGggZnJvbSAxNzUgdG8gMTg1LCByYXRoZXIgdGhhbiBhbG9uZyB0aGUgMzUwIGRlZ3JlZSBwYXRoIGluXG4gICAgLy8gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbi4gVGhpcyBtYXRjaGVzIFdlYktpdCdzIGltcGxlbWVudGF0aW9uIGJ1dCBub3RcbiAgICAvLyB0aGUgY3VycmVudCBXM0Mgc3BlYy4gRml4aW5nIHRoZSBzcGVjIHRvIG1hdGNoIHRoaXMgYXBwcm9hY2ggaXMgZGlzY3Vzc2VkXG4gICAgLy8gYXQ6XG4gICAgLy8gaHR0cDovL2xpc3RzLnczLm9yZy9BcmNoaXZlcy9QdWJsaWMvd3d3LXN0eWxlLzIwMTNNYXkvMDEzMS5odG1sXG4gICAgdmFyIHNjYWxlMSA9IDE7XG4gICAgaWYgKHByb2R1Y3QgPCAwKSB7XG4gICAgICBwcm9kdWN0ID0gLXByb2R1Y3Q7XG4gICAgICBzY2FsZTEgPSAtMS4wO1xuICAgIH1cblxuICAgIHZhciBlcHNpbG9uID0gMWUtNTtcbiAgICBpZiAoTWF0aC5hYnMocHJvZHVjdCAtIDEuMCkgPCBlcHNpbG9uKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7ICsraSkgaW50ZXJwb2xhdGVkW2ldID0gdGhpc1tpXTtcbiAgICAgIHJldHVybiBpbnRlcnBvbGF0ZWQ7XG4gICAgfVxuXG4gICAgdmFyIGRlbm9tID0gTWF0aC5zcXJ0KDEgLSBwcm9kdWN0ICogcHJvZHVjdCk7XG4gICAgdmFyIHRoZXRhID0gTWF0aC5hY29zKHByb2R1Y3QpO1xuICAgIHZhciB3ID0gTWF0aC5zaW4oZGVsdGEgKiB0aGV0YSkgKiAoMSAvIGRlbm9tKTtcblxuICAgIHNjYWxlMSAqPSBNYXRoLmNvcyhkZWx0YSAqIHRoZXRhKSAtIHByb2R1Y3QgKiB3O1xuICAgIHZhciBzY2FsZTIgPSB3O1xuXG4gICAgcmV0dXJuIHRoaXMuY29tYmluZSh2NHEsIHNjYWxlMSwgc2NhbGUyKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3I0O1xuIiwiLypcbk1hdHJpeDNkXG5BIHBvcnQgb2YgV2Via2l0J3Mgc291cmNlIGNvZGUgb2YgNHg0IE1hdHJpY2VzIG9wZXJhdGlvbnMuXG5JbXBsZW1lbnRzIG1ldGhvZHMgZnJvbSBib3RoIFNrTWF0cml4NDQgKHR5cGVzLCBjb25jYXQsIGludmVydCwgLi4uKSBhbmQgdHJhbnNmb3JtX3V0aWwgKGRlY29tcG9zaXRpb24sIGNvbXBvc2l0aW9uLCAuLi4pXG5cbkRpZmZlcmVuY2VzIGJldHdlZW4gaW1wbGVtZW50YXRpb25zOlxuIC0gQWxsIG9wZXJhdGlvbnMgYXJlIG5vbiBkZXNjdHJ1Y3RpdmUsIGFwcGxpZWQgb24gYSBuZXcgTWF0cml4M2QgaW5zdGFuY2UuXG4gLSBDb252ZW5pZW5jZSBtZXRob2RzIHRvU3RyaW5nLCBjbG9uZSwgcm91bmQsIC4uLiBtb3N0bHkgc3BlY2lmaWMgdG8gSmF2YVNjcmlwdC5cbiAtIFNvbWUgc3BlZWQgb3B0aW1pemF0aW9ucyBoYXZlIGJlZW4gcmVtb3ZlZCBmb3Igc2ltcGxpY2l0eSBhbmQgYnJldml0eS5cbiovICd1c2Ugc3RyaWN0JztcblxudmFyIHByaW1lID0gcmVxdWlyZSgncHJpbWUnKTtcblxudmFyIFZlY3RvcjMgPSByZXF1aXJlKCcuL1ZlY3RvcjMnKTtcbnZhciBWZWN0b3I0ID0gcmVxdWlyZSgnLi9WZWN0b3I0Jyk7XG5cbnZhciBzdHJpbmdpZnkgPSBmdW5jdGlvbihhcnJheSwgcGxhY2VzKSB7XG4gIGlmIChwbGFjZXMgPT0gbnVsbCB8fCBwbGFjZXMgPiAyMCkgcGxhY2VzID0gMjA7XG5cbiAgdmFyIHN0cmluZ3MgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykgc3RyaW5nc1tpXSA9IGFycmF5W2ldLnRvRml4ZWQoMTApLnJlcGxhY2UoL1xcLj8wKyQvLCAnJyk7XG4gIHJldHVybiBzdHJpbmdzO1xufTtcblxudmFyIFR5cGVNYXNrID0ge1xuICAgIElkZW50aXR5OiAwLFxuICAgIFRyYW5zbGF0ZTogMHgwMSwgIC8vITwgc2V0IGlmIHRoZSBtYXRyaXggaGFzIHRyYW5zbGF0aW9uXG4gICAgU2NhbGU6IDB4MDIsICAvLyE8IHNldCBpZiB0aGUgbWF0cml4IGhhcyBhbnkgc2NhbGUgIT0gMVxuICAgIEFmZmluZTogMHgwNCwgIC8vITwgc2V0IGlmIHRoZSBtYXRyaXggc2tld3Mgb3Igcm90YXRlc1xuICAgIFBlcnNwZWN0aXZlOiAweDA4LCAgIC8vITwgc2V0IGlmIHRoZSBtYXRyaXggaXMgaW4gcGVyc3BlY3RpdmVcbiAgICBBbGw6IDB4RixcbiAgICBVbmtub3duOiAweDgwXG59O1xuXG52YXIgTWF0cml4M2QgPSBwcmltZSh7XG5cbiAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIE1hdHJpeDNkKCkge1xuXG4gICAgLy8gbS5tMTEsIG0ubTEyLCBtLm0xMywgbS5tMTQsXG4gICAgLy8gbS5tMjEsIG0ubTIyLCBtLm0yMywgbS5tMjQsXG4gICAgLy8gbS5tMzEsIG0ubTMyLCBtLm0zMywgbS5tMzQsXG4gICAgLy8gbS5tNDEsIG0ubTQyLCBtLm00MywgbS5tNDRcblxuICAgIHZhciB2YWx1ZXMgPSBhcmd1bWVudHM7XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMSkgdmFsdWVzID0gdmFsdWVzWzBdOyAvLyBtYXRyaXggYXMgbGlzdFxuXG4gICAgaWYgKCF2YWx1ZXMubGVuZ3RoKSB2YWx1ZXMgPSBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXTtcblxuICAgIHZhciBpID0gMCwgaiwgayA9IDA7XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gNikgeyAvLyAyZCBtYXRyaXhcblxuICAgICAgdmFyIGEgPSB2YWx1ZXNbMF07XG4gICAgICB2YXIgYiA9IHZhbHVlc1sxXTtcbiAgICAgIHZhciBjID0gdmFsdWVzWzJdO1xuICAgICAgdmFyIGQgPSB2YWx1ZXNbM107XG4gICAgICB2YXIgZSA9IHZhbHVlc1s0XTtcbiAgICAgIHZhciBmID0gdmFsdWVzWzVdO1xuXG4gICAgICB2YWx1ZXMgPSBbXG4gICAgICAgIGEsIGIsIDAsIDAsXG4gICAgICAgIGMsIGQsIDAsIDAsXG4gICAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAgIGUsIGYsIDAsIDFcbiAgICAgIF07XG5cbiAgICB9XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCAhPT0gMTYpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBtYXRyaXgnKTtcblxuICAgIC8vIGFsd2F5cyAxNlxuXG4gICAgZm9yIChpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgdmFyIGNvbCA9IHRoaXNbaV0gPSBbXTtcbiAgICAgIGZvciAoaiA9IDA7IGogPCA0OyBqKyspIHtcbiAgICAgICAgY29sW2pdID0gdmFsdWVzW2srK107XG4gICAgICB9XG4gICAgfVxuXG4gIH0sXG5cbiAgLy8gZ2V0IDJ4M1xuXG4gIGdldCBhKCkgeyByZXR1cm4gdGhpcy5tMTE7IH0sXG4gIGdldCBiKCkgeyByZXR1cm4gdGhpcy5tMTI7IH0sXG4gIGdldCBjKCkgeyByZXR1cm4gdGhpcy5tMjE7IH0sXG4gIGdldCBkKCkgeyByZXR1cm4gdGhpcy5tMjI7IH0sXG4gIGdldCBlKCkgeyByZXR1cm4gdGhpcy5tNDE7IH0sXG4gIGdldCBmKCkgeyByZXR1cm4gdGhpcy5tNDI7IH0sXG5cbiAgLy8gc2V0IDJ4M1xuXG4gIHNldCBhKHZhbHVlKSB7IHRoaXMubTExID0gdmFsdWU7IH0sXG4gIHNldCBiKHZhbHVlKSB7IHRoaXMubTEyID0gdmFsdWU7IH0sXG4gIHNldCBjKHZhbHVlKSB7IHRoaXMubTIxID0gdmFsdWU7IH0sXG4gIHNldCBkKHZhbHVlKSB7IHRoaXMubTIyID0gdmFsdWU7IH0sXG4gIHNldCBlKHZhbHVlKSB7IHRoaXMubTQxID0gdmFsdWU7IH0sXG4gIHNldCBmKHZhbHVlKSB7IHRoaXMubTQyID0gdmFsdWU7IH0sXG5cbiAgLy8gZ2V0IDR4NFxuXG4gIGdldCBtMTEoKSB7IHJldHVybiB0aGlzWzBdWzBdOyB9LFxuICBnZXQgbTEyKCkgeyByZXR1cm4gdGhpc1swXVsxXTsgfSxcbiAgZ2V0IG0xMygpIHsgcmV0dXJuIHRoaXNbMF1bMl07IH0sXG4gIGdldCBtMTQoKSB7IHJldHVybiB0aGlzWzBdWzNdOyB9LFxuICBnZXQgbTIxKCkgeyByZXR1cm4gdGhpc1sxXVswXTsgfSxcbiAgZ2V0IG0yMigpIHsgcmV0dXJuIHRoaXNbMV1bMV07IH0sXG4gIGdldCBtMjMoKSB7IHJldHVybiB0aGlzWzFdWzJdOyB9LFxuICBnZXQgbTI0KCkgeyByZXR1cm4gdGhpc1sxXVszXTsgfSxcbiAgZ2V0IG0zMSgpIHsgcmV0dXJuIHRoaXNbMl1bMF07IH0sXG4gIGdldCBtMzIoKSB7IHJldHVybiB0aGlzWzJdWzFdOyB9LFxuICBnZXQgbTMzKCkgeyByZXR1cm4gdGhpc1syXVsyXTsgfSxcbiAgZ2V0IG0zNCgpIHsgcmV0dXJuIHRoaXNbMl1bM107IH0sXG4gIGdldCBtNDEoKSB7IHJldHVybiB0aGlzWzNdWzBdOyB9LFxuICBnZXQgbTQyKCkgeyByZXR1cm4gdGhpc1szXVsxXTsgfSxcbiAgZ2V0IG00MygpIHsgcmV0dXJuIHRoaXNbM11bMl07IH0sXG4gIGdldCBtNDQoKSB7IHJldHVybiB0aGlzWzNdWzNdOyB9LFxuXG4gIC8vIHNldCA0eDRcblxuICBzZXQgbTExKHZhbHVlKSB7IHRoaXNbMF1bMF0gPSB2YWx1ZTsgfSxcbiAgc2V0IG0xMih2YWx1ZSkgeyB0aGlzWzBdWzFdID0gdmFsdWU7IH0sXG4gIHNldCBtMTModmFsdWUpIHsgdGhpc1swXVsyXSA9IHZhbHVlOyB9LFxuICBzZXQgbTE0KHZhbHVlKSB7IHRoaXNbMF1bM10gPSB2YWx1ZTsgfSxcbiAgc2V0IG0yMSh2YWx1ZSkgeyB0aGlzWzFdWzBdID0gdmFsdWU7IH0sXG4gIHNldCBtMjIodmFsdWUpIHsgdGhpc1sxXVsxXSA9IHZhbHVlOyB9LFxuICBzZXQgbTIzKHZhbHVlKSB7IHRoaXNbMV1bMl0gPSB2YWx1ZTsgfSxcbiAgc2V0IG0yNCh2YWx1ZSkgeyB0aGlzWzFdWzNdID0gdmFsdWU7IH0sXG4gIHNldCBtMzEodmFsdWUpIHsgdGhpc1syXVswXSA9IHZhbHVlOyB9LFxuICBzZXQgbTMyKHZhbHVlKSB7IHRoaXNbMl1bMV0gPSB2YWx1ZTsgfSxcbiAgc2V0IG0zMyh2YWx1ZSkgeyB0aGlzWzJdWzJdID0gdmFsdWU7IH0sXG4gIHNldCBtMzQodmFsdWUpIHsgdGhpc1syXVszXSA9IHZhbHVlOyB9LFxuICBzZXQgbTQxKHZhbHVlKSB7IHRoaXNbM11bMF0gPSB2YWx1ZTsgfSxcbiAgc2V0IG00Mih2YWx1ZSkgeyB0aGlzWzNdWzFdID0gdmFsdWU7IH0sXG4gIHNldCBtNDModmFsdWUpIHsgdGhpc1szXVsyXSA9IHZhbHVlOyB9LFxuICBzZXQgbTQ0KHZhbHVlKSB7IHRoaXNbM11bM10gPSB2YWx1ZTsgfSxcblxuICAvLyBnZXQgc2hvcnRjdXRzXG5cbiAgZ2V0IHRyYW5zWCgpIHsgcmV0dXJuIHRoaXNbM11bMF07IH0sXG4gIGdldCB0cmFuc1koKSB7IHJldHVybiB0aGlzWzNdWzFdOyB9LFxuICBnZXQgdHJhbnNaKCkgeyByZXR1cm4gdGhpc1szXVsyXTsgfSxcbiAgZ2V0IHNjYWxlWCgpIHsgcmV0dXJuIHRoaXNbMF1bMF07IH0sXG4gIGdldCBzY2FsZVkoKSB7IHJldHVybiB0aGlzWzFdWzFdOyB9LFxuICBnZXQgc2NhbGVaKCkgeyByZXR1cm4gdGhpc1syXVsyXTsgfSxcbiAgZ2V0IHBlcnNwWCgpIHsgcmV0dXJuIHRoaXNbMF1bM107IH0sXG4gIGdldCBwZXJzcFkoKSB7IHJldHVybiB0aGlzWzFdWzNdOyB9LFxuICBnZXQgcGVyc3BaKCkgeyByZXR1cm4gdGhpc1syXVszXTsgfSxcblxuICAvLyBzZXQgc2hvcnRjdXRzXG5cbiAgc2V0IHRyYW5zWCh2YWx1ZSkgeyB0aGlzWzNdWzBdID0gdmFsdWU7IH0sXG4gIHNldCB0cmFuc1kodmFsdWUpIHsgdGhpc1szXVsxXSA9IHZhbHVlOyB9LFxuICBzZXQgdHJhbnNaKHZhbHVlKSB7IHRoaXNbM11bMl0gPSB2YWx1ZTsgfSxcbiAgc2V0IHNjYWxlWCh2YWx1ZSkgeyB0aGlzWzBdWzBdID0gdmFsdWU7IH0sXG4gIHNldCBzY2FsZVkodmFsdWUpIHsgdGhpc1sxXVsxXSA9IHZhbHVlOyB9LFxuICBzZXQgc2NhbGVaKHZhbHVlKSB7IHRoaXNbMl1bMl0gPSB2YWx1ZTsgfSxcbiAgc2V0IHBlcnNwWCh2YWx1ZSkgeyB0aGlzWzBdWzNdID0gdmFsdWU7IH0sXG4gIHNldCBwZXJzcFkodmFsdWUpIHsgdGhpc1sxXVszXSA9IHZhbHVlOyB9LFxuICBzZXQgcGVyc3BaKHZhbHVlKSB7IHRoaXNbMl1bM10gPSB2YWx1ZTsgfSxcblxuICAvLyB0eXBlIGdldHRlclxuXG4gIGdldCB0eXBlKCkge1xuICAgIHZhciBtID0gdGhpcztcbiAgICB2YXIgbWFzayA9IDA7XG5cbiAgICBpZiAoMCAhPT0gbS5wZXJzcFggfHwgMCAhPT0gbS5wZXJzcFkgfHwgMCAhPT0gbS5wZXJzcFogfHwgMSAhPT0gbVszXVszXSkge1xuICAgICAgcmV0dXJuIFR5cGVNYXNrLlRyYW5zbGF0ZSB8IFR5cGVNYXNrLlNjYWxlIHwgVHlwZU1hc2suQWZmaW5lIHwgVHlwZU1hc2suUGVyc3BlY3RpdmU7XG4gICAgfVxuXG4gICAgaWYgKDAgIT09IG0udHJhbnNYIHx8IDAgIT09IG0udHJhbnNZIHx8IDAgIT09IG0udHJhbnNaKSB7XG4gICAgICBtYXNrIHw9IFR5cGVNYXNrLlRyYW5zbGF0ZTtcbiAgICB9XG5cbiAgICBpZiAoMSAhPT0gbS5zY2FsZVggfHwgMSAhPT0gbS5zY2FsZVkgfHwgMSAhPT0gbS5zY2FsZVopIHtcbiAgICAgIG1hc2sgfD0gVHlwZU1hc2suU2NhbGU7XG4gICAgfVxuXG4gICAgaWYgKDAgIT09IG1bMV1bMF0gfHwgMCAhPT0gbVswXVsxXSB8fCAwICE9PSBtWzBdWzJdIHx8XG4gICAgICAgIDAgIT09IG1bMl1bMF0gfHwgMCAhPT0gbVsxXVsyXSB8fCAwICE9PSBtWzJdWzFdKSB7XG4gICAgICAgICAgbWFzayB8PSBUeXBlTWFzay5BZmZpbmU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hc2s7XG4gIH0sXG5cbiAgLy8gVzNDXG4gIGlzMmQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtID0gdGhpcztcblxuICAgIHJldHVybiBtLm0zMSA9PT0gMCAmJiBtLm0zMiA9PT0gMCAmJlxuICAgICAgICAgICBtLm0xMyA9PT0gMCAmJiBtLm0xNCA9PT0gMCAmJlxuICAgICAgICAgICBtLm0yMyA9PT0gMCAmJiBtLm0yNCA9PT0gMCAmJlxuICAgICAgICAgICBtLm0zMyA9PT0gMSAmJiBtLm0zNCA9PT0gMCAmJlxuICAgICAgICAgICBtLm00MyA9PT0gMCAmJiBtLm00NCA9PT0gMTtcbiAgfSxcblxuICBlcXVhbHM6IGZ1bmN0aW9uKG0yKSB7XG4gICAgdmFyIG0xID0gdGhpcztcblxuICAgIHJldHVyblxuICAgICAgbTEubTExID09PSBtMi5tMTEgJiYgbTEubTEyID09PSBtMi5tMTIgJiYgbTEubTEzID09PSBtMi5tMTMgJiYgbTEubTE0ID09PSBtMi5tMTQgJiZcbiAgICAgIG0xLm0yMSA9PT0gbTIubTIxICYmIG0xLm0yMiA9PT0gbTIubTIyICYmIG0xLm0yMyA9PT0gbTIubTIzICYmIG0xLm0yNCA9PT0gbTIubTI0ICYmXG4gICAgICBtMS5tMzEgPT09IG0yLm0zMSAmJiBtMS5tMzIgPT09IG0yLm0zMiAmJiBtMS5tMzMgPT09IG0yLm0zMyAmJiBtMS5tMzQgPT09IG0yLm0zNCAmJlxuICAgICAgbTEubTQxID09PSBtMi5tNDEgJiYgbTEubTQyID09PSBtMi5tNDIgJiYgbTEubTQzID09PSBtMi5tNDMgJiYgbTEubTQ0ID09PSBtMi5tNDQ7XG4gIH0sXG5cbiAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgTWF0cml4M2QoXG4gICAgICBtLm0xMSwgbS5tMTIsIG0ubTEzLCBtLm0xNCxcbiAgICAgIG0ubTIxLCBtLm0yMiwgbS5tMjMsIG0ubTI0LFxuICAgICAgbS5tMzEsIG0ubTMyLCBtLm0zMywgbS5tMzQsXG4gICAgICBtLm00MSwgbS5tNDIsIG0ubTQzLCBtLm00NFxuICAgICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqICBSZXR1cm4gdHJ1ZSBpZiB0aGUgbWF0cml4IGlzIGlkZW50aXR5LlxuICAgKi9cbiAgaXNJZGVudGl0eTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gVHlwZU1hc2suSWRlbnRpdHk7XG4gIH0sXG5cbiAgLyoqXG4gICAqICBSZXR1cm4gdHJ1ZSBpZiB0aGUgbWF0cml4IGNvbnRhaW5zIHRyYW5zbGF0ZSBvciBpcyBpZGVudGl0eS5cbiAgICovXG4gIGlzVHJhbnNsYXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gISh0aGlzLnR5cGUgJiB+VHlwZU1hc2suVHJhbnNsYXRlKTtcbiAgfSxcblxuICAvKipcbiAgICogIFJldHVybiB0cnVlIGlmIHRoZSBtYXRyaXggb25seSBjb250YWlucyBzY2FsZSBvciB0cmFuc2xhdGUgb3IgaXMgaWRlbnRpdHkuXG4gICAqL1xuICBpc1NjYWxlVHJhbnNsYXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gISh0aGlzLnR5cGUgJiB+KFR5cGVNYXNrLlNjYWxlIHwgVHlwZU1hc2suVHJhbnNsYXRlKSk7XG4gIH0sXG5cbiAgY29uY2F0OiBmdW5jdGlvbihtMikge1xuICAgIGlmICh0aGlzLmlzSWRlbnRpdHkoKSkgcmV0dXJuIG0yLmNsb25lKCk7XG4gICAgaWYgKG0yLmlzSWRlbnRpdHkoKSkgcmV0dXJuIHRoaXMuY2xvbmUoKTtcblxuICAgIHZhciBtID0gbmV3IE1hdHJpeDNkO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCA0OyBqKyspIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IDA7XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgNDsgaysrKSB7XG4gICAgICAgICAgdmFsdWUgKz0gdGhpc1trXVtpXSAqIG0yW2pdW2tdO1xuICAgICAgICB9XG4gICAgICAgIG1bal1baV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbTtcbiAgfSxcblxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uKHYzKSB7XG4gICAgdmFyIHRyYW5zbGF0aW9uTWF0cml4ID0gbmV3IE1hdHJpeDNkO1xuICAgIHRyYW5zbGF0aW9uTWF0cml4Lm00MSA9IHYzWzBdO1xuICAgIHRyYW5zbGF0aW9uTWF0cml4Lm00MiA9IHYzWzFdO1xuICAgIHRyYW5zbGF0aW9uTWF0cml4Lm00MyA9IHYzWzJdO1xuICAgIHJldHVybiB0aGlzLmNvbmNhdCh0cmFuc2xhdGlvbk1hdHJpeCk7XG4gIH0sXG5cbiAgc2NhbGU6IGZ1bmN0aW9uKHYzKSB7XG4gICAgdmFyIG0gPSBuZXcgTWF0cml4M2Q7XG4gICAgbS5tMTEgPSB2M1swXTtcbiAgICBtLm0yMiA9IHYzWzFdO1xuICAgIG0ubTMzID0gdjNbMl07XG4gICAgcmV0dXJuIHRoaXMuY29uY2F0KG0pO1xuICB9LFxuXG4gIHJvdGF0ZTogZnVuY3Rpb24odjRxKSB7XG4gICAgdmFyIHJvdGF0aW9uTWF0cml4ID0gbmV3IE1hdHJpeDNkO1xuXG4gICAgdmFyIHggPSB2NHFbMF07XG4gICAgdmFyIHkgPSB2NHFbMV07XG4gICAgdmFyIHogPSB2NHFbMl07XG4gICAgdmFyIHcgPSB2NHFbM107XG5cbiAgICByb3RhdGlvbk1hdHJpeC5tMTEgPSAxIC0gMiAqICh5ICogeSArIHogKiB6KTtcbiAgICByb3RhdGlvbk1hdHJpeC5tMjEgPSAyICogKHggKiB5IC0geiAqIHcpO1xuICAgIHJvdGF0aW9uTWF0cml4Lm0zMSA9IDIgKiAoeCAqIHogKyB5ICogdyk7XG4gICAgcm90YXRpb25NYXRyaXgubTEyID0gMiAqICh4ICogeSArIHogKiB3KTtcbiAgICByb3RhdGlvbk1hdHJpeC5tMjIgPSAxIC0gMiAqICh4ICogeCArIHogKiB6KTtcbiAgICByb3RhdGlvbk1hdHJpeC5tMzIgPSAyICogKHkgKiB6IC0geCAqIHcpO1xuICAgIHJvdGF0aW9uTWF0cml4Lm0xMyA9IDIgKiAoeCAqIHogLSB5ICogdyk7XG4gICAgcm90YXRpb25NYXRyaXgubTIzID0gMiAqICh5ICogeiArIHggKiB3KTtcbiAgICByb3RhdGlvbk1hdHJpeC5tMzMgPSAxIC0gMiAqICh4ICogeCArIHkgKiB5KTtcblxuICAgIHJldHVybiB0aGlzLmNvbmNhdChyb3RhdGlvbk1hdHJpeCk7XG4gIH0sXG5cbiAgc2tldzogZnVuY3Rpb24odjMpIHtcbiAgICB2YXIgc2tld01hdHJpeCA9IG5ldyBNYXRyaXgzZDtcblxuICAgIHNrZXdNYXRyaXhbMV1bMF0gPSB2M1swXTtcbiAgICBza2V3TWF0cml4WzJdWzBdID0gdjNbMV07XG4gICAgc2tld01hdHJpeFsyXVsxXSA9IHYzWzJdO1xuXG4gICAgcmV0dXJuIHRoaXMuY29uY2F0KHNrZXdNYXRyaXgpO1xuICB9LFxuXG4gIHBlcnNwZWN0aXZlOiBmdW5jdGlvbih2NCkge1xuICAgIHZhciBwZXJzcGVjdGl2ZU1hdHJpeCA9IG5ldyBNYXRyaXgzZDtcblxuICAgIHBlcnNwZWN0aXZlTWF0cml4Lm0xNCA9IHY0WzBdO1xuICAgIHBlcnNwZWN0aXZlTWF0cml4Lm0yNCA9IHY0WzFdO1xuICAgIHBlcnNwZWN0aXZlTWF0cml4Lm0zNCA9IHY0WzJdO1xuICAgIHBlcnNwZWN0aXZlTWF0cml4Lm00NCA9IHY0WzNdO1xuXG4gICAgcmV0dXJuIHRoaXMuY29uY2F0KHBlcnNwZWN0aXZlTWF0cml4KTtcbiAgfSxcblxuICBtYXA6IGZ1bmN0aW9uKHY0KSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBWZWN0b3I0O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IDA7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICB2YWx1ZSArPSB0aGlzW2pdW2ldICogdjRbal07XG4gICAgICB9XG4gICAgICByZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIGRldGVybWluYW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc0lkZW50aXR5KCkpIHJldHVybiAxO1xuICAgIGlmICh0aGlzLmlzU2NhbGVUcmFuc2xhdGUoKSkgcmV0dXJuIHRoaXNbMF1bMF0gKiB0aGlzWzFdWzFdICogdGhpc1syXVsyXSAqIHRoaXNbM11bM107XG5cbiAgICB2YXIgYTAwID0gdGhpc1swXVswXTtcbiAgICB2YXIgYTAxID0gdGhpc1swXVsxXTtcbiAgICB2YXIgYTAyID0gdGhpc1swXVsyXTtcbiAgICB2YXIgYTAzID0gdGhpc1swXVszXTtcbiAgICB2YXIgYTEwID0gdGhpc1sxXVswXTtcbiAgICB2YXIgYTExID0gdGhpc1sxXVsxXTtcbiAgICB2YXIgYTEyID0gdGhpc1sxXVsyXTtcbiAgICB2YXIgYTEzID0gdGhpc1sxXVszXTtcbiAgICB2YXIgYTIwID0gdGhpc1syXVswXTtcbiAgICB2YXIgYTIxID0gdGhpc1syXVsxXTtcbiAgICB2YXIgYTIyID0gdGhpc1syXVsyXTtcbiAgICB2YXIgYTIzID0gdGhpc1syXVszXTtcbiAgICB2YXIgYTMwID0gdGhpc1szXVswXTtcbiAgICB2YXIgYTMxID0gdGhpc1szXVsxXTtcbiAgICB2YXIgYTMyID0gdGhpc1szXVsyXTtcbiAgICB2YXIgYTMzID0gdGhpc1szXVszXTtcblxuICAgIHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gICAgdmFyIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgICB2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICAgIHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gICAgdmFyIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgICB2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICAgIHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gICAgdmFyIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgICB2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICAgIHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gICAgdmFyIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgICB2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG4gIH0sXG5cbiAgbm9ybWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbTQ0ID0gdGhpcy5tNDQ7XG4gICAgLy8gQ2Fubm90IG5vcm1hbGl6ZS5cbiAgICBpZiAobTQ0ID09PSAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICB2YXIgbm9ybWFsaXplZE1hdHJpeCA9IG5ldyBNYXRyaXgzZDtcblxuICAgIHZhciBzY2FsZSA9IDEgLyBtNDQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgNDsgaisrKVxuICAgICAgICBub3JtYWxpemVkTWF0cml4W2pdW2ldID0gdGhpc1tqXVtpXSAqIHNjYWxlO1xuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRNYXRyaXg7XG4gIH0sXG5cbiAgZGVjb21wb3NlOiBmdW5jdGlvbigpIHtcbiAgICAvLyBXZSdsbCBvcGVyYXRlIG9uIGEgY29weSBvZiB0aGUgbWF0cml4LlxuICAgIHZhciBtYXRyaXggPSB0aGlzLm5vcm1hbGl6ZSgpO1xuXG4gICAgLy8gSWYgd2UgY2Fubm90IG5vcm1hbGl6ZSB0aGUgbWF0cml4LCB0aGVuIGJhaWwgZWFybHkgYXMgd2UgY2Fubm90IGRlY29tcG9zZS5cbiAgICBpZiAoIW1hdHJpeCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdmFyIHBlcnNwZWN0aXZlTWF0cml4ID0gbWF0cml4LmNsb25lKCk7XG5cbiAgICB2YXIgaSwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHBlcnNwZWN0aXZlTWF0cml4W2ldWzNdID0gMDtcbiAgICBwZXJzcGVjdGl2ZU1hdHJpeFszXVszXSA9IDE7XG5cbiAgICAvLyBJZiB0aGUgcGVyc3BlY3RpdmUgbWF0cml4IGlzIG5vdCBpbnZlcnRpYmxlLCB3ZSBhcmUgYWxzbyB1bmFibGUgdG9cbiAgICAvLyBkZWNvbXBvc2UsIHNvIHdlJ2xsIGJhaWwgZWFybHkuIENvbnN0YW50IHRha2VuIGZyb20gU2tNYXRyaXg0NDo6aW52ZXJ0LlxuICAgIGlmIChNYXRoLmFicyhwZXJzcGVjdGl2ZU1hdHJpeC5kZXRlcm1pbmFudCgpKSA8IDFlLTgpIHJldHVybiBmYWxzZTtcblxuICAgIHZhciBwZXJzcGVjdGl2ZTtcblxuICAgIGlmIChtYXRyaXhbMF1bM10gIT09IDAgfHwgbWF0cml4WzFdWzNdICE9PSAwIHx8IG1hdHJpeFsyXVszXSAhPT0gMCkge1xuICAgICAgLy8gcmhzIGlzIHRoZSByaWdodCBoYW5kIHNpZGUgb2YgdGhlIGVxdWF0aW9uLlxuICAgICAgdmFyIHJpZ2h0SGFuZFNpZGUgPSBuZXcgVmVjdG9yNChcbiAgICAgICAgbWF0cml4WzBdWzNdLFxuICAgICAgICBtYXRyaXhbMV1bM10sXG4gICAgICAgIG1hdHJpeFsyXVszXSxcbiAgICAgICAgbWF0cml4WzNdWzNdXG4gICAgICApO1xuXG4gICAgICAvLyBTb2x2ZSB0aGUgZXF1YXRpb24gYnkgaW52ZXJ0aW5nIHBlcnNwZWN0aXZlTWF0cml4IGFuZCBtdWx0aXBseWluZ1xuICAgICAgLy8gcmlnaHRIYW5kU2lkZSBieSB0aGUgaW52ZXJzZS5cbiAgICAgIHZhciBpbnZlcnNlUGVyc3BlY3RpdmVNYXRyaXggPSBwZXJzcGVjdGl2ZU1hdHJpeC5pbnZlcnQoKTtcbiAgICAgIGlmICghaW52ZXJzZVBlcnNwZWN0aXZlTWF0cml4KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHZhciB0cmFuc3Bvc2VkSW52ZXJzZVBlcnNwZWN0aXZlTWF0cml4ID0gaW52ZXJzZVBlcnNwZWN0aXZlTWF0cml4LnRyYW5zcG9zZSgpO1xuXG4gICAgICBwZXJzcGVjdGl2ZSA9IHRyYW5zcG9zZWRJbnZlcnNlUGVyc3BlY3RpdmVNYXRyaXgubWFwKHJpZ2h0SGFuZFNpZGUpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIHBlcnNwZWN0aXZlLlxuICAgICAgcGVyc3BlY3RpdmUgPSBuZXcgVmVjdG9yNCgwLCAwLCAwLCAxKTtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNsYXRlID0gbmV3IFZlY3RvcjM7XG4gICAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykgdHJhbnNsYXRlW2ldID0gbWF0cml4WzNdW2ldO1xuXG4gICAgdmFyIHJvdyA9IFtdO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgdmFyIHYzID0gcm93W2ldID0gbmV3IFZlY3RvcjM7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgMzsgKytqKVxuICAgICAgICB2M1tqXSA9IG1hdHJpeFtpXVtqXTtcbiAgICB9XG5cbiAgICAvLyBDb21wdXRlIFggc2NhbGUgZmFjdG9yIGFuZCBub3JtYWxpemUgZmlyc3Qgcm93LlxuICAgIHZhciBzY2FsZSA9IG5ldyBWZWN0b3IzO1xuICAgIHNjYWxlWzBdID0gcm93WzBdLmxlbmd0aCgpO1xuICAgIHJvd1swXSA9IHJvd1swXS5ub3JtYWxpemUoKTtcblxuICAgIC8vIENvbXB1dGUgWFkgc2hlYXIgZmFjdG9yIGFuZCBtYWtlIDJuZCByb3cgb3J0aG9nb25hbCB0byAxc3QuXG4gICAgdmFyIHNrZXcgPSBuZXcgVmVjdG9yMztcbiAgICBza2V3WzBdID0gcm93WzBdLmRvdChyb3dbMV0pO1xuICAgIHJvd1sxXSA9IHJvd1sxXS5jb21iaW5lKHJvd1swXSwgMS4wLCAtc2tld1swXSk7XG5cbiAgICAvLyBOb3csIGNvbXB1dGUgWSBzY2FsZSBhbmQgbm9ybWFsaXplIDJuZCByb3cuXG4gICAgc2NhbGVbMV0gPSByb3dbMV0ubGVuZ3RoKCk7XG4gICAgcm93WzFdID0gcm93WzFdLm5vcm1hbGl6ZSgpO1xuXG4gICAgc2tld1swXSAvPSBzY2FsZVsxXTtcblxuICAgIC8vIENvbXB1dGUgWFogYW5kIFlaIHNoZWFycywgb3J0aG9nb25hbGl6ZSAzcmQgcm93XG4gICAgc2tld1sxXSA9IHJvd1swXS5kb3Qocm93WzJdKTtcbiAgICByb3dbMl0gPSByb3dbMl0uY29tYmluZShyb3dbMF0sIDEuMCwgLXNrZXdbMV0pO1xuICAgIHNrZXdbMl0gPSByb3dbMV0uZG90KHJvd1syXSk7XG4gICAgcm93WzJdID0gcm93WzJdLmNvbWJpbmUocm93WzFdLCAxLjAsIC1za2V3WzJdKTtcblxuICAgIC8vIE5leHQsIGdldCBaIHNjYWxlIGFuZCBub3JtYWxpemUgM3JkIHJvdy5cbiAgICBzY2FsZVsyXSA9IHJvd1syXS5sZW5ndGgoKTtcbiAgICByb3dbMl0gPSByb3dbMl0ubm9ybWFsaXplKCk7XG4gICAgc2tld1sxXSAvPSBzY2FsZVsyXTtcbiAgICBza2V3WzJdIC89IHNjYWxlWzJdO1xuXG4gICAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIG1hdHJpeCAoaW4gcm93cykgaXMgb3J0aG9ub3JtYWwuXG4gICAgLy8gQ2hlY2sgZm9yIGEgY29vcmRpbmF0ZSBzeXN0ZW0gZmxpcC4gIElmIHRoZSBkZXRlcm1pbmFudFxuICAgIC8vIGlzIC0xLCB0aGVuIG5lZ2F0ZSB0aGUgbWF0cml4IGFuZCB0aGUgc2NhbGluZyBmYWN0b3JzLlxuICAgIHZhciBwZHVtMyA9IHJvd1sxXS5jcm9zcyhyb3dbMl0pO1xuICAgIGlmIChyb3dbMF0uZG90KHBkdW0zKSA8IDApIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgc2NhbGVbaV0gKj0gLTE7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCAzOyArK2opXG4gICAgICAgICAgcm93W2ldW2pdICo9IC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBxdWF0ZXJuaW9uID0gbmV3IFZlY3RvcjQoXG4gICAgICAwLjUgKiBNYXRoLnNxcnQoTWF0aC5tYXgoMSArIHJvd1swXVswXSAtIHJvd1sxXVsxXSAtIHJvd1syXVsyXSwgMCkpLFxuICAgICAgMC41ICogTWF0aC5zcXJ0KE1hdGgubWF4KDEgLSByb3dbMF1bMF0gKyByb3dbMV1bMV0gLSByb3dbMl1bMl0sIDApKSxcbiAgICAgIDAuNSAqIE1hdGguc3FydChNYXRoLm1heCgxIC0gcm93WzBdWzBdIC0gcm93WzFdWzFdICsgcm93WzJdWzJdLCAwKSksXG4gICAgICAwLjUgKiBNYXRoLnNxcnQoTWF0aC5tYXgoMSArIHJvd1swXVswXSArIHJvd1sxXVsxXSArIHJvd1syXVsyXSwgMCkpXG4gICAgKTtcblxuICAgIGlmIChyb3dbMl1bMV0gPiByb3dbMV1bMl0pIHF1YXRlcm5pb25bMF0gPSAtcXVhdGVybmlvblswXTtcbiAgICBpZiAocm93WzBdWzJdID4gcm93WzJdWzBdKSBxdWF0ZXJuaW9uWzFdID0gLXF1YXRlcm5pb25bMV07XG4gICAgaWYgKHJvd1sxXVswXSA+IHJvd1swXVsxXSkgcXVhdGVybmlvblsyXSA9IC1xdWF0ZXJuaW9uWzJdO1xuXG4gICAgcmV0dXJuIG5ldyBEZWNvbXBvc2VkTWF0cml4KHBlcnNwZWN0aXZlLCB0cmFuc2xhdGUsIHF1YXRlcm5pb24sIHNrZXcsIHNjYWxlKTtcbiAgfSxcblxuICBpbnZlcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhMDAgPSB0aGlzWzBdWzBdO1xuICAgIHZhciBhMDEgPSB0aGlzWzBdWzFdO1xuICAgIHZhciBhMDIgPSB0aGlzWzBdWzJdO1xuICAgIHZhciBhMDMgPSB0aGlzWzBdWzNdO1xuICAgIHZhciBhMTAgPSB0aGlzWzFdWzBdO1xuICAgIHZhciBhMTEgPSB0aGlzWzFdWzFdO1xuICAgIHZhciBhMTIgPSB0aGlzWzFdWzJdO1xuICAgIHZhciBhMTMgPSB0aGlzWzFdWzNdO1xuICAgIHZhciBhMjAgPSB0aGlzWzJdWzBdO1xuICAgIHZhciBhMjEgPSB0aGlzWzJdWzFdO1xuICAgIHZhciBhMjIgPSB0aGlzWzJdWzJdO1xuICAgIHZhciBhMjMgPSB0aGlzWzJdWzNdO1xuICAgIHZhciBhMzAgPSB0aGlzWzNdWzBdO1xuICAgIHZhciBhMzEgPSB0aGlzWzNdWzFdO1xuICAgIHZhciBhMzIgPSB0aGlzWzNdWzJdO1xuICAgIHZhciBhMzMgPSB0aGlzWzNdWzNdO1xuXG4gICAgdmFyIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgICB2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICAgIHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gICAgdmFyIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgICB2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICAgIHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gICAgdmFyIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgICB2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICAgIHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gICAgdmFyIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgICB2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICAgIHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgdmFyIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIC8vIElmIGRldCBpcyB6ZXJvLCB3ZSB3YW50IHRvIHJldHVybiBmYWxzZS4gSG93ZXZlciwgd2UgYWxzbyB3YW50IHRvIHJldHVybiBmYWxzZVxuICAgIC8vIGlmIDEvZGV0IG92ZXJmbG93cyB0byBpbmZpbml0eSAoaS5lLiBkZXQgaXMgZGVub3JtYWxpemVkKS4gQm90aCBvZiB0aGVzZSBhcmVcbiAgICAvLyBoYW5kbGVkIGJ5IGNoZWNraW5nIHRoYXQgMS9kZXQgaXMgZmluaXRlLlxuICAgIGlmIChkZXQgPT09IDAgfHwgIWlzRmluaXRlKGRldCkpIHJldHVybiBmYWxzZTtcblxuICAgIHZhciBpbnZkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBiMDAgKj0gaW52ZGV0O1xuICAgIGIwMSAqPSBpbnZkZXQ7XG4gICAgYjAyICo9IGludmRldDtcbiAgICBiMDMgKj0gaW52ZGV0O1xuICAgIGIwNCAqPSBpbnZkZXQ7XG4gICAgYjA1ICo9IGludmRldDtcbiAgICBiMDYgKj0gaW52ZGV0O1xuICAgIGIwNyAqPSBpbnZkZXQ7XG4gICAgYjA4ICo9IGludmRldDtcbiAgICBiMDkgKj0gaW52ZGV0O1xuICAgIGIxMCAqPSBpbnZkZXQ7XG4gICAgYjExICo9IGludmRldDtcblxuICAgIHJldHVybiBuZXcgTWF0cml4M2QoXG4gICAgICBhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDksXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXG4gICAgICBhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMsXG4gICAgICBhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMsXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXG4gICAgICBhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcsXG4gICAgICBhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEsXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXG4gICAgICBhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYsXG4gICAgICBhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYsXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXG4gICAgICBhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDAsXG4gICAgICBhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYsXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXG4gICAgICBhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDAsXG4gICAgICBhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDBcbiAgICApO1xuICB9LFxuXG4gIC8vIFczQ1xuICB0cmFuc3Bvc2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgTWF0cml4M2QoXG4gICAgICBtLm0xMSwgbS5tMjEsIG0ubTMxLCBtLm00MSxcbiAgICAgIG0ubTEyLCBtLm0yMiwgbS5tMzIsIG0ubTQyLFxuICAgICAgbS5tMTMsIG0ubTIzLCBtLm0zMywgbS5tNDMsXG4gICAgICBtLm0xNCwgbS5tMjQsIG0ubTM0LCBtLm00NFxuICAgICk7XG4gIH0sXG5cbiAgaW50ZXJwb2xhdGlvbjogZnVuY3Rpb24obWF0cml4KSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXhJbnRlcnBvbGF0aW9uKHRoaXMsIG1hdHJpeCk7XG4gIH0sXG5cbiAgdG9BcnJheTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaXMyZCgpID8gdGhpcy50b0FycmF5MmQoKSA6IHRoaXMudG9BcnJheTNkKCk7XG4gIH0sXG5cbiAgdG9BcnJheTNkOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbSA9IHRoaXM7XG5cbiAgICByZXR1cm4gW1xuICAgICAgbS5tMTEsIG0ubTEyLCBtLm0xMywgbS5tMTQsXG4gICAgICBtLm0yMSwgbS5tMjIsIG0ubTIzLCBtLm0yNCxcbiAgICAgIG0ubTMxLCBtLm0zMiwgbS5tMzMsIG0ubTM0LFxuICAgICAgbS5tNDEsIG0ubTQyLCBtLm00MywgbS5tNDRcbiAgICBdO1xuICB9LFxuXG4gIHRvQXJyYXkyZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG0gPSB0aGlzO1xuXG4gICAgcmV0dXJuICBbXG4gICAgICBtLmEsIG0uYixcbiAgICAgIG0uYywgbS5kLFxuICAgICAgbS5lLCBtLmZcbiAgICBdO1xuICB9LFxuXG4gIHRvU3RyaW5nOiBmdW5jdGlvbihwbGFjZXMpIHtcbiAgICByZXR1cm4gdGhpcy5pczJkKCkgPyB0aGlzLnRvU3RyaW5nMmQocGxhY2VzKSA6IHRoaXMudG9TdHJpbmczZChwbGFjZXMpO1xuICB9LFxuXG4gIHRvU3RyaW5nM2Q6IGZ1bmN0aW9uKHBsYWNlcykge1xuICAgIHJldHVybiAnbWF0cml4M2QoJyArIHN0cmluZ2lmeSh0aGlzLnRvQXJyYXkzZCgpKS5qb2luKCcsICcpICsgJyknO1xuICB9LFxuXG4gIHRvU3RyaW5nMmQ6IGZ1bmN0aW9uKHBsYWNlcykge1xuICAgIHJldHVybiAgJ21hdHJpeCgnICsgc3RyaW5naWZ5KHRoaXMudG9BcnJheTJkKCkpLmpvaW4oJywgJykgKyAnKSc7XG4gIH1cblxufSk7XG5cbnZhciBEZWNvbXBvc2VkTWF0cml4ID0gcHJpbWUoe1xuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBEZWNvbXBvc2VkTWF0cml4KHBlcnNwZWN0aXZlLCB0cmFuc2xhdGUsIHF1YXRlcm5pb24sIHNrZXcsIHNjYWxlKSB7XG4gICAgdGhpcy5wZXJzcGVjdGl2ZSA9IHBlcnNwZWN0aXZlO1xuICAgIHRoaXMudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xuICAgIHRoaXMucXVhdGVybmlvbiA9IHF1YXRlcm5pb247XG4gICAgdGhpcy5za2V3ID0gc2tldztcbiAgICB0aGlzLnNjYWxlID0gc2NhbGU7XG4gIH0sXG5cbiAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uKHRvLCBkZWx0YSkge1xuICAgIHZhciBmcm9tID0gdGhpcztcblxuICAgIHZhciBwZXJzcGVjdGl2ZSA9IGZyb20ucGVyc3BlY3RpdmUubGVycCh0by5wZXJzcGVjdGl2ZSwgZGVsdGEpO1xuICAgIHZhciB0cmFuc2xhdGUgPSBmcm9tLnRyYW5zbGF0ZS5sZXJwKHRvLnRyYW5zbGF0ZSwgZGVsdGEpO1xuICAgIHZhciBxdWF0ZXJuaW9uID0gZnJvbS5xdWF0ZXJuaW9uLnNsZXJwKHRvLnF1YXRlcm5pb24sIGRlbHRhKTtcbiAgICB2YXIgc2tldyA9IGZyb20uc2tldy5sZXJwKHRvLnNrZXcsIGRlbHRhKTtcbiAgICB2YXIgc2NhbGUgPSBmcm9tLnNjYWxlLmxlcnAodG8uc2NhbGUsIGRlbHRhKTtcbiAgICByZXR1cm4gbmV3IERlY29tcG9zZWRNYXRyaXgocGVyc3BlY3RpdmUsIHRyYW5zbGF0ZSwgcXVhdGVybmlvbiwgc2tldywgc2NhbGUpO1xuICB9LFxuXG4gIGNvbXBvc2U6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgTWF0cml4M2QoKVxuICAgICAgLnBlcnNwZWN0aXZlKHRoaXMucGVyc3BlY3RpdmUpXG4gICAgICAudHJhbnNsYXRlKHRoaXMudHJhbnNsYXRlKVxuICAgICAgLnJvdGF0ZSh0aGlzLnF1YXRlcm5pb24pXG4gICAgICAuc2tldyh0aGlzLnNrZXcpXG4gICAgICAuc2NhbGUodGhpcy5zY2FsZSk7XG4gIH1cblxufSk7XG5cbnZhciBNYXRyaXhJbnRlcnBvbGF0aW9uID0gcHJpbWUoe1xuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBNYXRyaXhJbnRlcnBvbGF0aW9uKGZyb20sIHRvKSB7XG4gICAgdGhpcy5tYXRyaXgxID0gZnJvbTtcbiAgICB0aGlzLm1hdHJpeDIgPSB0bztcbiAgICB0aGlzLmZyb20gPSBmcm9tLmRlY29tcG9zZSgpO1xuICAgIHRoaXMudG8gPSB0by5kZWNvbXBvc2UoKTtcbiAgfSxcblxuICBzdGVwOiBmdW5jdGlvbihkZWx0YSkge1xuICAgIGlmIChkZWx0YSA9PT0gMCkgcmV0dXJuIHRoaXMubWF0cml4MTtcbiAgICBpZiAoZGVsdGEgPT09IDEpIHJldHVybiB0aGlzLm1hdHJpeDI7XG4gICAgcmV0dXJuIHRoaXMuZnJvbS5pbnRlcnBvbGF0ZSh0aGlzLnRvLCBkZWx0YSkuY29tcG9zZSgpO1xuICB9XG5cbn0pO1xuXG5NYXRyaXgzZC5EZWNvbXBvc2VkID0gRGVjb21wb3NlZE1hdHJpeDtcbk1hdHJpeDNkLkludGVycG9sYXRpb24gPSBNYXRyaXhJbnRlcnBvbGF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hdHJpeDNkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL01hdHJpeDNkJyk7XG4iLCIvLyBUcmFuc2Zvcm0gT3BlcmF0aW9uc1xuLy8gU29tZSBtZXRob2RzIGFyZSBwb3J0ZWQgZnJvbSB0aGUgQ2hyb21pdW0gc291cmNlOiB0cmFuc2Zvcm0uY2MsIHRyYW5zZm9ybV9vcGVydGFpb24uY2MsIHRyYW5zZm9ybV9vcGVyYXRpb25zLmNjXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwcmltZSA9IHJlcXVpcmUoJ3ByaW1lJyk7XG5cbnZhciBNYXRyaXgzZCA9IHJlcXVpcmUoJ21hdHJpeDNkJyk7XG52YXIgVmVjdG9yMyA9IHJlcXVpcmUoJ21hdHJpeDNkL2xpYi9WZWN0b3IzJyk7XG52YXIgVmVjdG9yNCA9IHJlcXVpcmUoJ21hdHJpeDNkL2xpYi9WZWN0b3I0Jyk7XG5cbnZhciBlcHNpbG9uID0gMWUtNDtcblxudmFyIHRhbkRlZyA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgdmFyIHJhZGlhbnMgPSBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbiAgcmV0dXJuIE1hdGgudGFuKHJhZGlhbnMpO1xufTtcblxudmFyIFRyYW5zbGF0ZU9wZXJhdGlvbiA9IGV4cG9ydHMuVHJhbnNsYXRlID0gcHJpbWUoe1xuXG4gIHR5cGU6ICdUcmFuc2xhdGUnLFxuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBUcmFuc2xhdGVPcGVyYXRpb24odjMpIHtcbiAgICB0aGlzLnZhbHVlID0gdjMgfHwgbmV3IFZlY3RvcjMoMCwgMCwgMCk7XG4gIH0sXG5cbiAgZXF1YWxzOiBmdW5jdGlvbih0cmFuc2xhdGVPcGVyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZS5lcXVhbHModHJhbnNsYXRlT3BlcmF0aW9uLnZhbHVlKTtcbiAgfSxcblxuICBpbnRlcnBvbGF0ZTogZnVuY3Rpb24odHJhbnNsYXRlT3BlcmF0aW9uLCBkZWx0YSkge1xuICAgIHJldHVybiBuZXcgVHJhbnNsYXRlT3BlcmF0aW9uKHRoaXMudmFsdWUubGVycCh0cmFuc2xhdGVPcGVyYXRpb24udmFsdWUsIGRlbHRhKSk7XG4gIH0sXG5cbiAgaXNJZGVudGl0eTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWUuZXF1YWxzKG5ldyBWZWN0b3IzKDAsIDAsIDApKTtcbiAgfSxcblxuICBjb21wb3NlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDNkKCkudHJhbnNsYXRlKHRoaXMudmFsdWUpO1xuICB9LFxuXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHRoaXMudmFsdWU7XG4gICAgcmV0dXJuICd0cmFuc2xhdGUzZCgnICsgW3YueCArICdweCcsIHYueSArICdweCcsIHYueiArICdweCddLmpvaW4oJywgJykgKyAnKSc7XG4gIH1cblxufSk7XG5cbnZhciBTY2FsZU9wZXJhdGlvbiA9IGV4cG9ydHMuU2NhbGUgPSBwcmltZSh7XG5cbiAgdHlwZTogJ1NjYWxlJyxcblxuICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gU2NhbGVPcGVyYXRpb24odjMpIHtcbiAgICB0aGlzLnZhbHVlID0gdjMgfHwgbmV3IFZlY3RvcjMoMSwgMSwgMSk7XG4gIH0sXG5cbiAgZXF1YWxzOiBmdW5jdGlvbihzY2FsZU9wZXJhdGlvbikge1xuICAgIHJldHVybiB0aGlzLnZhbHVlLmVxdWFscyhzY2FsZU9wZXJhdGlvbi52YWx1ZSk7XG4gIH0sXG5cbiAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uKHNjYWxlT3BlcmF0aW9uLCBkZWx0YSkge1xuICAgIHJldHVybiBuZXcgU2NhbGVPcGVyYXRpb24odGhpcy52YWx1ZS5sZXJwKHNjYWxlT3BlcmF0aW9uLnZhbHVlLCBkZWx0YSkpO1xuICB9LFxuXG4gIGlzSWRlbnRpdHk6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlLmVxdWFscyhuZXcgVmVjdG9yMygxLCAxLCAxKSk7XG4gIH0sXG5cbiAgY29tcG9zZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXgzZCgpLnNjYWxlKHRoaXMudmFsdWUpO1xuICB9LFxuXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHRoaXMudmFsdWU7XG4gICAgcmV0dXJuICdzY2FsZTNkKCcgKyBbdi54LCB2LnksIHYuel0uam9pbignLCAnKSArICcpJztcbiAgfVxuXG59KTtcblxudmFyIFJvdGF0ZU9wZXJhdGlvbiA9IGV4cG9ydHMuUm90YXRlID0gcHJpbWUoe1xuXG4gIHR5cGU6ICdSb3RhdGUnLFxuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBSb3RhdGVPcGVyYXRpb24odjQpIHtcbiAgICB0aGlzLnZhbHVlID0gdjQgfHwgbmV3IFZlY3RvcjQoMSwgMSwgMSwgMCk7XG4gIH0sXG5cbiAgZXF1YWxzOiBmdW5jdGlvbih0bykge1xuICAgIHJldHVybiB0aGlzLnZhbHVlLmVxdWFscyh0by52YWx1ZSk7XG4gIH0sXG5cbiAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uKHJvdGF0ZU9wZXJhdGlvbiwgZGVsdGEpIHtcblxuICAgIHZhciBmcm9tID0gdGhpcy52YWx1ZTtcbiAgICB2YXIgdG8gPSByb3RhdGVPcGVyYXRpb24udmFsdWU7XG5cbiAgICB2YXIgZnJvbUF4aXMgPSBuZXcgVmVjdG9yMyhmcm9tLngsIGZyb20ueSwgZnJvbS56KTtcbiAgICB2YXIgdG9BeGlzID0gbmV3IFZlY3RvcjModG8ueCwgdG8ueSwgdG8ueik7XG5cbiAgICBpZiAoZnJvbUF4aXMuZXF1YWxzKHRvQXhpcykpIHtcbiAgICAgIHJldHVybiBuZXcgUm90YXRlT3BlcmF0aW9uKG5ldyBWZWN0b3I0KFxuICAgICAgICBmcm9tLngsXG4gICAgICAgIGZyb20ueSxcbiAgICAgICAgZnJvbS56LFxuICAgICAgICBmcm9tLncgKiAoMSAtIGRlbHRhKSArIHRvLncgKiBkZWx0YVxuICAgICAgKSk7XG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aDEgPSBmcm9tQXhpcy5sZW5ndGgoKTtcbiAgICB2YXIgbGVuZ3RoMiA9IHRvQXhpcy5sZW5ndGgoKTtcblxuICAgIGlmIChsZW5ndGgxID4gZXBzaWxvbiAmJiBsZW5ndGgyID4gZXBzaWxvbikge1xuICAgICAgdmFyIGRvdCA9IGZyb21BeGlzLmRvdCh0b0F4aXMpO1xuXG4gICAgICB2YXIgZXJyb3IgPSBNYXRoLmFicygxIC0gKGRvdCAqIGRvdCkgLyAobGVuZ3RoMSAqIGxlbmd0aDIpKTtcbiAgICAgIHZhciByZXN1bHQgPSBlcnJvciA8IGVwc2lsb247XG4gICAgICBpZiAocmVzdWx0KSByZXR1cm4gbmV3IFJvdGF0ZU9wZXJhdGlvbihuZXcgVmVjdG9yNChcbiAgICAgICAgdG8ueCxcbiAgICAgICAgdG8ueSxcbiAgICAgICAgdG8ueixcbiAgICAgICAgLy8gSWYgdGhlIGF4ZXMgYXJlIHBvaW50aW5nIGluIG9wcG9zaXRlIGRpcmVjdGlvbnMsIHdlIG5lZWQgdG8gcmV2ZXJzZVxuICAgICAgICAvLyB0aGUgYW5nbGUuXG4gICAgICAgIGRvdCA+IDAgPyBmcm9tLncgOiAtZnJvbS53XG4gICAgICApKTtcbiAgICB9XG5cbiAgICB2YXIgaW50ZXJwb2xhdGVkID0gZnJvbS5hbmdsZVRvUXVhdGVybmlvbih0cnVlKS5zbGVycCh0by5hbmdsZVRvUXVhdGVybmlvbih0cnVlKSk7XG4gICAgcmV0dXJuIG5ldyBSb3RhdGVPcGVyYXRpb24oaW50ZXJwb2xhdGVkLnF1YXRlcm5pb25Ub0FuZ2xlKHRydWUpKTtcbiAgfSxcblxuICBpc0lkZW50aXR5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZS5lcXVhbHMobmV3IFZlY3RvcjQoMSwgMSwgMSwgMCkpO1xuICB9LFxuXG4gIGNvbXBvc2U6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgTWF0cml4M2QoKS5yb3RhdGUodGhpcy52YWx1ZS5hbmdsZVRvUXVhdGVybmlvbih0cnVlKSk7XG4gIH0sXG5cbiAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdGhpcy52YWx1ZTtcbiAgICByZXR1cm4gJ3JvdGF0ZTNkKCcgKyBbdi54LCB2LnksIHYueiwgdi53ICsgJ2RlZyddLmpvaW4oJywgJykgKyAnKSc7XG4gIH1cblxufSk7XG5cbnZhciBQZXJzcGVjdGl2ZU9wZXJhdGlvbiA9IGV4cG9ydHMuUGVyc3BlY3RpdmUgPSBwcmltZSh7XG5cbiAgdHlwZTogJ1BlcnNwZWN0aXZlJyxcblxuICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gUGVyc3BlY3RpdmVPcGVyYXRpb24obGVuZ3RoKSB7XG4gICAgdGhpcy52YWx1ZSA9IGxlbmd0aCB8fCAwO1xuICB9LFxuXG4gIGVxdWFsczogZnVuY3Rpb24ocGVyc3BlY3RpdmVPcGVyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gcGVyc3BlY3RpdmVPcGVyYXRpb24udmFsdWU7XG4gIH0sXG5cbiAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uKHBlcnNwZWN0aXZlT3BlcmF0aW9uLCBkZWx0YSkge1xuICAgIHJldHVybiBuZXcgUGVyc3BlY3RpdmVPcGVyYXRpb24odGhpcy52YWx1ZSAqICgxIC0gZGVsdGEpICsgcGVyc3BlY3RpdmVPcGVyYXRpb24udmFsdWUgKiBkZWx0YSk7XG4gIH0sXG5cbiAgaXNJZGVudGl0eTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWUgPT09IDA7XG4gIH0sXG5cbiAgY29tcG9zZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBlcnNwZWN0aXZlTWF0cml4ID0gbmV3IE1hdHJpeDNkO1xuICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgaWYgKHZhbHVlICE9PSAwKSBwZXJzcGVjdGl2ZU1hdHJpeC5tMzQgPSAtMSAvIHZhbHVlO1xuICAgIHJldHVybiBwZXJzcGVjdGl2ZU1hdHJpeDtcbiAgfSxcblxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdwZXJzcGVjdGl2ZSgnICsgdGhpcy52YWx1ZSArICcpJztcbiAgfVxuXG59KTtcblxudmFyIFNrZXdPcGVyYXRpb24gPSBleHBvcnRzLlNrZXcgPSBwcmltZSh7XG5cbiAgdHlwZTogJ1NrZXcnLFxuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBTa2V3T3BlcmF0aW9uKFhZKSB7XG4gICAgdGhpcy52YWx1ZSA9IFhZIHx8IFswLCAwXTtcbiAgfSxcblxuICBlcXVhbHM6IGZ1bmN0aW9uKHNrZXdPcGVyYXRpb24pIHtcbiAgICB2YXIgYXJyYXkxID0gdGhpcy52YWx1ZTtcbiAgICB2YXIgYXJyYXkyID0gc2tld09wZXJhdGlvbi52YWx1ZTtcbiAgICByZXR1cm4gYXJyYXkxWzBdID09PSBhcnJheTJbMF0gJiYgYXJyYXkxWzFdID09PSBhcnJheTJbMV07XG4gIH0sXG5cbiAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uKHNrZXdPcGVyYXRpb24sIGRlbHRhKSB7XG4gICAgcmV0dXJuIG5ldyBTa2V3T3BlcmF0aW9uKFtcbiAgICAgIHRoaXNbMF0gKiAoMSAtIGRlbHRhKSArIHNrZXdPcGVyYXRpb25bMF0gKiBkZWx0YSxcbiAgICAgIHRoaXNbMV0gKiAoMSAtIGRlbHRhKSArIHNrZXdPcGVyYXRpb25bMV0gKiBkZWx0YVxuICAgIF0pO1xuICB9LFxuXG4gIGlzSWRlbnRpdHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcnJheSA9IHRoaXMudmFsdWU7XG4gICAgcmV0dXJuIGFycmF5WzBdID09PSAwICYmIGFycmF5WzFdID09PSAwO1xuICB9LFxuXG4gIGNvbXBvc2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgdmFyIHNrZXdNYXRyaXggPSBuZXcgTWF0cml4M2Q7XG4gICAgc2tld01hdHJpeC5tMjEgPSB0YW5EZWcodmFsdWVbMF0pO1xuICAgIHNrZXdNYXRyaXgubTEyID0gdGFuRGVnKHZhbHVlWzFdKTtcbiAgICByZXR1cm4gc2tld01hdHJpeDtcbiAgfSxcblxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB0aGlzLnZhbHVlO1xuICAgIHJldHVybiAnc2tld1goJyArIHZbMF0gKyAnKSBza2V3WSgnICsgdlsxXSArICcpJztcbiAgfVxuXG59KTtcblxudmFyIE1hdHJpeE9wZXJhdGlvbiA9IGV4cG9ydHMuTWF0cml4ID0gcHJpbWUoe1xuXG4gIHR5cGU6ICdNYXRyaXgnLFxuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBNYXRyaXhPcGVyYXRpb24obWF0cml4LCBfZGVjb21wb3NlZCkge1xuICAgIHRoaXMudmFsdWUgPSBtYXRyaXggfHwgbmV3IE1hdHJpeDNkO1xuICAgIHRoaXMuZGVjb21wb3NlZCA9IF9kZWNvbXBvc2VkIHx8IHRoaXMudmFsdWUuZGVjb21wb3NlKCk7XG4gIH0sXG5cbiAgZXF1YWxzOiBmdW5jdGlvbihtYXRyaXhPcGVyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZS5lcXVhbHMobWF0cml4T3BlcmF0aW9uLnZhbHVlKTtcbiAgfSxcblxuICBpbnRlcnBvbGF0ZTogZnVuY3Rpb24obWF0cml4T3BlcmF0aW9uLCBkZWx0YSkge1xuICAgIHZhciBkZWNvbXBvc2VkID0gdGhpcy5kZWNvbXBvc2VkLmludGVycG9sYXRlKG1hdHJpeE9wZXJhdGlvbi5kZWNvbXBvc2VkLCBkZWx0YSk7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXhPcGVyYXRpb24oZGVjb21wb3NlZC5jb21wb3NlKCksIGRlY29tcG9zZWQpO1xuICB9LFxuXG4gIGlzSWRlbnRpdHk6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlLmlzSWRlbnRpdHkoKTtcbiAgfSxcblxuICBjb21wb3NlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfSxcblxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuXG59KTtcbiIsIi8vIFRyYW5zZm9ybSBtZXRob2RzIGFuZCBJbnRlcnBvbGF0aW9uXG4vLyBTb21lIG1ldGhvZHMgYXJlIHBvcnRlZCBmcm9tIHRoZSBDaHJvbWl1bSBzb3VyY2U6IHRyYW5zZm9ybS5jYywgdHJhbnNmb3JtX29wZXJ0YWlvbi5jYywgdHJhbnNmb3JtX29wZXJhdGlvbnMuY2Ncbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2Nzcy10cmFuc2Zvcm1zLTEvI2ludGVycG9sYXRpb24tb2YtdHJhbnNmb3Jtc1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHJpbWUgPSByZXF1aXJlKCdwcmltZScpO1xuXG52YXIgTWF0cml4M2QgPSByZXF1aXJlKCdtYXRyaXgzZCcpO1xudmFyIFZlY3RvcjMgPSByZXF1aXJlKCdtYXRyaXgzZC9saWIvVmVjdG9yMycpO1xudmFyIFZlY3RvcjQgPSByZXF1aXJlKCdtYXRyaXgzZC9saWIvVmVjdG9yNCcpO1xuXG52YXIgb3BlcmF0aW9ucyA9IHJlcXVpcmUoJy4vb3BlcmF0aW9ucycpO1xuXG52YXIgc2xpY2VfID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG52YXIgVHJhbnNmb3JtM2QgPSBwcmltZSh7XG5cbiAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIFRyYW5zZm9ybTNkKG9wZXJhdGlvbnMpIHtcbiAgICB0aGlzLm9wZXJhdGlvbnMgPSBvcGVyYXRpb25zIHx8IFtdO1xuICB9LFxuXG4gIGFwcGVuZDogZnVuY3Rpb24ob3BlcmF0aW9uKSB7XG4gICAgdGhpcy5vcGVyYXRpb25zLnB1c2gob3BlcmF0aW9uKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBpc0lkZW50aXR5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3BlcmF0aW9ucyA9IHRoaXMub3BlcmF0aW9ucztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghb3BlcmF0aW9uc1tpXS5pc0lkZW50aXR5KCkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgLy8gbWF0cml4XG5cbiAgbWF0cml4M2Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZChuZXcgb3BlcmF0aW9ucy5NYXRyaXgobmV3IE1hdHJpeDNkKGFyZ3VtZW50cykpKTtcbiAgfSxcblxuICBtYXRyaXg6IGZ1bmN0aW9uKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRyaXgzZChhLCBiLCBjLCBkLCBlLCBmKTtcbiAgfSxcblxuICAvLyB0cmFuc2xhdGVcblxuICB0cmFuc2xhdGUzZDogZnVuY3Rpb24oeCwgeSwgeikge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZChuZXcgb3BlcmF0aW9ucy5UcmFuc2xhdGUobmV3IFZlY3RvcjMoeCwgeSwgeikpKTtcbiAgfSxcblxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICBpZiAoeSA9PSBudWxsKSB5ID0gMDtcbiAgICByZXR1cm4gdGhpcy50cmFuc2xhdGUzZCh4LCB5LCAwKTtcbiAgfSxcblxuICB0cmFuc2xhdGVYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlKHgsIDApO1xuICB9LFxuXG4gIHRyYW5zbGF0ZVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2xhdGUoMCwgeSk7XG4gIH0sXG5cbiAgdHJhbnNsYXRlWjogZnVuY3Rpb24oeikge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZTNkKDAsIDAsIHopO1xuICB9LFxuXG4gIC8vIHNjYWxlXG5cbiAgc2NhbGUzZDogZnVuY3Rpb24oeCwgeSwgeikge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZChuZXcgb3BlcmF0aW9ucy5TY2FsZShuZXcgVmVjdG9yMyh4LCB5LCB6KSkpO1xuICB9LFxuXG4gIHNjYWxlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgaWYgKHkgPT0gbnVsbCkgeSA9IHg7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUzZCh4LCB5LCAxKTtcbiAgfSxcblxuICBzY2FsZVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZSh4LCAxKTtcbiAgfSxcblxuICBzY2FsZVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZSgxLCB5KTtcbiAgfSxcblxuICBzY2FsZVo6IGZ1bmN0aW9uKHopIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZTNkKDEsIDEsIHopO1xuICB9LFxuXG4gIC8vIHJvdGF0ZVxuXG4gIHJvdGF0ZTNkOiBmdW5jdGlvbih4LCB5LCB6LCBhbmdsZSkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZChuZXcgb3BlcmF0aW9ucy5Sb3RhdGUobmV3IFZlY3RvcjQoeCwgeSwgeiwgYW5nbGUpKSk7XG4gIH0sXG5cbiAgcm90YXRlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgIHJldHVybiB0aGlzLnJvdGF0ZTNkKDAsIDAsIDEsIGFuZ2xlKTtcbiAgfSxcblxuICByb3RhdGVYOiBmdW5jdGlvbihhbmdsZSkge1xuICAgIHJldHVybiB0aGlzLnJvdGF0ZTNkKDEsIDAsIDAsIGFuZ2xlKTtcbiAgfSxcblxuICByb3RhdGVZOiBmdW5jdGlvbihhbmdsZSkge1xuICAgIHJldHVybiB0aGlzLnJvdGF0ZTNkKDAsIDEsIDAsIGFuZ2xlKTtcbiAgfSxcblxuICByb3RhdGVaOiBmdW5jdGlvbihhbmdsZSkge1xuICAgIHJldHVybiB0aGlzLnJvdGF0ZTNkKDAsIDAsIDEsIGFuZ2xlKTtcbiAgfSxcblxuICAvLyBza2V3XG5cbiAgc2tldzogZnVuY3Rpb24oeCwgeSkge1xuICAgIGlmICh5ID09IG51bGwpIHkgPSAwO1xuICAgIHJldHVybiB0aGlzLmFwcGVuZChuZXcgb3BlcmF0aW9ucy5Ta2V3KFt4LCB5XSkpO1xuICB9LFxuXG4gIHNrZXdYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuc2tldyh4LCAwKTtcbiAgfSxcblxuICBza2V3WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB0aGlzLnNrZXcoMCwgeSk7XG4gIH0sXG5cbiAgLy8gcGVyc3BlY3RpdmVcblxuICBwZXJzcGVjdGl2ZTogZnVuY3Rpb24obGVuKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kKG5ldyBvcGVyYXRpb25zLlBlcnNwZWN0aXZlKGxlbikpO1xuICB9LFxuXG4gIC8vIGludGVycG9sYXRpb25cblxuICBpbnRlcnBvbGF0aW9uOiBmdW5jdGlvbih0cmFuc2Zvcm0pIHtcbiAgICByZXR1cm4gbmV3IFRyYW5zZm9ybUludGVycG9sYXRpb24odGhpcywgdHJhbnNmb3JtKTtcbiAgfSxcblxuICAvLyBtYXRyaXggY29udmVyc2lvblxuXG4gIGNvbXBvc2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXRyaXggPSBuZXcgTWF0cml4M2Q7XG4gICAgdmFyIG9wZXJhdGlvbnMgPSB0aGlzLm9wZXJhdGlvbnM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXRyaXggPSBtYXRyaXguY29uY2F0KG9wZXJhdGlvbnNbaV0uY29tcG9zZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdHJpeDtcbiAgfSxcblxuICAvLyBzdHJpbmdcblxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZyA9IFtdO1xuICAgIHZhciBvcGVyYXRpb25zID0gdGhpcy5vcGVyYXRpb25zO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgc3RyaW5nLnB1c2gob3BlcmF0aW9uc1tpXS50b1N0cmluZygpKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZy5qb2luKCcgJyk7XG4gIH1cblxufSk7XG5cbnZhciBUcmFuc2Zvcm1JbnRlcnBvbGF0aW9uID0gcHJpbWUoe1xuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiBUcmFuc2Zvcm1JbnRlcnBvbGF0aW9uKGZyb20sIHRvKSB7XG4gICAgdmFyIG9wZXJhdGlvbnMxID0gc2xpY2VfLmNhbGwoZnJvbS5vcGVyYXRpb25zKTtcbiAgICB2YXIgb3BlcmF0aW9uczIgPSBzbGljZV8uY2FsbCh0by5vcGVyYXRpb25zKTtcblxuICAgIHZhciBsZW5ndGgxID0gb3BlcmF0aW9uczEubGVuZ3RoLCBsZW5ndGgyID0gb3BlcmF0aW9uczIubGVuZ3RoO1xuICAgIHZhciBvcGVyYXRpb24xLCBvcGVyYXRpb24yLCBpLCBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA9IHRydWU7XG5cbiAgICBpZiAoIWxlbmd0aDEgfHwgZnJvbS5pc0lkZW50aXR5KCkpIHtcbiAgICAgIG9wZXJhdGlvbnMxID0gW107XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoMjsgaSsrKSBvcGVyYXRpb25zMS5wdXNoKG5ldyBvcGVyYXRpb25zW29wZXJhdGlvbnMyW2ldLnR5cGVdKTtcbiAgICAgIGxlbmd0aDEgPSBvcGVyYXRpb25zMS5sZW5ndGg7XG4gICAgfSBlbHNlIGlmICghbGVuZ3RoMiB8fCB0by5pc0lkZW50aXR5KCkpIHtcbiAgICAgIG9wZXJhdGlvbnMyID0gW107XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoMTsgaSsrKSBvcGVyYXRpb25zMi5wdXNoKG5ldyBvcGVyYXRpb25zW29wZXJhdGlvbnMxW2ldLnR5cGVdKTtcbiAgICAgIGxlbmd0aDIgPSBvcGVyYXRpb25zMi5sZW5ndGg7XG4gICAgfSBlbHNlIGlmIChsZW5ndGgxID09PSBsZW5ndGgyKSB7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGgxOyBpKyspIHtcbiAgICAgICAgb3BlcmF0aW9uMSA9IG9wZXJhdGlvbnMxW2ldO1xuICAgICAgICBvcGVyYXRpb24yID0gb3BlcmF0aW9uczJbaV07XG4gICAgICAgIHZhciB0eXBlMSA9IG9wZXJhdGlvbjEudHlwZTtcbiAgICAgICAgdmFyIHR5cGUyID0gb3BlcmF0aW9uMi50eXBlO1xuXG4gICAgICAgIGlmICh0eXBlMSAhPT0gdHlwZTIpIHtcbiAgICAgICAgICBpZiAob3BlcmF0aW9uMS5pc0lkZW50aXR5KCkpIHtcbiAgICAgICAgICAgIG9wZXJhdGlvbnMxLnNwbGljZShpLCAxLCBuZXcgb3BlcmF0aW9uc1t0eXBlMl0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uMi5pc0lkZW50aXR5KCkpIHtcbiAgICAgICAgICAgIG9wZXJhdGlvbnMxLnNwbGljZShpLCAxLCBuZXcgb3BlcmF0aW9uc1t0eXBlMV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaW50ZXJwb2xhdGVUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJwb2xhdGVUcmFuc2Zvcm0pIHtcbiAgICAgIHRoaXMuZnJvbSA9IG9wZXJhdGlvbnMxO1xuICAgICAgdGhpcy50byA9IG9wZXJhdGlvbnMyO1xuICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGgxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZyb20gPSBbbmV3IG9wZXJhdGlvbnMuTWF0cml4KGZyb20uY29tcG9zZSgpKV07XG4gICAgICB0aGlzLnRvID0gW25ldyBvcGVyYXRpb25zLk1hdHJpeCh0by5jb21wb3NlKCkpXTtcbiAgICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgICB9XG5cbiAgfSxcblxuICBzdGVwOiBmdW5jdGlvbihkZWx0YSkge1xuICAgIGlmIChkZWx0YSA9PT0gMCkgcmV0dXJuIG5ldyBUcmFuc2Zvcm0zZCh0aGlzLmZyb20pO1xuICAgIGlmIChkZWx0YSA9PT0gMSkgcmV0dXJuIG5ldyBUcmFuc2Zvcm0zZCh0aGlzLnRvKTtcblxuICAgIHZhciBpbnRlcnBvbGF0ZWQgPSBuZXcgVHJhbnNmb3JtM2Q7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBmcm9tID0gdGhpcy5mcm9tW2ldO1xuICAgICAgdmFyIHRvID0gdGhpcy50b1tpXTtcbiAgICAgIHZhciBvcGVyYXRpb24gPSBmcm9tLmVxdWFscyh0bykgPyBmcm9tIDogZnJvbS5pbnRlcnBvbGF0ZSh0bywgZGVsdGEpO1xuICAgICAgaW50ZXJwb2xhdGVkLmFwcGVuZChvcGVyYXRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBpbnRlcnBvbGF0ZWQ7XG4gIH1cblxufSk7XG5cblRyYW5zZm9ybTNkLkludGVycG9sYXRpb24gPSBUcmFuc2Zvcm1JbnRlcnBvbGF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybTNkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL1RyYW5zZm9ybTNkJyk7XG4iLCJmdW5jdGlvbiBiYWNrSW5PdXQodCkge1xuICB2YXIgcyA9IDEuNzAxNTggKiAxLjUyNTtcbiAgaWYgKCh0ICo9IDIpIDwgMSlcbiAgICByZXR1cm4gMC41ICogKHQgKiB0ICogKChzICsgMSkgKiB0IC0gcykpXG4gIHJldHVybiAwLjUgKiAoKHQgLT0gMikgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAyKVxufVxuXG5mdW5jdGlvbiBiYWNrSW4odCkge1xuICB2YXIgcyA9IDEuNzAxNTg7XG4gIHJldHVybiB0ICogdCAqICgocyArIDEpICogdCAtIHMpXG59XG5cbmZ1bmN0aW9uIGJhY2tPdXQodCkge1xuICB2YXIgcyA9IDEuNzAxNTg7XG4gIHJldHVybiAtLXQgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAxXG59XG5cbmZ1bmN0aW9uIGJvdW5jZU91dCh0KSB7XG4gIHZhciBhID0gNC4wIC8gMTEuMDtcbiAgdmFyIGIgPSA4LjAgLyAxMS4wO1xuICB2YXIgYyA9IDkuMCAvIDEwLjA7XG5cbiAgdmFyIGNhID0gNDM1Ni4wIC8gMzYxLjA7XG4gIHZhciBjYiA9IDM1NDQyLjAgLyAxODA1LjA7XG4gIHZhciBjYyA9IDE2MDYxLjAgLyAxODA1LjA7XG5cbiAgdmFyIHQyID0gdCAqIHQ7XG5cbiAgcmV0dXJuIHQgPCBhXG4gICAgPyA3LjU2MjUgKiB0MlxuICAgIDogdCA8IGJcbiAgICAgID8gOS4wNzUgKiB0MiAtIDkuOSAqIHQgKyAzLjRcbiAgICAgIDogdCA8IGNcbiAgICAgICAgPyBjYSAqIHQyIC0gY2IgKiB0ICsgY2NcbiAgICAgICAgOiAxMC44ICogdCAqIHQgLSAyMC41MiAqIHQgKyAxMC43MlxufVxuXG5mdW5jdGlvbiBib3VuY2VJbk91dCh0KSB7XG4gIHJldHVybiB0IDwgMC41XG4gICAgPyAwLjUgKiAoMS4wIC0gYm91bmNlT3V0KDEuMCAtIHQgKiAyLjApKVxuICAgIDogMC41ICogYm91bmNlT3V0KHQgKiAyLjAgLSAxLjApICsgMC41XG59XG5cbmZ1bmN0aW9uIGJvdW5jZUluKHQpIHtcbiAgcmV0dXJuIDEuMCAtIGJvdW5jZU91dCgxLjAgLSB0KVxufVxuXG5mdW5jdGlvbiBjaXJjSW5PdXQodCkge1xuICBpZiAoKHQgKj0gMikgPCAxKSByZXR1cm4gLTAuNSAqIChNYXRoLnNxcnQoMSAtIHQgKiB0KSAtIDEpXG4gIHJldHVybiAwLjUgKiAoTWF0aC5zcXJ0KDEgLSAodCAtPSAyKSAqIHQpICsgMSlcbn1cblxuZnVuY3Rpb24gY2lyY0luKHQpIHtcbiAgcmV0dXJuIDEuMCAtIE1hdGguc3FydCgxLjAgLSB0ICogdClcbn1cblxuZnVuY3Rpb24gY2lyY091dCh0KSB7XG4gIHJldHVybiBNYXRoLnNxcnQoMSAtICggLS10ICogdCApKVxufVxuXG5mdW5jdGlvbiBjdWJpY0luT3V0KHQpIHtcbiAgcmV0dXJuIHQgPCAwLjVcbiAgICA/IDQuMCAqIHQgKiB0ICogdFxuICAgIDogMC41ICogTWF0aC5wb3coMi4wICogdCAtIDIuMCwgMy4wKSArIDEuMFxufVxuXG5mdW5jdGlvbiBjdWJpY0luKHQpIHtcbiAgcmV0dXJuIHQgKiB0ICogdFxufVxuXG5mdW5jdGlvbiBjdWJpY091dCh0KSB7XG4gIHZhciBmID0gdCAtIDEuMDtcbiAgcmV0dXJuIGYgKiBmICogZiArIDEuMFxufVxuXG5mdW5jdGlvbiBlbGFzdGljSW5PdXQodCkge1xuICByZXR1cm4gdCA8IDAuNVxuICAgID8gMC41ICogTWF0aC5zaW4oKzEzLjAgKiBNYXRoLlBJLzIgKiAyLjAgKiB0KSAqIE1hdGgucG93KDIuMCwgMTAuMCAqICgyLjAgKiB0IC0gMS4wKSlcbiAgICA6IDAuNSAqIE1hdGguc2luKC0xMy4wICogTWF0aC5QSS8yICogKCgyLjAgKiB0IC0gMS4wKSArIDEuMCkpICogTWF0aC5wb3coMi4wLCAtMTAuMCAqICgyLjAgKiB0IC0gMS4wKSkgKyAxLjBcbn1cblxuZnVuY3Rpb24gZWxhc3RpY0luKHQpIHtcbiAgcmV0dXJuIE1hdGguc2luKDEzLjAgKiB0ICogTWF0aC5QSS8yKSAqIE1hdGgucG93KDIuMCwgMTAuMCAqICh0IC0gMS4wKSlcbn1cblxuZnVuY3Rpb24gZWxhc3RpY091dCh0KSB7XG4gIHJldHVybiBNYXRoLnNpbigtMTMuMCAqICh0ICsgMS4wKSAqIE1hdGguUEkvMikgKiBNYXRoLnBvdygyLjAsIC0xMC4wICogdCkgKyAxLjBcbn1cblxuZnVuY3Rpb24gZXhwb0luT3V0KHQpIHtcbiAgcmV0dXJuICh0ID09PSAwLjAgfHwgdCA9PT0gMS4wKVxuICAgID8gdFxuICAgIDogdCA8IDAuNVxuICAgICAgPyArMC41ICogTWF0aC5wb3coMi4wLCAoMjAuMCAqIHQpIC0gMTAuMClcbiAgICAgIDogLTAuNSAqIE1hdGgucG93KDIuMCwgMTAuMCAtICh0ICogMjAuMCkpICsgMS4wXG59XG5cbmZ1bmN0aW9uIGV4cG9Jbih0KSB7XG4gIHJldHVybiB0ID09PSAwLjAgPyB0IDogTWF0aC5wb3coMi4wLCAxMC4wICogKHQgLSAxLjApKVxufVxuXG5mdW5jdGlvbiBleHBvT3V0KHQpIHtcbiAgcmV0dXJuIHQgPT09IDEuMCA/IHQgOiAxLjAgLSBNYXRoLnBvdygyLjAsIC0xMC4wICogdClcbn1cblxuZnVuY3Rpb24gbGluZWFyKHQpIHtcbiAgcmV0dXJuIHRcbn1cblxuZnVuY3Rpb24gcXVhZEluT3V0KHQpIHtcbiAgICB0IC89IDAuNTtcbiAgICBpZiAodCA8IDEpIHJldHVybiAwLjUqdCp0XG4gICAgdC0tO1xuICAgIHJldHVybiAtMC41ICogKHQqKHQtMikgLSAxKVxufVxuXG5mdW5jdGlvbiBxdWFkSW4odCkge1xuICByZXR1cm4gdCAqIHRcbn1cblxuZnVuY3Rpb24gcXVhZE91dCh0KSB7XG4gIHJldHVybiAtdCAqICh0IC0gMi4wKVxufVxuXG5mdW5jdGlvbiBxdWFydGljSW5PdXQodCkge1xuICByZXR1cm4gdCA8IDAuNVxuICAgID8gKzguMCAqIE1hdGgucG93KHQsIDQuMClcbiAgICA6IC04LjAgKiBNYXRoLnBvdyh0IC0gMS4wLCA0LjApICsgMS4wXG59XG5cbmZ1bmN0aW9uIHF1YXJ0aWNJbih0KSB7XG4gIHJldHVybiBNYXRoLnBvdyh0LCA0LjApXG59XG5cbmZ1bmN0aW9uIHF1YXJ0aWNPdXQodCkge1xuICByZXR1cm4gTWF0aC5wb3codCAtIDEuMCwgMy4wKSAqICgxLjAgLSB0KSArIDEuMFxufVxuXG5mdW5jdGlvbiBxaW50aWNJbk91dCh0KSB7XG4gICAgaWYgKCAoIHQgKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiB0ICogdCAqIHQgKiB0ICogdFxuICAgIHJldHVybiAwLjUgKiAoICggdCAtPSAyICkgKiB0ICogdCAqIHQgKiB0ICsgMiApXG59XG5cbmZ1bmN0aW9uIHFpbnRpY0luKHQpIHtcbiAgcmV0dXJuIHQgKiB0ICogdCAqIHQgKiB0XG59XG5cbmZ1bmN0aW9uIHFpbnRpY091dCh0KSB7XG4gIHJldHVybiAtLXQgKiB0ICogdCAqIHQgKiB0ICsgMVxufVxuXG5mdW5jdGlvbiBzaW5lSW5PdXQodCkge1xuICByZXR1cm4gLTAuNSAqIChNYXRoLmNvcyhNYXRoLlBJKnQpIC0gMSlcbn1cblxuZnVuY3Rpb24gc2luZUluICh0KSB7XG4gIHZhciB2ID0gTWF0aC5jb3ModCAqIE1hdGguUEkgKiAwLjUpO1xuICBpZiAoTWF0aC5hYnModikgPCAxZS0xNCkgcmV0dXJuIDFcbiAgZWxzZSByZXR1cm4gMSAtIHZcbn1cblxuZnVuY3Rpb24gc2luZU91dCh0KSB7XG4gIHJldHVybiBNYXRoLnNpbih0ICogTWF0aC5QSS8yKVxufVxuXG5leHBvcnQgeyBiYWNrSW5PdXQsIGJhY2tJbiwgYmFja091dCwgYm91bmNlSW5PdXQsIGJvdW5jZUluLCBib3VuY2VPdXQsIGNpcmNJbk91dCwgY2lyY0luLCBjaXJjT3V0LCBjdWJpY0luT3V0LCBjdWJpY0luLCBjdWJpY091dCwgZWxhc3RpY0luT3V0LCBlbGFzdGljSW4sIGVsYXN0aWNPdXQsIGV4cG9Jbk91dCwgZXhwb0luLCBleHBvT3V0LCBsaW5lYXIsIHF1YWRJbk91dCwgcXVhZEluLCBxdWFkT3V0LCBxdWFydGljSW5PdXQgYXMgcXVhcnRJbk91dCwgcXVhcnRpY0luIGFzIHF1YXJ0SW4sIHF1YXJ0aWNPdXQgYXMgcXVhcnRPdXQsIHFpbnRpY0luT3V0IGFzIHF1aW50SW5PdXQsIHFpbnRpY0luIGFzIHF1aW50SW4sIHFpbnRpY091dCBhcyBxdWludE91dCwgc2luZUluT3V0LCBzaW5lSW4sIHNpbmVPdXQgfTtcbiIsImltcG9ydCBUcmFuc2Zvcm0zZCAgZnJvbSAndHJhbnNmb3JtM2QnO1xuaW1wb3J0IHsgY3ViaWNPdXQgfSBmcm9tICdlYXNlcy1qc25leHQnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2Zvcm0oIG5vZGUsXG5cdFx0XHRcdCAgIHtcblx0XHRcdFx0ICAgICBlYXNpbmcgPSBjdWJpY091dCxcblx0XHRcdFx0ICAgICBzY2FsZVggPSAxLFxuXHRcdFx0XHQgICAgIHNjYWxlWSA9IDEsXG5cdFx0XHRcdCAgICAgc2NhbGVaID0gMSxcblx0XHRcdFx0ICAgICByb3RhdGVYID0gMCxcblx0XHRcdFx0ICAgICByb3RhdGVZID0gMCxcblx0XHRcdFx0ICAgICByb3RhdGVaID0gMCxcblx0XHRcdFx0ICAgICB0cmFuc2xhdGVYID0gMCxcblx0XHRcdFx0ICAgICB0cmFuc2xhdGVZID0gMCxcblx0XHRcdFx0ICAgICB0cmFuc2xhdGVaID0gMCxcdFx0XHRcdCAgICBcblx0XHRcdFx0ICAgICBkZWxheSA9IDAsXG5cdFx0XHRcdCAgICAgZHVyYXRpb24gPSA0MDAgfSkge1xuICBcbiAgY29uc3QgZWwgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUsbnVsbCk7XG4gIGNvbnN0IHRyICA9XG5cdCAgZWwuZ2V0UHJvcGVydHlWYWx1ZShcIi13ZWJraXQtdHJhbnNmb3JtXCIpIHx8XG5cdCAgZWwuZ2V0UHJvcGVydHlWYWx1ZShcIi1tb3otdHJhbnNmb3JtXCIpIHx8XG5cdCAgZWwuZ2V0UHJvcGVydHlWYWx1ZShcIi1tcy10cmFuc2Zvcm1cIikgfHxcblx0ICBlbC5nZXRQcm9wZXJ0eVZhbHVlKFwiLW8tdHJhbnNmb3JtXCIpIHx8XG5cdCAgZWwuZ2V0UHJvcGVydHlWYWx1ZShcInRyYW5zZm9ybVwiKTtcblxuICBsZXQgb3IgPSAnJztcbiAgbGV0IG1hdHJpeCA9ICcnO1xuICBcbiAgaWYodHIgPT0gJycgfHwgdHIgPT0gXCJub25lXCIpIHtcbiAgICBvciA9IG5ldyBUcmFuc2Zvcm0zZCgpLm1hdHJpeDNkKCk7XG4gIH0gZWxzZSB7XG4gICAgXG4gICAgaWYoIS9ebWF0cml4M2QuKi8udGVzdCh0cikpIHtcbiAgICAgIG1hdHJpeCA9IHRyLnN1YnN0cig5LHRyLmxlbmd0aC0xMCkuc3BsaXQoXCIsIFwiKS5tYXAocGFyc2VGbG9hdCk7XG4gICAgICBjb25zb2xlLmxvZyhtYXRyaXgubGVuZ3RoKTtcbiAgICAgIGZvcihsZXQgaSA9IG1hdHJpeC5sZW5ndGggfHwgMDsgaSA8IDE2OyBpKyspIHtcbi8vXHRtYXRyaXgucHVzaCgwLjEpO1xuICAgICAgfVxuICAgICAgb3IgPSBuZXcgVHJhbnNmb3JtM2QoKS5tYXRyaXgzZChtYXRyaXhbMF0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsxXSxcblx0XHRcdFx0ICAgICAgbWF0cml4WzJdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbM10sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFs0XSxcblx0XHRcdFx0ICAgICAgbWF0cml4WzVdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbNl0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFs3XSxcblx0XHRcdFx0ICAgICAgbWF0cml4WzhdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbOV0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsxMF0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsxMV0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsxMl0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsxM10sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsxNF0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsxNV0gKTtcbiAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRyaXggPSB0ci5zdWJzdHIoNyx0ci5sZW5ndGgtOCkuc3BsaXQoXCIsIFwiKS5tYXAocGFyc2VGbG9hdCk7XG4gICAgICBcbiAgICAgIG9yID0gbmV3IFRyYW5zZm9ybTNkKCkubWF0cml4M2QobWF0cml4WzBdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbMV0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFsyXSxcblx0XHRcdFx0ICAgICAgbWF0cml4WzNdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbNF0sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFs1XSxcblx0XHRcdFx0ICAgICAgbWF0cml4WzZdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbN10sXG5cdFx0XHRcdCAgICAgIG1hdHJpeFs4XSxcblx0XHRcdFx0ICAgICAgbWF0cml4WzldLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbMTBdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbMTFdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbMTJdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbMTNdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbMTRdLFxuXHRcdFx0XHQgICAgICBtYXRyaXhbMTVdICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdG8gPSBuZXcgVHJhbnNmb3JtM2QoKS5cblx0ICBzY2FsZVgoc2NhbGVYKS5cblx0ICBzY2FsZVkoc2NhbGVZKS5cblx0ICBzY2FsZVooc2NhbGVaKS5cblx0ICByb3RhdGVYKHJvdGF0ZVgpLlxuXHQgIHJvdGF0ZVkocm90YXRlWSkuXG5cdCAgcm90YXRlWihyb3RhdGVaKS5cblx0ICB0cmFuc2xhdGVYKHRyYW5zbGF0ZVgpLlxuXHQgIHRyYW5zbGF0ZVkodHJhbnNsYXRlWSkuXG5cdCAgdHJhbnNsYXRlWih0cmFuc2xhdGVaKTtcbiAgXG4gIGNvbnN0IGludGVycG9sYXRpb24gPSBuZXcgVHJhbnNmb3JtM2QuSW50ZXJwb2xhdGlvbiggdG8sIG9yICk7XG4gIFxuICByZXR1cm4ge1xuICAgIGRlbGF5LFxuICAgIGR1cmF0aW9uLFxuICAgIGVhc2luZyxcbiAgICBjc3M6IHQgPT5cbiAgICAgIGAtd2Via2l0LXRyYW5zZm9ybTogJHtpbnRlcnBvbGF0aW9uLnN0ZXAodCkuY29tcG9zZSgpfTtgICtcbiAgICAgIGAtbW96LXRyYW5zZm9ybTogJHtpbnRlcnBvbGF0aW9uLnN0ZXAodCkuY29tcG9zZSgpfTtgICtcbiAgICAgIGAtbXMtdHJhbnNmb3JtOiAke2ludGVycG9sYXRpb24uc3RlcCh0KS5jb21wb3NlKCl9O2AgK1xuICAgICAgYC1vLXRyYW5zZm9ybTogJHtpbnRlcnBvbGF0aW9uLnN0ZXAodCkuY29tcG9zZSgpfTtgICsgICAgICBcbiAgICAgIGB0cmFuc2Zvcm06ICR7aW50ZXJwb2xhdGlvbi5zdGVwKHQpLmNvbXBvc2UoKX07YCAgICAgICAgICAgIFxuICB9O1xufVxuIiwiZnVuY3Rpb24gZmFkZSAoIG5vZGUsIHJlZiApIHtcblx0dmFyIGRlbGF5ID0gcmVmLmRlbGF5OyBpZiAoIGRlbGF5ID09PSB2b2lkIDAgKSBkZWxheSA9IDA7XG5cdHZhciBkdXJhdGlvbiA9IHJlZi5kdXJhdGlvbjsgaWYgKCBkdXJhdGlvbiA9PT0gdm9pZCAwICkgZHVyYXRpb24gPSA0MDA7XG5cblx0dmFyIG8gPSArZ2V0Q29tcHV0ZWRTdHlsZSggbm9kZSApLm9wYWNpdHk7XG5cblx0cmV0dXJuIHtcblx0XHRkZWxheTogZGVsYXksXG5cdFx0ZHVyYXRpb246IGR1cmF0aW9uLFxuXHRcdGNzczogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIChcIm9wYWNpdHk6IFwiICsgKHQgKiBvKSk7IH1cblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZmFkZTtcbiIsImZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5mdW5jdGlvbiBhc3NpZ24odGFyZ2V0KSB7XG5cdHZhciBrLFxuXHRcdHNvdXJjZSxcblx0XHRpID0gMSxcblx0XHRsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0c291cmNlID0gYXJndW1lbnRzW2ldO1xuXHRcdGZvciAoayBpbiBzb3VyY2UpIHRhcmdldFtrXSA9IHNvdXJjZVtrXTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZE5vZGUobm9kZSwgdGFyZ2V0KSB7XG5cdHRhcmdldC5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0Tm9kZShub2RlLCB0YXJnZXQsIGFuY2hvcikge1xuXHR0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIGFuY2hvcik7XG59XG5cbmZ1bmN0aW9uIGRldGFjaE5vZGUobm9kZSkge1xuXHRub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIGRldGFjaEJldHdlZW4oYmVmb3JlLCBhZnRlcikge1xuXHR3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nICYmIGJlZm9yZS5uZXh0U2libGluZyAhPT0gYWZ0ZXIpIHtcblx0XHRiZWZvcmUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChiZWZvcmUubmV4dFNpYmxpbmcpO1xuXHR9XG59XG5cbi8vIFRPRE8gdGhpcyBpcyBvdXQgb2YgZGF0ZVxuZnVuY3Rpb24gZGVzdHJveUVhY2goaXRlcmF0aW9ucywgZGV0YWNoLCBzdGFydCkge1xuXHRmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBpdGVyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0aWYgKGl0ZXJhdGlvbnNbaV0pIGl0ZXJhdGlvbnNbaV0uZGVzdHJveShkZXRhY2gpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQobmFtZSkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3ZnRWxlbWVudChuYW1lKSB7XG5cdHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHQoZGF0YSkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbW1lbnQoKSB7XG5cdHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIobm9kZSwgZXZlbnQsIGhhbmRsZXIpIHtcblx0bm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKG5vZGUsIGV2ZW50LCBoYW5kbGVyKSB7XG5cdG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGUobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuXHRub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gc2V0WGxpbmtBdHRyaWJ1dGUobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuXHRub2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgYXR0cmlidXRlLCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdHcm91cFZhbHVlKGdyb3VwKSB7XG5cdHZhciB2YWx1ZSA9IFtdO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGdyb3VwLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0aWYgKGdyb3VwW2ldLmNoZWNrZWQpIHZhbHVlLnB1c2goZ3JvdXBbaV0uX192YWx1ZSk7XG5cdH1cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuXHRyZXR1cm4gdmFsdWUgPT09ICcnID8gdW5kZWZpbmVkIDogK3ZhbHVlO1xufVxuXG5mdW5jdGlvbiBsaW5lYXIodCkge1xuXHRyZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVLZXlmcmFtZXMoXG5cdGEsXG5cdGIsXG5cdGRlbHRhLFxuXHRkdXJhdGlvbixcblx0ZWFzZSxcblx0Zm4sXG5cdG5vZGUsXG5cdHN0eWxlXG4pIHtcblx0dmFyIGlkID0gJ19fc3ZlbHRlJyArIH5+KE1hdGgucmFuZG9tKCkgKiAxZTkpOyAvLyBUT0RPIG1ha2UgdGhpcyBtb3JlIHJvYnVzdFxuXHR2YXIga2V5ZnJhbWVzID0gJ0BrZXlmcmFtZXMgJyArIGlkICsgJ3tcXG4nO1xuXG5cdGZvciAodmFyIHAgPSAwOyBwIDw9IDE7IHAgKz0gMTYuNjY2IC8gZHVyYXRpb24pIHtcblx0XHR2YXIgdCA9IGEgKyBkZWx0YSAqIGVhc2UocCk7XG5cdFx0a2V5ZnJhbWVzICs9IHAgKiAxMDAgKyAnJXsnICsgZm4odCkgKyAnfVxcbic7XG5cdH1cblxuXHRrZXlmcmFtZXMgKz0gJzEwMCUgeycgKyBmbihiKSArICd9XFxufSc7XG5cdHN0eWxlLnRleHRDb250ZW50ICs9IGtleWZyYW1lcztcblxuXHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcblxuXHRub2RlLnN0eWxlLmFuaW1hdGlvbiA9IChub2RlLnN0eWxlLmFuaW1hdGlvbiB8fCAnJylcblx0XHQuc3BsaXQoJywnKVxuXHRcdC5maWx0ZXIoZnVuY3Rpb24oYW5pbSkge1xuXHRcdFx0Ly8gd2hlbiBpbnRyb2luZywgZGlzY2FyZCBvbGQgYW5pbWF0aW9ucyBpZiB0aGVyZSBhcmUgYW55XG5cdFx0XHRyZXR1cm4gYW5pbSAmJiAoZGVsdGEgPCAwIHx8ICEvX19zdmVsdGUvLnRlc3QoYW5pbSkpO1xuXHRcdH0pXG5cdFx0LmNvbmNhdChpZCArICcgJyArIGR1cmF0aW9uICsgJ21zIGxpbmVhciAxIGZvcndhcmRzJylcblx0XHQuam9pbignLCAnKTtcbn1cblxuZnVuY3Rpb24gd3JhcFRyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcywgaW50cm8sIG91dGdyb3VwKSB7XG5cdHZhciBvYmogPSBmbihub2RlLCBwYXJhbXMpO1xuXHR2YXIgZHVyYXRpb24gPSBvYmouZHVyYXRpb24gfHwgMzAwO1xuXHR2YXIgZWFzZSA9IG9iai5lYXNpbmcgfHwgbGluZWFyO1xuXHR2YXIgY3NzVGV4dDtcblxuXHQvLyBUT0RPIHNoYXJlIDxzdHlsZT4gdGFnIGJldHdlZW4gYWxsIHRyYW5zaXRpb25zP1xuXHRpZiAob2JqLmNzcykge1xuXHRcdHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cdH1cblxuXHRpZiAoaW50cm8pIHtcblx0XHRpZiAob2JqLmNzcyAmJiBvYmouZGVsYXkpIHtcblx0XHRcdGNzc1RleHQgPSBub2RlLnN0eWxlLmNzc1RleHQ7XG5cdFx0XHRub2RlLnN0eWxlLmNzc1RleHQgKz0gb2JqLmNzcygwKTtcblx0XHR9XG5cblx0XHRpZiAob2JqLnRpY2spIG9iai50aWNrKDApO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR0OiBpbnRybyA/IDAgOiAxLFxuXHRcdHJ1bm5pbmc6IGZhbHNlLFxuXHRcdHByb2dyYW06IG51bGwsXG5cdFx0cGVuZGluZzogbnVsbCxcblx0XHRydW46IGZ1bmN0aW9uKGludHJvLCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIHByb2dyYW0gPSB7XG5cdFx0XHRcdHN0YXJ0OiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgKyAob2JqLmRlbGF5IHx8IDApLFxuXHRcdFx0XHRpbnRybzogaW50cm8sXG5cdFx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdFx0fTtcblxuXHRcdFx0aWYgKG9iai5kZWxheSkge1xuXHRcdFx0XHR0aGlzLnBlbmRpbmcgPSBwcm9ncmFtO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zdGFydChwcm9ncmFtKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCF0aGlzLnJ1bm5pbmcpIHtcblx0XHRcdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZTtcblx0XHRcdFx0dHJhbnNpdGlvbk1hbmFnZXIuYWRkKHRoaXMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKHByb2dyYW0pIHtcblx0XHRcdHByb2dyYW0uYSA9IHRoaXMudDtcblx0XHRcdHByb2dyYW0uYiA9IHByb2dyYW0uaW50cm8gPyAxIDogMDtcblx0XHRcdHByb2dyYW0uZGVsdGEgPSBwcm9ncmFtLmIgLSBwcm9ncmFtLmE7XG5cdFx0XHRwcm9ncmFtLmR1cmF0aW9uID0gZHVyYXRpb24gKiBNYXRoLmFicyhwcm9ncmFtLmIgLSBwcm9ncmFtLmEpO1xuXHRcdFx0cHJvZ3JhbS5lbmQgPSBwcm9ncmFtLnN0YXJ0ICsgcHJvZ3JhbS5kdXJhdGlvbjtcblxuXHRcdFx0aWYgKG9iai5jc3MpIHtcblx0XHRcdFx0aWYgKG9iai5kZWxheSkgbm9kZS5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcblx0XHRcdFx0Z2VuZXJhdGVLZXlmcmFtZXMoXG5cdFx0XHRcdFx0cHJvZ3JhbS5hLFxuXHRcdFx0XHRcdHByb2dyYW0uYixcblx0XHRcdFx0XHRwcm9ncmFtLmRlbHRhLFxuXHRcdFx0XHRcdHByb2dyYW0uZHVyYXRpb24sXG5cdFx0XHRcdFx0ZWFzZSxcblx0XHRcdFx0XHRvYmouY3NzLFxuXHRcdFx0XHRcdG5vZGUsXG5cdFx0XHRcdFx0c3R5bGVcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wcm9ncmFtID0gcHJvZ3JhbTtcblx0XHRcdHRoaXMucGVuZGluZyA9IG51bGw7XG5cdFx0fSxcblx0XHR1cGRhdGU6IGZ1bmN0aW9uKG5vdykge1xuXHRcdFx0dmFyIHByb2dyYW0gPSB0aGlzLnByb2dyYW07XG5cdFx0XHRpZiAoIXByb2dyYW0pIHJldHVybjtcblxuXHRcdFx0dmFyIHAgPSBub3cgLSBwcm9ncmFtLnN0YXJ0O1xuXHRcdFx0dGhpcy50ID0gcHJvZ3JhbS5hICsgcHJvZ3JhbS5kZWx0YSAqIGVhc2UocCAvIHByb2dyYW0uZHVyYXRpb24pO1xuXHRcdFx0aWYgKG9iai50aWNrKSBvYmoudGljayh0aGlzLnQpO1xuXHRcdH0sXG5cdFx0ZG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnQgPSB0aGlzLnByb2dyYW0uYjtcblx0XHRcdGlmIChvYmoudGljaykgb2JqLnRpY2sodGhpcy50KTtcblx0XHRcdGlmIChvYmouY3NzKSBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHN0eWxlKTtcblx0XHRcdHRoaXMucHJvZ3JhbS5jYWxsYmFjaygpO1xuXHRcdFx0dGhpcy5wcm9ncmFtID0gbnVsbDtcblx0XHRcdHRoaXMucnVubmluZyA9ICEhdGhpcy5wZW5kaW5nO1xuXHRcdH0sXG5cdFx0YWJvcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKG9iai50aWNrKSBvYmoudGljaygxKTtcblx0XHRcdGlmIChvYmouY3NzKSBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHN0eWxlKTtcblx0XHRcdHRoaXMucHJvZ3JhbSA9IHRoaXMucGVuZGluZyA9IG51bGw7XG5cdFx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblx0XHR9XG5cdH07XG59XG5cbnZhciB0cmFuc2l0aW9uTWFuYWdlciA9IHtcblx0cnVubmluZzogZmFsc2UsXG5cdHRyYW5zaXRpb25zOiBbXSxcblx0Ym91bmQ6IG51bGwsXG5cblx0YWRkOiBmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9ucy5wdXNoKHRyYW5zaXRpb24pO1xuXG5cdFx0aWYgKCF0aGlzLnJ1bm5pbmcpIHtcblx0XHRcdHRoaXMucnVubmluZyA9IHRydWU7XG5cdFx0XHR0aGlzLm5leHQoKTtcblx0XHR9XG5cdH0sXG5cblx0bmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cblx0XHR2YXIgbm93ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdHZhciBpID0gdGhpcy50cmFuc2l0aW9ucy5sZW5ndGg7XG5cblx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHR2YXIgdHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbnNbaV07XG5cblx0XHRcdGlmICh0cmFuc2l0aW9uLnByb2dyYW0gJiYgbm93ID49IHRyYW5zaXRpb24ucHJvZ3JhbS5lbmQpIHtcblx0XHRcdFx0dHJhbnNpdGlvbi5kb25lKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0cmFuc2l0aW9uLnBlbmRpbmcgJiYgbm93ID49IHRyYW5zaXRpb24ucGVuZGluZy5zdGFydCkge1xuXHRcdFx0XHR0cmFuc2l0aW9uLnN0YXJ0KHRyYW5zaXRpb24ucGVuZGluZyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0cmFuc2l0aW9uLnJ1bm5pbmcpIHtcblx0XHRcdFx0dHJhbnNpdGlvbi51cGRhdGUobm93KTtcblx0XHRcdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAoIXRyYW5zaXRpb24ucGVuZGluZykge1xuXHRcdFx0XHR0aGlzLnRyYW5zaXRpb25zLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5ydW5uaW5nKSB7XG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ib3VuZCB8fCAodGhpcy5ib3VuZCA9IHRoaXMubmV4dC5iaW5kKHRoaXMpKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBkaWZmZXJzKGEsIGIpIHtcblx0cmV0dXJuIGEgIT09IGIgfHwgKChhICYmIHR5cGVvZiBhID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIGEgPT09ICdmdW5jdGlvbicpO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaE9ic2VydmVycyhjb21wb25lbnQsIGdyb3VwLCBuZXdTdGF0ZSwgb2xkU3RhdGUpIHtcblx0Zm9yICh2YXIga2V5IGluIGdyb3VwKSB7XG5cdFx0aWYgKCEoa2V5IGluIG5ld1N0YXRlKSkgY29udGludWU7XG5cblx0XHR2YXIgbmV3VmFsdWUgPSBuZXdTdGF0ZVtrZXldO1xuXHRcdHZhciBvbGRWYWx1ZSA9IG9sZFN0YXRlW2tleV07XG5cblx0XHRpZiAoZGlmZmVycyhuZXdWYWx1ZSwgb2xkVmFsdWUpKSB7XG5cdFx0XHR2YXIgY2FsbGJhY2tzID0gZ3JvdXBba2V5XTtcblx0XHRcdGlmICghY2FsbGJhY2tzKSBjb250aW51ZTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0dmFyIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXHRcdFx0XHRpZiAoY2FsbGJhY2suX19jYWxsaW5nKSBjb250aW51ZTtcblxuXHRcdFx0XHRjYWxsYmFjay5fX2NhbGxpbmcgPSB0cnVlO1xuXHRcdFx0XHRjYWxsYmFjay5jYWxsKGNvbXBvbmVudCwgbmV3VmFsdWUsIG9sZFZhbHVlKTtcblx0XHRcdFx0Y2FsbGJhY2suX19jYWxsaW5nID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldChrZXkpIHtcblx0cmV0dXJuIGtleSA/IHRoaXMuX3N0YXRlW2tleV0gOiB0aGlzLl9zdGF0ZTtcbn1cblxuZnVuY3Rpb24gZmlyZShldmVudE5hbWUsIGRhdGEpIHtcblx0dmFyIGhhbmRsZXJzID1cblx0XHRldmVudE5hbWUgaW4gdGhpcy5faGFuZGxlcnMgJiYgdGhpcy5faGFuZGxlcnNbZXZlbnROYW1lXS5zbGljZSgpO1xuXHRpZiAoIWhhbmRsZXJzKSByZXR1cm47XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdGhhbmRsZXJzW2ldLmNhbGwodGhpcywgZGF0YSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gb2JzZXJ2ZShrZXksIGNhbGxiYWNrLCBvcHRpb25zKSB7XG5cdHZhciBncm91cCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5kZWZlclxuXHRcdD8gdGhpcy5fb2JzZXJ2ZXJzLnBvc3Rcblx0XHQ6IHRoaXMuX29ic2VydmVycy5wcmU7XG5cblx0KGdyb3VwW2tleV0gfHwgKGdyb3VwW2tleV0gPSBbXSkpLnB1c2goY2FsbGJhY2spO1xuXG5cdGlmICghb3B0aW9ucyB8fCBvcHRpb25zLmluaXQgIT09IGZhbHNlKSB7XG5cdFx0Y2FsbGJhY2suX19jYWxsaW5nID0gdHJ1ZTtcblx0XHRjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXMuX3N0YXRlW2tleV0pO1xuXHRcdGNhbGxiYWNrLl9fY2FsbGluZyA9IGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjYW5jZWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGluZGV4ID0gZ3JvdXBba2V5XS5pbmRleE9mKGNhbGxiYWNrKTtcblx0XHRcdGlmICh+aW5kZXgpIGdyb3VwW2tleV0uc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIG9ic2VydmVEZXYoa2V5LCBjYWxsYmFjaywgb3B0aW9ucykge1xuXHR2YXIgYyA9IChrZXkgPSAnJyArIGtleSkuc2VhcmNoKC9bXlxcd10vKTtcblx0aWYgKGMgPiAtMSkge1xuXHRcdHZhciBtZXNzYWdlID1cblx0XHRcdCdUaGUgZmlyc3QgYXJndW1lbnQgdG8gY29tcG9uZW50Lm9ic2VydmUoLi4uKSBtdXN0IGJlIHRoZSBuYW1lIG9mIGEgdG9wLWxldmVsIHByb3BlcnR5Jztcblx0XHRpZiAoYyA+IDApXG5cdFx0XHRtZXNzYWdlICs9IFwiLCBpLmUuICdcIiArIGtleS5zbGljZSgwLCBjKSArIFwiJyByYXRoZXIgdGhhbiAnXCIgKyBrZXkgKyBcIidcIjtcblxuXHRcdHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcblx0fVxuXG5cdHJldHVybiBvYnNlcnZlLmNhbGwodGhpcywga2V5LCBjYWxsYmFjaywgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIG9uKGV2ZW50TmFtZSwgaGFuZGxlcikge1xuXHRpZiAoZXZlbnROYW1lID09PSAndGVhcmRvd24nKSByZXR1cm4gdGhpcy5vbignZGVzdHJveScsIGhhbmRsZXIpO1xuXG5cdHZhciBoYW5kbGVycyA9IHRoaXMuX2hhbmRsZXJzW2V2ZW50TmFtZV0gfHwgKHRoaXMuX2hhbmRsZXJzW2V2ZW50TmFtZV0gPSBbXSk7XG5cdGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG5cblx0cmV0dXJuIHtcblx0XHRjYW5jZWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcblx0XHRcdGlmICh+aW5kZXgpIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiBvbkRldihldmVudE5hbWUsIGhhbmRsZXIpIHtcblx0aWYgKGV2ZW50TmFtZSA9PT0gJ3RlYXJkb3duJykge1xuXHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFwiVXNlIGNvbXBvbmVudC5vbignZGVzdHJveScsIC4uLikgaW5zdGVhZCBvZiBjb21wb25lbnQub24oJ3RlYXJkb3duJywgLi4uKSB3aGljaCBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHVuc3VwcG9ydGVkIGluIFN2ZWx0ZSAyXCJcblx0XHQpO1xuXHRcdHJldHVybiB0aGlzLm9uKCdkZXN0cm95JywgaGFuZGxlcik7XG5cdH1cblxuXHRyZXR1cm4gb24uY2FsbCh0aGlzLCBldmVudE5hbWUsIGhhbmRsZXIpO1xufVxuXG5mdW5jdGlvbiBzZXQobmV3U3RhdGUpIHtcblx0dGhpcy5fc2V0KGFzc2lnbih7fSwgbmV3U3RhdGUpKTtcblx0dGhpcy5fcm9vdC5fZmx1c2goKTtcbn1cblxuZnVuY3Rpb24gX2ZsdXNoKCkge1xuXHRpZiAoIXRoaXMuX3JlbmRlckhvb2tzKSByZXR1cm47XG5cblx0d2hpbGUgKHRoaXMuX3JlbmRlckhvb2tzLmxlbmd0aCkge1xuXHRcdHRoaXMuX3JlbmRlckhvb2tzLnBvcCgpKCk7XG5cdH1cbn1cblxudmFyIHByb3RvID0ge1xuXHRnZXQ6IGdldCxcblx0ZmlyZTogZmlyZSxcblx0b2JzZXJ2ZTogb2JzZXJ2ZSxcblx0b246IG9uLFxuXHRzZXQ6IHNldCxcblx0X2ZsdXNoOiBfZmx1c2hcbn07XG5cbnZhciBwcm90b0RldiA9IHtcblx0Z2V0OiBnZXQsXG5cdGZpcmU6IGZpcmUsXG5cdG9ic2VydmU6IG9ic2VydmVEZXYsXG5cdG9uOiBvbkRldixcblx0c2V0OiBzZXQsXG5cdF9mbHVzaDogX2ZsdXNoXG59O1xuXG5leHBvcnQgeyBkaWZmZXJzLCBkaXNwYXRjaE9ic2VydmVycywgZ2V0LCBmaXJlLCBvYnNlcnZlLCBvYnNlcnZlRGV2LCBvbiwgb25EZXYsIHNldCwgX2ZsdXNoLCBwcm90bywgcHJvdG9EZXYsIGFwcGVuZE5vZGUsIGluc2VydE5vZGUsIGRldGFjaE5vZGUsIGRldGFjaEJldHdlZW4sIGRlc3Ryb3lFYWNoLCBjcmVhdGVFbGVtZW50LCBjcmVhdGVTdmdFbGVtZW50LCBjcmVhdGVUZXh0LCBjcmVhdGVDb21tZW50LCBhZGRMaXN0ZW5lciwgcmVtb3ZlTGlzdGVuZXIsIHNldEF0dHJpYnV0ZSwgc2V0WGxpbmtBdHRyaWJ1dGUsIGdldEJpbmRpbmdHcm91cFZhbHVlLCB0b051bWJlciwgbGluZWFyLCBnZW5lcmF0ZUtleWZyYW1lcywgd3JhcFRyYW5zaXRpb24sIHRyYW5zaXRpb25NYW5hZ2VyLCBub29wLCBhc3NpZ24gfTtcbiIsIjwhLS0vKiAtLT5cbjxsYWJlbD5cbiAgPGlucHV0IHR5cGU9J2NoZWNrYm94JyBiaW5kOmNoZWNrZWQ9J3Zpc2libGUnPiBhbmltYXRlXG48L2xhYmVsPlxue3sjaWYgdmlzaWJsZX19XG48ZGl2IHRyYW5zaXRpb246ZmFkZT0ne2R1cmF0aW9uOjIwMDB9Jz5cbiAgPGRpdiAgdHJhbnNpdGlvbjp0cmFuc2Zvcm09J3tyb3RhdGVYOi0xNzAsIHRyYW5zbGF0ZVk6LTE0MCwgc2NhbGVYOi44LHNjYWxlWTouOCxzY2FsZVo6LjgsIHJvdGF0ZVk6LTEwMCwgZHVyYXRpb246ODAwIH0nIHN0eWxlPSd0cmFuc2Zvcm06cm90YXRlWSgwLjFkZWcpJz5cbiAgICA8aDE+SGV5IGxvb2sgYXQgbWUgcm9sbGluZyBhbmQgZmFkaW5nLjwvaDE+XG4gICAgPHA+YnV0IHRha2UgdGhlIHN0eWxlIHRhZyBvdXQgb2YgdGhlIGFib3ZlIHRhZyBhbmQgcmVjb21waWxlIGFuZCB3ZSBsb3NlIHRoZSByb3RhdGVZLiBBbHNvIHdpdGggcm90YXRlWSgwZGVnKSBpbiB0aGUgc3R5bGUgdGFnIGl0IGJyZWFrcy48L3A+XG4gICAgPHA+QWxzbyBjYW50IGFkZCAyIHRyYW5zaXRpb25zIHRvIGFuIGVsZW1lbnQgc28gaGFkIHRvIHdyYXAgMSB0cmFuc2l0aW9uIGluIGFub3RoZXIsIHdoaWNoIGdpdmVzIGFuIG9kZCByZXN1bHQ8L3A+XG4gIDwvZGl2PlxuPC9kaXY+XG57ey9pZn19XG48IS0tICovIC0tPlxuPHNjcmlwdCBsYW5ndWFnZT1cImphdmFzY3JpcHRcIj5cbiAgXG4gIGltcG9ydCB0cmFuc2Zvcm0gZnJvbSAnLi9zdmVsdGUtdHJhbnNpdGlvbnMtdHJhbnNmb3JtJzsgIFxuICBpbXBvcnQgZmFkZSBmcm9tICdzdmVsdGUtdHJhbnNpdGlvbnMtZmFkZSc7XG4gIFxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgdHJhbnNpdGlvbnM6IHsgdHJhbnNmb3JtICwgZmFkZSB9XG4gIH07XG48L3NjcmlwdD5cbiIsImltcG9ydCBUcmFuc2Zvcm0gZnJvbSBcIi4vdHJhbnNmb3JtLnN2ZWx0ZS5odG1sXCI7XG5cbmNvbnN0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oe1xuICB0YXJnZXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3ZlbHRlLWV4YW1wbGVcIilcbn0pO1xuIl0sIm5hbWVzIjpbImhhc093biIsImZvckluIiwiYXJndW1lbnRzIiwiZm9yT3duIiwibWl4SW4iLCJraW5kT2YiLCJjcmVhdGUiLCJwcmltZSIsInRoaXMiLCJWZWN0b3I0IiwiVmVjdG9yMyIsInJlcXVpcmUkJDAiLCJNYXRyaXgzZCIsIlRyYW5zZm9ybTNkIiwib3BlcmF0aW9ucyIsInRyYW5zZm9ybSIsImNvbnN0IiwibGV0IiwibGluZWFyIiwiVHJhbnNmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFSTs7O0tBR0MsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztTQUN0QixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7TUFDMUQ7O0tBRUQsWUFBYyxHQUFHLE1BQU0sQ0FBQzs7QUNQekIsSUFBSSxlQUFlO0lBQ2YsVUFBVSxDQUFDOztJQUVmLFNBQVMsYUFBYSxFQUFFO1FBQ3BCLFVBQVUsR0FBRztnQkFDTCxVQUFVO2dCQUNWLGdCQUFnQjtnQkFDaEIsU0FBUztnQkFD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QUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7TUFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ1gsQ0FBQyxFQUFBOztJQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFcEIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7TUFFdkIsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2xCLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNsQixJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDbEIsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2xCLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNsQixJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O01BRWxCLE1BQU0sR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7T0FDWCxDQUFDOztLQUVIOztJQUVELElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUUsRUFBQSxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBQTs7OztJQUk1RCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUN0QixJQUFJLEdBQUcsR0FBR0MsTUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztNQUN2QixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDdEI7S0FDRjs7R0FFRjs7OztFQUlELElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7RUFDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUM1QixJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0VBQzVCLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7RUFDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUM1QixJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFOzs7O0VBSTVCLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDbEMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUNsQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ2xDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDbEMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUNsQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFOzs7O0VBSWxDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNoQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNoQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNoQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNoQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNoQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7OztFQUloQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDdEMsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3RDLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDdEMsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3RDLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDdEMsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3RDLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDdEMsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3RDLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDdEMsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3RDLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7Ozs7RUFJdEMsSUFBSSxNQUFNLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ25DLElBQUksTUFBTSxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNuQyxJQUFJLE1BQU0sR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDbkMsSUFBSSxNQUFNLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ25DLElBQUksTUFBTSxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNuQyxJQUFJLE1BQU0sR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDbkMsSUFBSSxNQUFNLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ25DLElBQUksTUFBTSxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNuQyxJQUFJLE1BQU0sR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Ozs7RUFJbkMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3pDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN6QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDekMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3pDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN6QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7RUFDekMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0VBQ3pDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtFQUN6QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7Ozs7RUFJekMsSUFBSSxJQUFJLEdBQUc7SUFDVCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDYixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7O0lBRWIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO01BQ3ZFLE9BQU8sUUFBUSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztLQUNyRjs7SUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFO01BQ3RELElBQUksSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDO0tBQzVCOztJQUVELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUU7TUFDdEQsSUFBSSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUM7S0FDeEI7O0lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7VUFDL0MsSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUM7S0FDN0I7O0lBRUQsT0FBTyxJQUFJLENBQUM7R0FDYjs7O0VBR0QsSUFBSSxFQUFFLFdBQVc7SUFDZixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7O0lBRWIsT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7V0FDMUIsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1dBQzFCLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FB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LEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDdkI7O0VBRUQsTUFBTSxFQUFFLFNBQVMsR0FBRyxFQUFFO0lBQ3BCLElBQUksY0FBYyxHQUFHLElBQUksUUFBUSxDQUFDOztJQUVsQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRWYsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM3QyxjQUFjLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN6QyxjQUFjLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENB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O0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7SUFFckIsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7OztJQUdoQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0dBQzlFOztFQUVELFNBQVMsRUFBRSxXQUFXOzs7SUFDcEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQzs7SUFFbkIsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUEsT0FBTyxLQUFLLENBQUMsRUFBQTs7SUFFNUIsSUFBSSxn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QUU7TUFDdEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUlBLFNBQU8sQ0FBQztNQUM5QixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDcEIsRUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUE7S0FDeEI7OztJQUdELElBQUksS0FBSyxHQUFHLElBQUlBLFNBQU8sQ0FBQztJQUN4QixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7OztJQUc1QixJQUFJLElBQUksR0FBRyxJQUFJQSxTQUFPLENBQUM7SUFDdkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7SUFHL0MsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztJQUU1QixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7SUFHcEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9DLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0lBRy9DLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBS3BCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtNQUN6QixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QixLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDZixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7VUFDcEIsRUFBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQTtPQUNuQjtLQUNGOztJQUVELElBQUksVUFBVSxHQUFHLElBQUlELFNBQU87TUFDMUIsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDbkUsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDbkUsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDbkUsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDcEUsQ0FBQzs7SUFFRixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQSxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQTtJQUMxRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQSxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQTtJQUMxRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQSxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQTs7SUFFMUQsT0FBTyxJQUFJLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztHQUM5RTs7RUFFRCxNQUFNLEVBQUUsV0FBVztJQUNqQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRXJCLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDOzs7SUFHaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7Ozs7O0lBS2hGLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFBLE9BQU8sS0FBSyxDQUFDLEVBQUE7O0lBRTlDLElBQUksTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7O0lBRXZCLEdBQUcsSUFBSSxNQUFNLENBQUM7SUFDZCxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ2QsR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUNkLEdBQUcsSUFBSSxNQUFNLENBQUM7SUFDZCxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ2QsR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUNkLEdBQUcsSUFBSSxNQUFNLENBQUM7SUFDZCxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ2QsR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUNkLEdBQUcsSUFBSSxNQUFNLENBQUM7SUFDZCxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ2QsR0FBRyxJQUFJLE1BQU0sQ0FBQzs7SUFFZCxPQUFPLElBQUksUUFBUTtNQUNqQixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7TUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO01BQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztNQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7TUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO01BQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztNQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7TUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO01BQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztNQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7TUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO01BQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztNQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7TUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO01BQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztNQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7S0FDbEMsQ0FBQztHQUNIOzs7RUFHRCxTQUFTLEVBQUUsV0FBVztJQUNwQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7O0lBRWIsT0FBTyxJQUFJLFFBQVE7TUFDakIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7TUFDMUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7TUFDMUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7TUFDMUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7S0FDM0IsQ0FBQztHQUNIOztFQUVELGFBQWEsRUFBRSxTQUFTLE1BQU0sRUFBRTtJQUM5QixPQUFPLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0dBQzlDOztFQUVELE9BQU8sRUFBRSxXQUFXO0lBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7R0FDMUQ7O0VBRUQsU0FBUyxFQUFFLFdBQVc7SUFDcEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDOztJQUViLE9BQU87TUFDTCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztNQUMxQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztNQUMxQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztNQUMxQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztLQUMzQixDQUFDO0dBQ0g7O0VBRUQsU0FBUyxFQUFFLFdBQVc7SUFDcEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDOztJQUViLFFBQVE7TUFDTixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ1IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUNSLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDVCxDQUFDO0dBQ0g7O0VBRUQsUUFBUSxFQUFFLFNBQVMsTUFBTSxFQUFFO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUN4RTs7RUFFRCxVQUFVLEVB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Q0FBQyxDQUFDO1VBQ1QsTUFBTSxDQUFDLENBQUMsQ0FBQztVQUNULE1BQU0sQ0FBQyxDQUFDLENBQUM7VUFDVCxNQUFNLENBQUMsQ0FBQyxDQUFDO1VBQ1QsTUFBTSxDQUFDLENBQUMsQ0FBQztVQUNULE1BQU0sQ0FBQyxDQUFDLENBQUM7VUFDVCxNQUFNLENBQUMsRUFBRSxDQUFDO1VBQ1YsTUFBTSxDQUFDLEVBQUUsQ0FBQztVQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUM7VUFDVixNQUFNLENBQUMsRUFBRSxDQUFDO1VBQ1YsTUFBTSxDQUFDLEVBQUUsQ0FBQztVQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztLQUVsQixNQUFNO01BQ0wsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7TUFFOUQsRUFBRSxHQUFHLElBQUlBLEtBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1VBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUM7VUFDVCxNQUFNLENBQUMsQ0FBQyxDQUFDO1VBQ1QsTUFBTSxDQUFDLENBQUMsQ0FBQztVQUNULE1BQU0sQ0FBQyxDQUFDLENBQUM7VUFDVCxNQUFNLENBQUMsQ0FBQyxDQUFDO1VBQ1QsTUFBTSxDQUFDLENBQUMsQ0FBQztVQUNULE1BQU0sQ0FBQyxDQUFDLENBQUM7VUFDVCxNQUFNLENBQUMsQ0FBQyxDQUFDO1VBQ1QsTUFBTSxDQUFDLENBQUMsQ0FBQztVQUNULE1BQU0sQ0FBQyxFQUFFLENBQUM7VUFDVixNQUFNLENBQUMsRUFBRSxDQUFDO1VBQ1YsTUFBTSxDQUFDLEVBQUUsQ0FBQztVQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUM7VUFDVixNQUFNLENBQUMsRUFBRSxDQUFDO1VBQ1YsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDbEI7R0FD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SUFBSSxDQUFDLE9BQU8sQ0FBQztHQUMzQixJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUEsT0FBTyxFQUFBOztHQUVyQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztHQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNoRSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFBO0dBQy9CO0VBQ0QsSUFBSSxFQUFFLFdBQVc7R0FDaEIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztHQUN4QixJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFBO0dBQy9CLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUE7R0FDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztHQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztHQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0dBQzlCO0VBQ0QsS0FBSyxFQUFFLFdBQVc7R0FDakIsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFBO0dBQzFCLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUE7R0FDOUMsSUFBSSxDQUFD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
