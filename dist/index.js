(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["fcsynth"] = factory();
	else
		root["fcsynth"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/buildNodes.js":
/*!***************************!*\
  !*** ./src/buildNodes.js ***!
  \***************************/
/*! exports provided: build */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"build\", function() { return build; });\nconst {\n  SimpleOscillator,\n  Gain,\n  NodeSet,\n  Envelope,\n  FrequencyEnvelope,\n  LevelEnvelope,\n  AdsrEnvelope,\n} = __webpack_require__(/*! ./nodes */ \"./src/nodes/index.js\");\n\nfunction build(model) {\n  const node = buildNodes(model);\n  return {\n    allNodes: unique(node.collectNodes()),\n    criticalEnvelopes: unique(node.collectCriticalEnvelopes()),\n    rootNode: node\n  };\n}\n\nfunction buildNodes(model) {\n  const scope = [];\n  for (const declaration of model) {\n    const {name, child} = declaration;\n    if (name in scope) {\n      throw new Error(`${name} is declared already`);\n    }\n    scope[name] = buildNode(child, scope);\n  }\n  return scope['@note'];\n}\n\nfunction buildNode(model, scope) {\n  if (Array.isArray(model)) {\n    return new NodeSet(model.map(m => buildNode(m, scope)));\n  }\n  function buildAudioParam(model) {\n    return {\n      envelope: buildNode(model.envelope, scope),\n      modulator: buildNode(model.modulator, scope)\n    };\n  }\n  switch (model.type) {\n    case 'oscillator':\n      return new SimpleOscillator(\n        model.waveType,\n        buildAudioParam(model.frequency),\n        buildNode(model.delay, scope));\n    case 'gain':\n      return new Gain(\n        buildAudioParam(model.gain),\n        buildNode(model.child, scope));\n    case 'frequency':\n      return new FrequencyEnvelope(\n        buildNode(model.expression, scope));\n    case 'level':\n      return new LevelEnvelope(\n        buildNode(model.expression, scope));\n    case 'envelope':\n      // TODO\n      break;\n    case 'operator':\n      return {\n        type: 'operator',\n        operator: model.operator,\n        args: model.args.map(arg => buildNode(arg, scope))\n      }\n      break;\n    case 'parameter':\n      return model;\n    case 'value':\n      return model;\n    case 'variable':\n      return scope[model.name];\n  }\n}\n\nfunction unique(arr) {\n  return arr.filter((x, i, self) => self.indexOf(x) === i);\n}\n\n\n//# sourceURL=webpack://fcsynth/./src/buildNodes.js?");

/***/ }),

