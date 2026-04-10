(function(){
  function SynthAudio(){
    this.ctx = null;
    this.isEnabled = true;
  }

  SynthAudio.prototype.getCtx = function(){
    if (!this.ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch(e){}
    }
    return this.ctx;
  };

  SynthAudio.prototype.tone = function(freq, dur, type){
    if (!this.isEnabled) return;
    var ctx = this.getCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(function(){});
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.15));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (dur || 0.15));
    } catch(e){}
  };

  SynthAudio.prototype.click = function(){ this.tone(800, 0.08, 'sine'); };
  SynthAudio.prototype.correct = function(){
    var self = this;
    self.tone(523, 0.12, 'sine');
    setTimeout(function(){ self.tone(659, 0.12, 'sine'); }, 120);
    setTimeout(function(){ self.tone(784, 0.18, 'sine'); }, 240);
  };
  SynthAudio.prototype.wrong = function(){ this.tone(220, 0.25, 'sawtooth'); };
  SynthAudio.prototype.swoosh = function(){ this.tone(400, 0.15, 'triangle'); };
  SynthAudio.prototype.switchOn = function(){ this.tone(660, 0.1, 'sine'); };
  SynthAudio.prototype.switchOff = function(){ this.tone(330, 0.1, 'sine'); };
  SynthAudio.prototype.addBulb = function(){
    var self = this;
    self.tone(440, 0.08, 'sine');
    setTimeout(function(){ self.tone(554, 0.08, 'sine'); }, 80);
  };
  SynthAudio.prototype.removeBulb = function(){
    var self = this;
    self.tone(554, 0.08, 'sine');
    setTimeout(function(){ self.tone(440, 0.08, 'sine'); }, 80);
  };

  window.sound = new SynthAudio();

  function useAudioFeedback(){
    return {
      click: function(){ window.sound.click(); },
      correct: function(){ window.sound.correct(); },
      wrong: function(){ window.sound.wrong(); },
      swoosh: function(){ window.sound.swoosh(); },
      switchOn: function(){ window.sound.switchOn(); },
      switchOff: function(){ window.sound.switchOff(); },
      addBulb: function(){ window.sound.addBulb(); },
      removeBulb: function(){ window.sound.removeBulb(); }
    };
  }
  window.useAudioFeedback = useAudioFeedback;
})();
