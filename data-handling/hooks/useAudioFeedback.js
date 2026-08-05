class SoundManager{
  constructor(){
    this.sounds={};
    this.isEnabled=true;
    this.init();
  }
  init(){
    const files={
      click:'assets/click.mp3',
      correct:'assets/correct.mp3',
      wrong:'assets/wrong.mp3',
      confetti:'assets/confetti.mp3'
    };
    Object.entries(files).forEach(([k,p])=>{
      this.sounds[k]=new Audio(p);
      this.sounds[k].preload='auto';
      this.sounds[k].volume=.35;
    });
  }
  play(key){
    if(!this.isEnabled||!this.sounds[key])return;
    try{
      this.sounds[key].currentTime=0;
      this.sounds[key].play().catch(()=>{});
    }catch(_){}
  }
  click(){this.play('click');}
  correct(){this.play('correct');}
  wrong(){this.play('wrong');}
  confetti(){this.play('confetti');}
  setEnabled(v){this.isEnabled=!!v;}
  setVolume(v){Object.values(this.sounds).forEach(a=>a.volume=Math.max(0,Math.min(1,v)));}
}

window.sound=new SoundManager();

function useAudioFeedback(){
  return {
    click: ()=>window.sound.click(),
    correct: ()=>window.sound.correct(),
    wrong: ()=>window.sound.wrong()
  };
}

window.useAudioFeedback = useAudioFeedback;