/***/ "./src/defaultModel.js":
/*!*****************************!*\
  !*** ./src/defaultModel.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = [\n  {\n    name: '@note',\n    child: [\n      {\n        type: 'gain',\n        gain: {\n          envelope: {\n            type: 'level',\n            expression: {\n              type: 'parameter',\n              name: 'velocity'\n            }\n          },\n          modulator: [],\n        },\n        child: [\n          {\n            type: 'oscillator',\n            waveType: 'square',\n            frequency: {\n              envelope: {\n                type: 'frequency',\n                expression: {\n                  type: 'parameter',\n                  name: 'frequency'\n                }\n              },\n              modulator: []\n            },\n            delay: {\n              type: 'value',\n              value: 0\n            }\n          }\n        ],\n      }\n    ]\n  }\n];\n\n\n//# sourceURL=webpack://fcsynth/./src/defaultModel.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const buildNodes = __webpack_require__(/*! ./buildNodes.js */ \"./src/buildNodes.js\").build;\n\nclass SynthBuilder {\n  constructor(ac) {\n    this.ac = ac;\n  }\n\n  build(model, destination) {\n    destination = destination || this.ac.destination;\n    return new Synth(this.ac, destination, model);\n  }\n}\n\nclass Synth {\n  constructor(ac, destination, model) {\n    this.ac = ac;\n    this.destination = destination;\n    this.model = model;\n    this.trackParams = {}; // this can estimated from model\n    this.notes = [];\n  }\n\n  note(noteParams) {\n    const {allNodes, criticalEnvelopes, rootNode} = buildNodes(this.model);\n    allNodes.reverse().forEach(n => n.activate(this.ac)); // reverse?\n    rootNode.connect(this.destination);\n    const note = new Note(synth, allNodes, criticalEnvelopes, noteParams);\n    this.notes.push(note);\n    return note;\n  }\n\n  forceStop(time) {\n    this.notes.forEach(note => note.forceStop(time));\n    this.notes = [];\n  }\n\n  setTrackParam(time, params) {\n    this.trackParams = {\n      ...this.trackParams,\n      params\n    };\n    this.notes.forEach(note => note._updateParam(time));\n  }\n\n  update(time) {\n    this.notes = this.notes.filter(note => note.endTime < time);\n  }\n}\n\nclass Note {\n  constructor(synth, allNodes, criticalEnvelopes, noteParams) {\n    this.synth = synth;\n    this.allNodes = allNodes;\n    this.criticalEnvelopes = criticalEnvelopes;\n    this.noteParams = noteParams;\n    this.endTime = Infinity;\n  }\n\n  on(time) {\n    const params = {\n      ...this.synth.trackParams,\n      ...this.noteParams\n    };\n    this.allNodes.forEach(node => node.start(time, params));\n  }\n\n  off(time) {\n    const params = {\n      ...this.synth.trackParams,\n      ...this.noteParams\n    };\n    this.allNodes.forEach(node => node.stop(time, params));\n\n    if (this.criticalEnvelopes.length > 0) {\n      this.endTime = Math.min(\n        this.endTime,\n        Math.max(...this.criticalEnvelopes.map(env => env.endTime)));\n    } else {\n      this.endTime = Math.min(this.endTime, time);\n    }\n\n    this.allNodes.forEach(node => node.forceStop(this.endTime));\n  }\n\n  forceStop(time) {\n    this.allNodes.forEach(node => node.forceStop(time));\n    this.endTime = time;\n  }\n\n  _updateParam(time) {\n    const params = {\n      ...this.synth.trackParams,\n      ...this.noteParams,\n    };\n    this.allNodes.forEach(node => node.updateParam(time, params));\n  }\n}\n\nmodule.exports = {\n  SynthBuilder,\n  defaultModel: __webpack_require__(/*! ./defaultModel.js */ \"./src/defaultModel.js\"),\n};\n\n\n//# sourceURL=webpack://fcsynth/./src/index.js?");

/***/ }),

/***/ "./src/nodes/envelope.js":
/*!*******************************!*\
  !*** ./src/nodes/envelope.js ***!
  \*******************************/
