/*
NoiseGenJS
v0.2.2
Author: Cole Reed
ichabodcole (AT) gmail.com

Copyright (c) 2013 Cole Reed, https://github.com/ichabodcole/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {
  var BrownNoise, Noise, NoiseFactory, NoiseGen, PinkNoise, Silence, WhiteNoise, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  NoiseGen = (function() {
    NoiseGen.STOPPED = 0;

    NoiseGen.PLAYING = 1;

    NoiseGen.WHITE_NOISE = "white";

    NoiseGen.BROWN_NOISE = "brown";

    NoiseGen.PINK_NOISE = "pink";

    NoiseGen.SILENCE = "silence";

    function NoiseGen(ctx, noiseType) {
      this.noiseType = noiseType != null ? noiseType : NoiseGen.BROWN_NOISE;
      this.input = ctx.createGain();
      this.output = ctx.createGain();
      this.instanceCount = 0;
      this.bufferSize = 4096;
      this.audioProcessor = null;
      this.noise = null;
      this.state = this.STOPPED;
      this.timeout = null;
      this.bufferTimeout = 250;
      this._createInternalNodes(ctx);
      this._routeNodes();
    }

    NoiseGen.prototype._createInternalNodes = function(ctx) {
      return this.audioProcessor = this._storeProcessor(ctx.createScriptProcessor(this.bufferSize, 1, 2));
    };

    NoiseGen.prototype._routeNodes = function() {
      return this.input.connect(this.output);
    };

    NoiseGen.prototype._getProcessorIndex = function() {
      var _ref;
      return window.NoiseGenProcessors = (_ref = window.NoiseGenProcessors) != null ? _ref : [];
    };

    NoiseGen.prototype._storeProcessor = function(node) {
      var pIndex;
      pIndex = this._getProcessorIndex();
      node.id = pIndex.length;
      pIndex[node.id] = node;
      return node;
    };

    NoiseGen.prototype._removeProcessor = function(node) {
      var pIndex;
      pIndex = this._getProcessorIndex();
      delete pIndex[node.id];
      pIndex.splice(node.id, 1);
      return node;
    };

    NoiseGen.prototype._createProcessorLoop = function() {
      var _this = this;
      this.audioProcessor.onaudioprocess = function(e) {
        var i, outBufferL, outBufferR;
        outBufferL = e.outputBuffer.getChannelData(0);
        outBufferR = e.outputBuffer.getChannelData(1);
        i = 0;
        while (i < _this.bufferSize) {
          outBufferL[i] = _this.noise.update();
          outBufferR[i] = _this.noise.update();
          i++;
        }
        return null;
      };
      return null;
    };

    NoiseGen.prototype._setNoiseGenerator = function(noiseType) {
      return this.noise = NoiseFactory.create(noiseType);
    };

    NoiseGen.prototype._createProcessorTimeout = function() {
      var _this = this;
      return this.timeout = setTimeout(function() {
        if (_this.state === _this.STOPPED) {
          return _this.audioProcessor.disconnect();
        }
      }, this.bufferTimeout);
    };

    NoiseGen.prototype._clearProcessorTimeout = function() {
      if (this.timeout !== null) {
        return clearTimeout(this.timeout);
      }
    };

    NoiseGen.prototype.start = function() {
      if (this.state === this.STOPPED) {
        this._clearProcessorTimeout();
        this._setNoiseGenerator(this.noiseType);
        this._createProcessorLoop();
        this.audioProcessor.connect(this.output);
        return this.state = this.PLAYING;
      }
    };

    NoiseGen.prototype.stop = function() {
      if (this.state === this.PLAYING) {
        this._setNoiseGenerator(NoiseGen.SILENCE);
        this._createProcessorTimeout();
        return this.state = this.STOPPED;
      }
    };

    NoiseGen.prototype.remove = function() {
      return this._removeProcessor(this.audioProcessor);
    };

    NoiseGen.prototype.connect = function(dest) {
      return this.output.connect(dest.input ? dest.input : dest);
    };

    NoiseGen.prototype.disconnect = function() {
      return this.output.disconnect();
    };

    NoiseGen.prototype.setNoiseType = function(noiseType) {
      this.noiseType = noiseType;
      return this._setNoiseGenerator(this.noiseType);
    };

    return NoiseGen;

  })();

  NoiseFactory = (function() {
    function NoiseFactory() {}

    NoiseFactory.create = function(type) {
      var noise;
      noise = (function() {
        switch (type) {
          case NoiseGen.WHITE_NOISE:
            return new WhiteNoise();
          case NoiseGen.PINK_NOISE:
            return new PinkNoise();
          case NoiseGen.BROWN_NOISE:
            return new BrownNoise();
          case NoiseGen.SILENCE:
            return new Silence();
          default:
            return new BrownNoise();
        }
      })();
      return noise;
    };

    return NoiseFactory;

  })();

  Noise = (function() {
    function Noise() {}

    Noise.prototype.update = function() {
      return "Not implemented";
    };

    Noise.prototype.random = function() {
      return Math.random() * 2 - 1;
    };

    return Noise;

  })();

  Silence = (function(_super) {
    __extends(Silence, _super);

    function Silence() {
      _ref = Silence.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Silence.prototype.update = function() {
      return 0;
    };

    return Silence;

  })(Noise);

  WhiteNoise = (function(_super) {
    __extends(WhiteNoise, _super);

    function WhiteNoise() {
      _ref1 = WhiteNoise.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    WhiteNoise.prototype.update = function() {
      return this.random();
    };

    return WhiteNoise;

  })(Noise);

  BrownNoise = (function(_super) {
    __extends(BrownNoise, _super);

    function BrownNoise() {
      this.base = 0;
    }

    BrownNoise.prototype.update = function() {
      var r;
      r = this.random() * 0.1;
      this.base += r;
      if (this.base < -1 || this.base > 1) {
        this.base -= r;
      }
      return this.base;
    };

    return BrownNoise;

  })(Noise);

  PinkNoise = (function(_super) {
    __extends(PinkNoise, _super);

    function PinkNoise() {
      this.alpha = 1;
      this.poles = 5;
      this.multipliers = this.zeroFill([], this.poles);
      this.values = this.zeroFill([], this.poles);
      this.fillArrays();
    }

    PinkNoise.prototype.fillArrays = function() {
      var a, i, _i, _j, _len, _len1, _ref2, _ref3, _results;
      a = 1;
      _ref2 = this.poles;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        i = _ref2[_i];
        a = (i - this.alpha / 2) * a / (i + 1);
        this.multipliers[i] = a;
      }
      _ref3 = this.poles * 5;
      _results = [];
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        i = _ref3[_j];
        _results.push(this.update());
      }
      return _results;
    };

    PinkNoise.prototype.zeroFill = function(myArray, fillSize) {
      var i, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fillSize.length; _i < _len; _i++) {
        i = fillSize[_i];
        _results.push(myArray[i] = 0);
      }
      return _results;
    };

    PinkNoise.prototype.update = function() {
      var i, x, _i, _len, _ref2;
      x = this.random() * 1;
      _ref2 = this.poles;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        i = _ref2[_i];
        x -= this.multipliers[i] * this.values[i];
      }
      this.values.unshift(x);
      this.values.pop();
      return x * 0.5;
    };

    return PinkNoise;

  })(Noise);

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return NoiseGen;
    });
  } else {
    if (typeof window === "object" && typeof window.document === "object") {
      window.NoiseGen = NoiseGen;
    }
  }

}).call(this);
