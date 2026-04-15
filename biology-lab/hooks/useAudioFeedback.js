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
  SynthAudio.prototype.select = function(){
    var self = this;
    self.tone(660, 0.08, 'sine');
    setTimeout(function(){ self.tone(880, 0.08, 'sine'); }, 60);
  };
  SynthAudio.prototype.deselect = function(){
    var self = this;
    self.tone(880, 0.06, 'sine');
    setTimeout(function(){ self.tone(660, 0.08, 'sine'); }, 60);
  };
  SynthAudio.prototype.correct = function(){
    var self = this;
    self.tone(523, 0.12, 'sine');
    setTimeout(function(){ self.tone(659, 0.12, 'sine'); }, 120);
    setTimeout(function(){ self.tone(784, 0.22, 'sine'); }, 240);
  };
  SynthAudio.prototype.partial = function(){
    var self = this;
    self.tone(440, 0.12, 'sine');
    setTimeout(function(){ self.tone(523, 0.15, 'sine'); }, 130);
  };
  SynthAudio.prototype.wrong = function(){ this.tone(220, 0.28, 'sawtooth'); };
  SynthAudio.prototype.submit = function(){ this.tone(500, 0.12, 'triangle'); };
  SynthAudio.prototype.reset = function(){ this.tone(350, 0.15, 'triangle'); };

  window.sound = new SynthAudio();

  function useAudioFeedback(){
    return {
      click:    function(){ window.sound.click(); },
      select:   function(){ window.sound.select(); },
      deselect: function(){ window.sound.deselect(); },
      correct:  function(){ window.sound.correct(); },
      partial:  function(){ window.sound.partial(); },
      wrong:    function(){ window.sound.wrong(); },
      submit:   function(){ window.sound.submit(); },
      reset:    function(){ window.sound.reset(); }
    };
  }
  window.useAudioFeedback = useAudioFeedback;
})();