/*! exports provided: Envelope, FrequencyEnvelope, LevelEnvelope, AdsrEnvelope */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Envelope\", function() { return Envelope; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FrequencyEnvelope\", function() { return FrequencyEnvelope; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"LevelEnvelope\", function() { return LevelEnvelope; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"AdsrEnvelope\", function() { return AdsrEnvelope; });\nconst {Node} = __webpack_require__(/*! ./node.js */ \"./src/nodes/node.js\");\nconst {evalExpr, interpolateExponentialRamp} = __webpack_require__(/*! ./util.js */ \"./src/nodes/util.js\");\n\nclass Envelope extends Node {\n  constructor() {\n    super();\n    this.audioParams = [];\n    this._endTime = Infinity;\n  }\n\n  stop(time, note) {\n    this._endTime = time;\n  }\n\n  setValueAtTime(value, time) {\n    this.audioParams.forEach(x => x.setValueAtTime(value, time));\n  }\n\n  exponentialRampToValueAtTime(value, time) {\n    this.audioParams.forEach(x => x.exponentialRampToValueAtTime(value, time));\n  }\n\n  cancelScheduledValues(time) {\n    this.audioParams.forEach(x => x.cancelScheduledValues(time));\n  }\n\n  connect(audioParam) {\n    this.audioParams.push(audioParam);\n  }\n\n  get endTime() {\n    return this._endTime;\n  }\n\n  collectNodes() {\n    return [this];\n  }\n\n  collectCriticalEnvelopes() {\n    throw new Error('Here is unreachable');\n    return [this];\n  }\n}\n\nclass FrequencyEnvelope extends Envelope {\n  constructor(frequencyExpr) {\n    super();\n    this.frequencyExpr = frequencyExpr;\n  }\n\n  start(time, params) {\n    this.setValueAtTime(evalExpr(this.frequencyExpr, params), time);\n  }\n\n  setParam(time, params) {\n    this.setValueAtTime(evalExpr(this.frequencyExpr, params), time);\n  }\n\n  frequency(start, time, end, endTime, note) {\n    this.setValueAtTime(evalExpr(this.frequecyExpr, {\n      ...note.param,\n      f: start\n    }), time);\n    let endFrequency = evalExpr(this.frequecyExpr, {\n      ...note.param,\n      f: end\n    });\n    if (endFrequency < 0) {\n      endFrequency = Math.min(-FREQUENCY_EPS, endFrequency);\n    } else {\n      endFrequency = Math.max(FREQUENCY_EPS, endFrequency);\n    }\n    this.exponentialRampToValueAtTime(endFrequency, endTime)\n  }\n}\n\nclass LevelEnvelope extends Envelope {\n  constructor(levelExpr) {\n    super();\n    this.levelExpr = levelExpr;\n  }\n\n  start(time, params) {\n    this.setValueAtTime(evalExpr(this.levelExpr, params), time);\n  }\n\n  setParam(time, params) {\n    this.setValueAtTime(evalExpr(this.levelExpr, params), time);\n  }\n}\n\nclass AdsrEnvelope extends Envelope {\n  constructor(levelExpr, attackExpr, decayExpr, sustainExpr, releaseExpr) {\n    this.levelExpr = levelExpr;\n    this.attackExpr = attackExpr;\n    this.decayExpr = decayExpr;\n    this.sustainExpr = sustainExpr;\n    this.releaseExpr = releaseExpr;\n  }\n\n  start(time, params) {\n    this.level = evalExpr(this.levelExpr, params);\n    this.attack = clamp(TIME_EPS, Infinity, evalExpr(this.attackExpr, params) * 0.001);\n    this.decay = clamp(TIME_EPS, Infinity, evalExpr(this.decayExpr, params) * 0.001);\n    this.sustain = clamp(GAIN_EPS, 1, evalExpr(this.sustainExpr, params));\n    this.release = clamp(TIME_EPS, Infinity, evalExpr(this.releaseExpr, params) * 0.001);\n\n    this.setValueAtTime(GAIN_EPS, time);\n    this.exponentialRampToValueAtTime(this.level, time + this.attack);\n    this.exponentialRampToValueAtTime(this.level * this.sustain, time + this.attack + this.decay);\n  }\n\n  stop(time, params) {\n    this._endTime = time + this.release;\n\n    this.cancelScheduledValues(time);\n    if (time <= note.startTime + this.attack) {\n      const v = this.level * interpolateExponentialRamp(GAIN_EPS, 1, (time - note.startTime) / this.attack);\n      this.exponentialRampToValueAtTime(v, time);\n    } else if (time < note.startTime + this.attack + this.decay) {\n      const v = this.level * interpolateExponentialRamp(1, this.sustain, (time - note.startTime - this.attack) / this.decay);\n      this.exponentialRampToValueAtTime(v, time);\n    } else {\n      this.setValueAtTime(this.level * this.sustain, time);\n    }\n    this.exponentialRampToValueAtTime(0 < this.level ? GAIN_EPS : -GAIN_EPS, this._endTime);\n  }\n\n  // setParam(...)\n}\n/*\nexport class PercEnvelope extends Envelope {\n  constructor(ac, args) {\n    super(ac, args);\n    if (args.length !== 3) {\n      throw new Error('Arguments length is invalid');\n    }\n    this.levelExpr = args[0];\n    this.attackExpr = args[1];\n    this.releaseExpr = args[2];\n  }\n\n  start(time, note) {\n    const param = note.param;\n    this.level = evalExpr(this.levelExpr, param);\n    this.attack = clamp(TIME_EPS, Infinity, evalExpr(this.attackExpr, param) * 0.001);\n    this.release = clamp(TIME_EPS, Infinity, evalExpr(this.releaseExpr, param) * 0.001);\n\n    this.setValueAtTime(GAIN_EPS, time);\n    this.exponentialRampToValueAtTime(this.level, time + this.attack);\n\n    this.exponentialRampToValueAtTime(0 < this.level ? GAIN_EPS : -GAIN_EPS, time + this.attack + this.release);\n  }\n\n  stop(time, note) {\n    this._endTime = note.startTime + this.attack + this.release;\n  }\n}\n*/\n\nfunction clamp(min, max, val) {\n  return Math.max(min, Math.min(max, val));\n}\n\nconst TIME_EPS = 0.0000001;\nconst GAIN_EPS = 0.01\nconst FREQUENCY_EPS = 0.0000001;\n\n\n//# sourceURL=webpack://fcsynth/./src/nodes/envelope.js?");

/***/ }),

/***/ "./src/nodes/index.js":
/*!****************************!*\
  !*** ./src/nodes/index.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = {\n  ...__webpack_require__(/*! ./node.js */ \"./src/nodes/node.js\"),\n  ...__webpack_require__(/*! ./envelope.js */ \"./src/nodes/envelope.js\"),\n//  ...require('./filter.js'),\n};\n\n\n//# sourceURL=webpack://fcsynth/./src/nodes/index.js?");

/***/ }),

/***/ "./src/nodes/node.js":
/*!***************************!*\
  !*** ./src/nodes/node.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const {evalExpr, volumeToGainValue} = __webpack_require__(/*! ./util.js */ \"./src/nodes/util.js\");\n\nclass Node {\n  activate(ac) {\n  }\n\n  start(time, params) {\n  }\n\n  stop(time, params) {\n  }\n\n  forceStop(time) {\n  }\n\n  updateParam(time, params) {\n  }\n\n  connect(rawNode) {\n    this.rawNodes.forEach(cf => cf.connect(rawNode));\n  }\n\n  get rawNodes() {\n    return [];\n  }\n\n  collectNodes() {\n    throw new Error('Not implemented');\n  }\n\n  collectCriticalEnvelopes() {\n    throw new Error('Not implemented');\n  }\n}\n\nclass SimpleOscillator extends Node {\n  constructor(type, frequencyCtrl, delayExpr) {\n    super();\n    this.type = type;\n    this.frequencyCtrl = frequencyCtrl;\n    this.delayExpr = delayExpr;\n  }\n\n  activate(ac) {\n    this.osc = ac.createOscillator();\n    this.osc.type = this.type;\n    this.frequencyCtrl.envelope.connect(this.osc.frequency);\n    this.frequencyCtrl.modulator.connect(this.osc.frequency);\n  }\n\n  start(time, params) {\n    const delay = this.delayExpr ? evalExpr(this.delayExpr, params) : 0;\n    this.osc.start(time + delay);\n  }\n\n  forceStop(time) {\n    this.osc.stop(time);\n  }\n\n  get rawNodes() {\n    return [this.osc];\n  }\n\n  collectNodes() {\n    return [\n      this,\n      ...this.frequencyCtrl.envelope.collectNodes(),\n      ...this.frequencyCtrl.modulator.collectNodes()\n    ];\n  }\n\n  collectCriticalEnvelopes() {\n    throw new Error('Not implemented');\n  }\n}\n\nclass Gain extends Node {\n  constructor(gainCtrl, child) {\n    super();\n    this.gainCtrl = gainCtrl;\n    this.child = child;\n  }\n\n  activate(ac) {\n    this.gain = ac.createGain();\n    this.gainCtrl.envelope.connect(this.gain.gain);\n    this.gainCtrl.modulator.connect(this.gain.gain);\n    this.rawNodes.forEach(rn => this.child.connect(rn));\n  }\n\n  get rawNodes() {\n    return [this.gain];\n  }\n\n  collectNodes() {\n    return [\n      this,\n      ...this.child.collectNodes(),\n      ...this.gainCtrl.envelope.collectNodes(),\n      ...this.gainCtrl.modulator.collectNodes()\n    ];\n  }\n\n  collectCriticalEnvelopes() {\n    return [this.gainCtrl.envelope];\n  }\n}\n\nclass NodeSet extends Node {\n  constructor(nodes) {\n    super();\n    this.nodes = nodes;\n  }\n\n  activate(ac) {\n  }\n\n  get rawNodes() {\n    return [].concat(...this.nodes.map(n => n.rawNodes));\n  }\n\n  collectNodes() {\n    return [].concat(...this.nodes.map(n => n.collectNodes()));\n  }\n\n  collectCriticalEnvelopes() {\n    return [].concat(...this.nodes.map(n => n.collectCriticalEnvelopes()));\n  }\n}\n\n/*\nclass Mixer {\n  constructor(ac) {\n    this.gain = ac.createGain();\n    this.panner = ac.createStereoPanner();\n    this.gain.connect(this.panner);\n  }\n\n  setParam(param, time, note) {\n    for (const [key, value] of Object.entries(param)) {\n      switch (key) {\n        case 'volume':\n          this.gain.gain.setValueAtTime(volumeToGainValue(value), time);\n          break;\n        case 'pan':\n          this.panner.pan.setValueAtTime(value * 2 - 1, time);\n          break;\n      }\n    }\n  }\n\n  getInput() {\n    return this.gain;\n  }\n\n  connect(audioNode) {\n    this.panner.connect(audioNode);\n  }\n}*/\n\nmodule.exports = {\n  Node,\n  SimpleOscillator,\n  Gain,\n  NodeSet,\n  //Mixer,\n};\n\n\n//# sourceURL=webpack://fcsynth/./src/nodes/node.js?");

/***/ }),

/***/ "./src/nodes/util.js":
/*!***************************!*\
  !*** ./src/nodes/util.js ***!
  \***************************/
/*! exports provided: evalExpr, volumeToGainValue, interpolateExponentialRamp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"evalExpr\", function() { return evalExpr; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"volumeToGainValue\", function() { return volumeToGainValue; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"interpolateExponentialRamp\", function() { return interpolateExponentialRamp; });\nfunction evalExpr(expr, params) {\n  switch (expr.type) {\n    case 'operator':\n      const args = expr.arguments.map(x => evalExpr(x, params));\n      switch (expr.operator) {\n        case '+':\n          if (args.length === 2) {\n            return args[0] + args[1];\n          }\n        case '-':\n          if (args.length === 1) {\n            return -args[0];\n          } else if (args.length === 2) {\n            return args[0] - args[1];\n          }\n        case '*':\n          if (args.length === 2) {\n            return args[0] * args[1];\n          }\n        case '/':\n          if (args.length === 2) {\n            return args[0] / args[1];\n          }\n      }\n      break;\n    case 'parameter':\n      return params[expr.name];\n    case 'value':\n      return expr.value;\n  }\n}\n\nfunction volumeToGainValue(v) {\n  if (v <= 0) {\n    return 0;\n  }\n  return dbToGainValue(-(1 - v) * 3 * 16);\n}\n\nfunction dbToGainValue(v) {\n  return Math.exp(v * Math.LN10 / 20);\n}\n\nfunction interpolateExponentialRamp(y1, y2, x) {\n  return Math.exp(Math.log(y1) * (1 - x) + Math.log(y2) * x);\n}\n\n\n//# sourceURL=webpack://fcsynth/./src/nodes/util.js?");

/***/ })

/******/ });
});