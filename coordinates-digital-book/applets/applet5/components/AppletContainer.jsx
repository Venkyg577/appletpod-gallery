// AppletContainer.jsx — root orchestrator for "Distance Between Two Points" (16 logical screens).
// Each screen handles ask -> answer -> reveal internally, so one Next advances to the next real
// step. Holds the geometry constants, derives the DistancePlane `view` per screen, builds the
// right column (MCQ / drag tiles / formula panels) and the footer, and wires audio + timers.
//
// Logical screen map:
//   1 intro AD | 2 sample-line buttons | 3 horizontal PQ | 4 vertical RS | 5 restore AD
//   6 horizontal-change MCQ | 7 vertical-change MCQ | 8 build triangle | 9 AD Pythagoras
//   10 DM drag tiles | 11 DM Pythagoras | 12 MA Pythagoras
//   13 generalize changes | 14 two shorter sides | 15 distance formula | 16 free exploration
(function(){
  var h = window.MiniReact.h;
  var useEffect = window.MiniReact.useEffect;
  var useState = window.MiniReact.useState;

  // ---- fixed geometry (guided phase) ----
  var A = { x:3, y:4 }, D = { x:7, y:1 }, M = { x:9, y:6 };
  var C = { x:3, y:1 };   // foot of AD right triangle (right angle at C)
  var E = { x:9, y:1 };   // foot of DM right triangle (right angle at E)
  var MA_CORNER = { x:3, y:6 }; // foot of MA right triangle (right angle here)
  // sample lines
  var P = { x:3, y:0 }, Q = { x:9, y:0 };  // horizontal sample PQ
  var R = { x:0, y:5 }, S = { x:0, y:2 };  // vertical sample RS

  function ptLabel(p, name){ return name + ' (' + p.x + ', ' + p.y + ')'; }
  function mid(a, b){ return { x:(a.x + b.x) / 2, y:(a.y + b.y) / 2 }; }

  // The three named points A/D/M. Each is ghost (faint grey background) unless its letter is in
  // opts.active. Like the PDF, all three are always plotted; only the ones in play read bright.
  //   opts.active : string of letters to show bright, e.g. 'AD', 'ADM', 'AM'
  //   opts.aPos/dPos/mPos : label sides; opts.pulseA/D/M : pulse the bright dot
  function corePoints(opts){
    opts = opts || {};
    var on = opts.active != null ? opts.active : 'ADM';   // '' = all ghost (don't fall through to default)
    function pt(P, name, pos, pulse){
      var bright = on.indexOf(name) !== -1;
      return { x:P.x, y:P.y, label:ptLabel(P, name), labelPos:pos, ghost:!bright, pulse:bright && pulse };
    }
    return [
      pt(A, 'A', opts.aPos || 'left',       opts.pulseA),
      pt(D, 'D', opts.dPos || 'below-left', opts.pulseD),
      pt(M, 'M', opts.mPos || 'right',      opts.pulseM)
    ];
  }

  // The outer AMD frame (sides AM, MD, AD) drawn as faint ghost outlines in the background, so the
  // full triangle is always implied while the active step's own sides are layered bright on top.
  // opts.skip = array of side keys to omit (e.g. when a side is being drawn bright this screen).
  function amdFrame(opts){
    opts = opts || {};
    var skip = opts.skip || [];
    var sides = [
      { key:'AM', from:A, to:M },
      { key:'MD', from:M, to:D },
      { key:'AD', from:A, to:D }
    ];
    return sides.filter(function(s){ return skip.indexOf(s.key) === -1; })
      .map(function(s){ return { from:s.from, to:s.to, kind:'slant', ghost:true }; });
  }

  function AppletContainer(props){
    var appData = props.appData || window.appData;
    var createI18n = window.i18n.createI18n;
    var i18n = appData ? createI18n(appData, 'en') : { t:function(k){ return k; } };
    var t = function(k, p){ return i18n.t('content-ui.screens.' + k, p); };
    var tBtn = function(k){ return i18n.t('standard-ui.buttons.' + k); };

    window.useResponsiveLayout();
    var audio = window.useAudioFeedback();
    var app = window.useAppletState();
    var screen = app.screen;

    // ---- formula screen (15): step the substitution chain ----
    var revealS = useState(0);
    var revealStage = revealS[0], setRevealStage = revealS[1];

    useEffect(function(){
      if (screen === 15){
        setRevealStage(0);
        var timers = [
          setTimeout(function(){ setRevealStage(1); }, 600),
          setTimeout(function(){ setRevealStage(2); }, 1400),
          setTimeout(function(){ setRevealStage(3); }, 2200)
        ];
        return function(){ timers.forEach(clearTimeout); };
      }
      setRevealStage(0);
    }, [screen]);

    // clear a drag teeter shortly after it fires
    useEffect(function(){
      if (app.drag && app.drag.teeter != null){
        var tm = setTimeout(function(){ app.clearTeeter(); }, 550);
        return function(){ clearTimeout(tm); };
      }
    }, [app.drag && app.drag.teeter]);

    // screen 16 (free exploration): once both points are picked, step through the same
    // formula -> substituted -> simplified -> answer reveal as screen 15 (storyboard page 33),
    // shown in the right column. Resets whenever the point pair changes (new pick or Explore again).
    var exploreRevealS = useState(0);
    var exploreReveal = exploreRevealS[0], setExploreReveal = exploreRevealS[1];
    var explP1 = app.explore.p1, explP2 = app.explore.p2;
    useEffect(function(){
      if (screen === 16 && explP1 && explP2){
        setExploreReveal(0);
        var timers = [
          setTimeout(function(){ setExploreReveal(1); }, 600),
          setTimeout(function(){ setExploreReveal(2); }, 1400),
          setTimeout(function(){ setExploreReveal(3); }, 2200)
        ];
        return function(){ timers.forEach(clearTimeout); };
      }
      setExploreReveal(0);
    }, [screen, explP1 && explP1.x, explP1 && explP1.y, explP2 && explP2.x, explP2 && explP2.y]);

    // screens 6/7 (horizontal/vertical change MCQ): once answered correctly, the "7 - 3" / "4 - 1"
    // subtraction card shows first, then after 2s swaps to the plain "4" / "3" answer in the same
    // spot (storyboard pages 9-10) — it replaces the card rather than showing both at once.
    var calcSwapS = useState(false);
    var calcSwapped = calcSwapS[0], setCalcSwapped = calcSwapS[1];
    useEffect(function(){
      var justSolved = (screen === 6 && app.hChange.result === 'correct') ||
                        (screen === 7 && app.vChange.result === 'correct');
      if (justSolved){
        setCalcSwapped(false);
        var tm = setTimeout(function(){ setCalcSwapped(true); }, 2000);
        return function(){ clearTimeout(tm); };
      }
      setCalcSwapped(false);
    }, [screen, app.hChange.result, app.vChange.result]);

    // screens 3/4 (horizontal/vertical reveal): once BOTH sample lines have been opened,
    // auto-advance onward to screen 5 (no Next button on these screens — see deriveFooter).
    useEffect(function(){
      if ((screen === 3 || screen === 4) && app.lineMode.horizontal && app.lineMode.vertical){
        var tm = setTimeout(function(){ audio.swoosh(); app.goTo(5); }, 1400);
        return function(){ clearTimeout(tm); };
      }
    }, [screen, app.lineMode.horizontal, app.lineMode.vertical]);

    // ---------- handlers ----------
    // tapping a sample-line button jumps straight into that line's reveal screen (3 or 4)
    // instead of relying on sequential Next, since either button can be tapped first.
    function onSelectLine(which){
      audio.click();
      app.selectLine(which);
      app.goTo(which === 'horizontal' ? 3 : 4);
    }
    function makeMcqHandler(stage, correctValue){
      return function(value){
        var res = app.answerMcq(stage, value, correctValue);
        if (res === 'correct') audio.correct(); else audio.wrong();
      };
    }
    function onDropTile(slot, value){
      var res = app.dropTile(slot, value, 2, 5); // DM: horizontal=2, vertical=5
      if (res === 'h' || res === 'v') audio.correct();
      else if (res === 'wrong') audio.wrong();
    }
    function onPlaneTap(x, y){
      var r = app.tapExplorePoint(x, y);
      if (r) audio.click();
    }
    function onNext(){ audio.swoosh(); app.next(); }
    function onExploreAgain(){ audio.click(); app.exploreAgain(); }

    // ---------- derive content ----------
    var heading = deriveHeading(screen, t);
    var view = deriveView(screen, app, revealStage, t, calcSwapped, exploreReveal);

    var rightCol = deriveRightCol(screen, app, t, exploreReveal, {
      onMcqH: makeMcqHandler('hChange', 4),
      onMcqV: makeMcqHandler('vChange', 3),
      onMcqAD: makeMcqHandler('ad', '5'),
      onMcqDM: makeMcqHandler('dm', 'sqrt29'),
      onMcqMA: makeMcqHandler('ma', 'sqrt40'),
      onDropTile: onDropTile
    });

    var footer = deriveFooter(screen, app, t, tBtn, calcSwapped, {
      onNext: onNext, onSelectLine: onSelectLine, onExploreAgain: onExploreAgain
    });

    return h('div', { className:'applet-root' },
      h('div', { className:'screen-layout' },
        h('div', { className:'screen-header' }, heading),
        h('div', { className:'screen-main' },
          h('div', { className:'grid-col' },
            h(window.DistancePlane, { view: view, onPlanePointTap: onPlaneTap }),
            h(window.Callout, { items: view.calloutItems })
          ),
          h('div', { className:'mcq-col' },
            h('div', { className:'mcq-col-content' }, rightCol),
            h('div', { className:'mcq-col-footer' }, footer)
          )
        )
      )
    );
  }

  // ======================================================================
  // headings
  // ======================================================================
  function deriveHeading(screen, t){
    switch (screen){
      case 1: return t('s1_heading');
      case 2: return t('s2_heading');
      case 3: return t('s3_heading');
      case 4: return t('s5_heading');
      case 5: return t('s7_heading');
      case 6: return t('s8_heading');
      case 7: return t('s11_heading');
      case 8: return t('s14_heading');
      case 9: return t('s15_heading');
      case 10: return t('s18_heading');
      case 11: return t('s23_heading');
      case 12: return t('s26_heading');
      case 13: return t('s29_heading');
      case 14: return t('s30_heading');
      case 15: return t('s31_heading');
      case 16: return t('s32_heading');
      default: return '';
    }
  }

  // ======================================================================
  // DistancePlane view per screen
  // ======================================================================
  function deriveView(screen, app, revealStage, t, calcSwapped, exploreReveal){
    var v = {};

    // ---------- 1: intro slanted AD ----------
    // A, D bright + AD slant pulsing; M and the AM/MD frame sit ghost in the background.
    if (screen === 1){
      v.points = corePoints({ active:'AD', dPos:'below-right' });
      v.segments = amdFrame({ skip:['AD'] }).concat([{ from:A, to:D, kind:'slant', pulse:true }]);
      v.questionMarks = [{ x:mid(A, D).x + 0.4, y:mid(A, D).y + 0.3, pulse:true }];
      return v;
    }

    // ---------- 2-4: sample horizontal / vertical lines ----------
    // sample-line screens: the whole AMD triangle recedes to ghost. PQ and RS are BOTH shown
    // bright by default (storyboard pages 2-6); once a button is tapped, that line's own screen
    // (3 or 4) takes over and the OTHER sample line recedes to ghost so the active one reads clearly.
    if (screen === 2){
      v.points = corePoints({ active:'', dPos:'below-right' }).concat([   // all three ghost
        { x:P.x, y:P.y, label:ptLabel(P, 'P'), labelPos:'below-axis' },
        { x:Q.x, y:Q.y, label:ptLabel(Q, 'Q'), labelPos:'below-axis' },
        { x:R.x, y:R.y, label:ptLabel(R, 'R'), labelPos:'left-axis' },
        { x:S.x, y:S.y, label:ptLabel(S, 'S'), labelPos:'left-axis' }
      ]);
      v.segments = amdFrame().concat([
        { from:P, to:Q, kind:'slant' },
        { from:R, to:S, kind:'slant' }
      ]);
      return v;
    }
    if (screen === 3){   // horizontal PQ — RS recedes to ghost so PQ reads as the active line
      v.points = corePoints({ active:'', dPos:'below-right' }).concat([
        { x:P.x, y:P.y, label:ptLabel(P, 'P'), labelPos:'below-axis' },
        { x:Q.x, y:Q.y, label:ptLabel(Q, 'Q'), labelPos:'below-axis' },
        { x:R.x, y:R.y, label:ptLabel(R, 'R'), labelPos:'left-axis', ghost:true },
        { x:S.x, y:S.y, label:ptLabel(S, 'S'), labelPos:'left-axis', ghost:true }
      ]);
      v.segments = amdFrame().concat([
        { from:P, to:Q, kind:'slant' },
        { from:R, to:S, kind:'slant', ghost:true }
      ]);
      v.highlightNums = { x:[3, 9] };
      v.legTags = [{ x:mid(P, Q).x, y:mid(P, Q).y - 0.9, text:t('s3_calc') }];
      v.calloutItems = [{ text:t('s3_dist_label'), pos:'bottom-right' }];
      return v;
    }
    if (screen === 4){   // vertical RS — PQ recedes to ghost so RS reads as the active line
      v.points = corePoints({ active:'', dPos:'below-right' }).concat([
        { x:P.x, y:P.y, label:ptLabel(P, 'P'), labelPos:'below-axis', ghost:true },
        { x:Q.x, y:Q.y, label:ptLabel(Q, 'Q'), labelPos:'below-axis', ghost:true },
        { x:R.x, y:R.y, label:ptLabel(R, 'R'), labelPos:'left-axis' },
        { x:S.x, y:S.y, label:ptLabel(S, 'S'), labelPos:'left-axis' }
      ]);
      v.segments = amdFrame().concat([
        { from:P, to:Q, kind:'slant', ghost:true },
        { from:R, to:S, kind:'slant' }
      ]);
      v.highlightNums = { y:[5, 2] };
      v.legTags = [{ x:mid(R, S).x + 0.9, y:mid(R, S).y, text:t('s5_calc') }];
      v.calloutItems = [{ text:t('s5_dist_label'), pos:'bottom-right' }];
      return v;
    }

    // ---------- 5: restore slanted AD with "?" — A,D bright again, M ghost ----------
    if (screen === 5){
      v.points = corePoints({ active:'AD', dPos:'below-right' });
      v.segments = amdFrame({ skip:['AD'] }).concat([{ from:A, to:D, kind:'slant', pulse:true }]);
      v.questionMarks = [{ x:mid(A, D).x + 0.4, y:mid(A, D).y + 0.3, pulse:true }];
      return v;
    }

    // ---------- 6: horizontal change A->D (MCQ) ----------
    // On the AD phase the horizontal leg + its "4"/"7−3" labels sit below the axis between C and
    // D, so D's label goes below-RIGHT (clear of those) — the right side near D is empty here.
    if (screen === 6){
      var hCorrect = app.hChange.result === 'correct';
      v.points = corePoints({ active:'AD', dPos:'below-right' });
      v.segments = amdFrame({ skip:['AD'] }).concat([
        { from:A, to:D, kind:'slant' },
        { from:C, to:D, kind:'leg', pulse:!hCorrect }       // green horizontal helper C->D
      ]);
      if (!hCorrect){ v.highlightNums = { x:[3, 7] }; }
      if (hCorrect){
        // "7 - 3" shows first; after a 2s pause it swaps in place to the plain answer "4"
        // (storyboard pages 9-10) rather than showing both stacked near the x-axis.
        if (calcSwapped){
          v.legNums = [{ x:mid(C, D).x, y:C.y - 0.7, text:'4' }];
        } else {
          v.legTags = [{ x:mid(C, D).x, y:C.y - 0.7, text:'7 − 3', tone:'default' }];
        }
      }
      return v;
    }

    // ---------- 7: vertical change A->D (MCQ) ----------
    if (screen === 7){
      var vCorrect = app.vChange.result === 'correct';
      v.points = corePoints({ active:'AD', dPos:'below-right' });
      v.segments = amdFrame({ skip:['AD'] }).concat([
        { from:A, to:D, kind:'slant' },
        { from:C, to:D, kind:'leg', done:true },            // horizontal leg: dehighlighted, already solved
        { from:A, to:C, kind:'leg', pulse:!vCorrect }       // green vertical helper A->C
      ]);
      // dashed reference lines from A and D over to the y-axis, tying each point to its y-value
      v.segments = v.segments.concat([
        { from:{ x:0, y:A.y }, to:A, kind:'thin' },
        { from:{ x:0, y:D.y }, to:D, kind:'thin' }
      ]);
      v.legNums = [{ x:mid(C, D).x, y:C.y - 0.7, text:'4' }];      // horizontal answer, settled from screen 6
      if (!vCorrect){ v.highlightNums = { y:[4, 1] }; }
      if (vCorrect){
        // "4 - 1" shows first; after a 2s pause it swaps in place to the plain answer "3"
        // (storyboard pages 11-13) rather than showing both stacked.
        if (calcSwapped){
          v.legNums.push({ x:A.x - 0.7, y:mid(A, C).y, text:'3', slant:false });
        } else {
          v.legTags = [{ x:A.x - 1.3, y:mid(A, C).y, text:'4 − 1', tone:'default' }];
        }
      }
      return v;
    }

    // ---------- 8: build the right triangle (M bright now, AM/MD still ghost) ----------
    if (screen === 8){
      v.points = corePoints({ active:'ADM', dPos:'below-right' }).concat([{ x:C.x, y:C.y, label:'C', labelPos:'below' }]);
      v.segments = amdFrame({ skip:['AD'] }).concat([
        { from:A, to:D, kind:'slant', pulse:true },
        { from:C, to:D, kind:'leg', pulse:true },
        { from:A, to:C, kind:'leg', pulse:true }
      ]);
      v.rightAngles = [{ at:C, ax:1, ay:1 }];
      v.legNums = [
        { x:mid(C, D).x, y:C.y - 0.7, text:'4' },
        { x:A.x - 0.6, y:mid(A, C).y, text:'3' }
      ];
      return v;
    }

    // ---------- 9: AD via Pythagoras (MCQ) ----------
    if (screen === 9){
      var adDone = app.ad.result === 'correct';
      v.points = corePoints({ active:'ADM', dPos:'below-right' }).concat([{ x:C.x, y:C.y, label:'C', labelPos:'below' }]);
      v.segments = amdFrame({ skip:['AD'] }).concat([
        { from:A, to:D, kind:adDone ? 'hyp' : 'slant', pulse:!adDone },
        { from:C, to:D, kind:'leg' },
        { from:A, to:C, kind:'leg' }
      ]);
      v.rightAngles = [{ at:C, ax:1, ay:1 }];
      v.legNums = [
        { x:mid(C, D).x, y:C.y - 0.7, text:'4' },
        { x:A.x - 0.6, y:mid(A, C).y, text:'3' }
      ];
      if (adDone){
        v.distLabels = [{ x:mid(A, D).x + 0.7, y:mid(A, D).y + 0.4, text:'5' }];
      } else {
        v.questionMarks = [{ x:mid(A, D).x + 0.5, y:mid(A, D).y + 0.3, pulse:true }];
      }
      return v;
    }

    // ---------- 10: DM drag tiles ----------
    if (screen === 10){
      var hLocked = app.drag.h != null;
      var vLocked = app.drag.v != null;
      var wrongDrop = app.drag.teeter != null;
      // D label below-left (clear of E); E label below-right; M label above-right
      v.points = corePoints({ active:'DM', dPos:'below-left', mPos:'right' })
        .concat([{ x:E.x, y:E.y, label:'E', labelPos:'below-right' }]);
      v.segments = amdFrame({ skip:['MD'] }).concat([
        { from:D, to:M, kind:'slant' },
        // horizontal leg D->E (=2): active (pulsing) while asked; flashes red on a wrong drag
        { from:D, to:E, kind:'leg', pulse:!hLocked && !wrongDrop, wrong:!hLocked && wrongDrop },
        // vertical leg E->M (=5): stays ghosted until the horizontal change is locked in, so only
        // one leg reads as "active" at a time — then it becomes the active/pulsing one
        { from:E, to:M, kind:'leg', ghost:!hLocked,
          pulse:hLocked && !vLocked && !wrongDrop, wrong:hLocked && !vLocked && wrongDrop }
      ]);
      // right angle only appears once both legs are solved — not while still guessing
      if (hLocked && vLocked){ v.rightAngles = [{ at:E, ax:-1, ay:1 }]; }
      if (hLocked) v.legNums = [{ x:mid(D, E).x, y:E.y - 0.6, text:'2' }];
      if (vLocked){
        v.legNums = (v.legNums || []).concat([{ x:E.x + 0.7, y:mid(E, M).y, text:'5' }]);
      }
      return v;
    }

    // ---------- 11: DM via Pythagoras (MCQ) ----------
    if (screen === 11){
      var dmDone = app.dm.result === 'correct';
      v.points = corePoints({ active:'DM', dPos:'below-left', mPos:'right' })
        .concat([{ x:E.x, y:E.y, label:'E', labelPos:'below-right' }]);
      v.segments = amdFrame({ skip:['MD'] }).concat([
        { from:D, to:M, kind:dmDone ? 'hyp' : 'slant', pulse:!dmDone },
        { from:D, to:E, kind:'leg' },
        { from:E, to:M, kind:'leg' }
      ]);
      v.rightAngles = [{ at:E, ax:-1, ay:1 }];
      v.legNums = [
        { x:mid(D, E).x, y:E.y - 0.6, text:'2' },           // "2" under the horizontal leg
        { x:E.x + 0.7, y:mid(E, M).y, text:'5' }            // "5" right of the vertical leg
      ];
      // distance label sits to the LEFT of the slant (toward A), away from the "5" leg number
      if (dmDone){
        v.distLabels = [{ x:mid(D, M).x - 0.9, y:mid(D, M).y, text:'√29' }];
      } else {
        v.questionMarks = [{ x:mid(D, M).x - 0.7, y:mid(D, M).y, pulse:true }];
      }
      return v;
    }

    // ---------- 12: MA via Pythagoras (MCQ) ----------
    // Storyboard pages 26-28: the "6"/"2" helper values and right-angle marker are NOT shown
    // up front — only the plain MA triangle with a ghost top/left frame. They appear (in red)
    // only once the learner picks wrong, or (in orange) once they pick correctly.
    if (screen === 12){
      var maResult = app.ma.result;             // null | 'incorrect' | 'correct'
      var maDone = maResult === 'correct';
      var maWrong = maResult === 'incorrect';
      var maRevealed = maDone || maWrong;
      // A label below-left, M label above-right so neither sits on the top horizontal leg
      v.points = corePoints({ active:'AM', aPos:'below-left', mPos:'right' });
      v.segments = amdFrame({ skip:['AM'] }).concat([
        { from:M, to:A, kind:maDone ? 'hyp' : 'slant', pulse:!maDone }
      ]);
      if (maRevealed){
        var legTone = maWrong ? 'wrong' : 'right';
        v.segments = v.segments.concat([
          { from:A, to:MA_CORNER, kind:'thin' },              // dashed vertical helper A->(3,6) = 2
          { from:MA_CORNER, to:M, kind:'thin' }               // dashed horizontal helper (3,6)->M = 6
        ]);
        v.rightAngles = [{ at:MA_CORNER, ax:1, ay:-1 }];
        v.legNums = [
          { x:mid(MA_CORNER, M).x, y:MA_CORNER.y + 0.6, text:'6', tone:legTone },
          { x:A.x - 0.7, y:mid(A, MA_CORNER).y, text:'2', tone:legTone }
        ];
        v.highlightNums = { x:[3, 9], y:[6], tone:legTone };
      }
      // distance label below the slant, clear of the "6"/"2" leg numbers
      if (maDone){
        v.distLabels = [{ x:mid(M, A).x + 0.4, y:mid(M, A).y - 0.5, text:'√40' }];
      } else {
        v.questionMarks = [{ x:mid(M, A).x + 0.4, y:mid(M, A).y - 0.5, pulse:true }];
      }
      return v;
    }

    // ---------- 13: generalize horizontal & vertical change (M ghost, ACD bright) ----------
    // both legs stay the same green used throughout screens 6-12 (no pink) for consistency.
    if (screen === 13){
      v.points = corePoints({ active:'AD', aPos:'above-left', dPos:'below-right' }).concat([{ x:C.x, y:C.y, label:'C', labelPos:'below' }]);
      v.triangleFill = [A, C, D];
      v.segments = amdFrame({ skip:['AD'] }).concat([
        { from:A, to:D, kind:'slant' },
        { from:C, to:D, kind:'leg' },
        { from:A, to:C, kind:'leg' }
      ]);
      v.rightAngles = [{ at:C, ax:1, ay:1 }];
      v.legTags = [
        { x:A.x - 1.4, y:mid(A, C).y, text:t('s29_vchange'), tone:'green' },
        { x:mid(C, D).x, y:C.y - 0.8, text:t('s29_hchange'), tone:'green' }
      ];
      v.legNums = [{ x:mid(A, D).x + 0.6, y:mid(A, D).y + 0.3, text:'5', slant:true }];
      return v;
    }

    // ---------- 14: two shorter sides ----------
    if (screen === 14){
      v.points = corePoints({ active:'AD', aPos:'above-left', dPos:'below-right' }).concat([{ x:C.x, y:C.y, label:'C', labelPos:'below' }]);
      v.triangleFill = [A, C, D];
      v.segments = amdFrame({ skip:['AD'] }).concat([
        { from:A, to:D, kind:'slant' },
        { from:C, to:D, kind:'leg', pulse:true },
        { from:A, to:C, kind:'leg', pulse:true }
      ]);
      v.rightAngles = [{ at:C, ax:1, ay:1 }];
      v.legTags = [
        { x:A.x - 1.4, y:mid(A, C).y, text:t('s29_vchange'), tone:'green' },
        { x:mid(C, D).x, y:C.y - 0.8, text:t('s29_hchange'), tone:'green' }
      ];
      v.legNums = [{ x:mid(A, D).x + 0.6, y:mid(A, D).y + 0.3, text:'5', slant:true }];
      return v;
    }

    // ---------- 15: distance formula ----------
    // both legs green (matches 13/14 — no pink), tags use the same properly-spaced strings,
    // and a KaTeX-rendered formula tag sits near AD once the reveal reaches the hypotenuse
    // (storyboard page 31: "√(x₂-x₁)² + (y₂-y₁)² = 5").
    if (screen === 15){
      v.points = corePoints({ active:'AD', aPos:'above-left', dPos:'below-right' }).concat([{ x:C.x, y:C.y, label:'C', labelPos:'below' }]);
      v.triangleFill = [A, C, D];
      v.segments = amdFrame({ skip:['AD'] }).concat([
        { from:A, to:D, kind:'hyp', pulse:revealStage >= 3 },
        { from:C, to:D, kind:'leg', pulse:revealStage >= 1 },
        { from:A, to:C, kind:'leg', pulse:revealStage >= 2 }
      ]);
      v.rightAngles = [{ at:C, ax:1, ay:1 }];
      v.legTags = [
        { x:A.x - 1.4, y:mid(A, C).y, text:t('s29_vchange'), tone:'green' },
        { x:mid(C, D).x, y:C.y - 0.8, text:t('s29_hchange'), tone:'green' }
      ];
      if (revealStage >= 3){
        v.mathTags = [{ x:mid(A, D).x + 1.6, y:mid(A, D).y + 0.6, text:'√((x₂-x₁)² + (y₂-y₁)²) = 5', width:260 }];
      }
      return v;
    }

    // ---------- 16: free exploration — symmetric 4-quadrant grid ----------
    // The distance breakdown (formula -> substituted -> simplified -> answer) is shown in the
    // right column (see deriveRightCol) rather than as a label over the line on the graph, since
    // the on-graph label had nowhere to sit without overlapping the points/line for short segments.
    if (screen === 16){
      v.grid = 'explore';
      var p1 = app.explore.p1, p2 = app.explore.p2;
      v.points = [];
      v.segments = [];
      if (!(p1 && p2)) v.tapHotspots = true;
      if (p1){
        v.points.push({ x:p1.x, y:p1.y, label:ptLabel(p1, 'P'), labelPos:'left' });
      }
      if (p2){
        v.points.push({ x:p2.x, y:p2.y, label:ptLabel(p2, 'Q'), labelPos:'right' });
        v.segments.push({ from:p1, to:p2, kind:'slant', pulse:exploreReveal < 3 });
      }
      return v;
    }

    return v;
  }

  // ======================================================================
  // right column (MCQ / drag panel / formula panels)
  // ======================================================================
  function deriveRightCol(screen, app, t, exploreReveal, on){
    // 3 / 4: distance read-out card beside the sample line
    if (screen === 3){
      return h('div', { className:'dist-card' },
        t('s3_dist_label'),
        h('span', { className:'dist-card-calc' }, t('s3_calc'))
      );
    }
    if (screen === 4){
      return h('div', { className:'dist-card' },
        t('s5_dist_label'),
        h('span', { className:'dist-card-calc' }, t('s5_calc'))
      );
    }
    if (screen === 6){
      return h(window.McqPanel, {
        question: t('s8_question'),
        options: [{ label:'3 units', value:3 }, { label:'4 units', value:4 }],
        chosen: app.hChange.chosen, result: app.hChange.result, correctValue: 4,
        onPick: on.onMcqH
      });
    }
    if (screen === 7){
      return h(window.McqPanel, {
        question: t('s11_question'),
        options: [{ label:'3 units', value:3 }, { label:'4 units', value:4 }],
        chosen: app.vChange.chosen, result: app.vChange.result, correctValue: 3,
        onPick: on.onMcqV
      });
    }
    if (screen === 9){
      return h(window.McqPanel, {
        question: t('s15_question'),
        options: [{ label:'6 units', value:'6' }, { label:'5 units', value:'5' }],
        chosen: app.ad.chosen, result: app.ad.result, correctValue: '5',
        correctFeedback: t('s15_correct'), wrongFeedback: t('s15_wrong'),
        onPick: on.onMcqAD
      });
    }
    if (screen === 10){
      var hLocked = app.drag.h != null;
      var instr = hLocked ? t('s18_cta_v') : t('s18_cta_h');
      return h(window.DragTilePanel, {
        tiles: [{ value:2, label:'2' }, { value:5, label:'5' }],
        hFilled: app.drag.h, vFilled: app.drag.v,
        hLabel: t('s18_slot_h'), vLabel: t('s18_slot_v'),
        activeSlot: hLocked ? 'v' : 'h',
        teeterTile: app.drag.teeter,
        instruction: instr,
        onDrop: on.onDropTile
      });
    }
    if (screen === 11){
      return h(window.McqPanel, {
        question: t('s23_question'),
        options: [{ label:'√29 units', value:'sqrt29' }, { label:'9 units', value:'9' }],
        chosen: app.dm.chosen, result: app.dm.result, correctValue: 'sqrt29',
        correctFeedback: t('s23_correct'), wrongFeedback: t('s23_wrong'),
        onPick: on.onMcqDM
      });
    }
    if (screen === 12){
      return h(window.McqPanel, {
        question: t('s26_question'),
        options: [{ label:'4 units', value:'4' }, { label:'√40 units', value:'sqrt40' }],
        chosen: app.ma.chosen, result: app.ma.result, correctValue: 'sqrt40',
        correctFeedback: t('s26_correct'), wrongFeedback: t('s26_wrong'),
        onPick: on.onMcqMA
      });
    }
    if (screen === 13){
      return h('div', { className:'formula-panel' },
        h('div', { className:'formula-note' }, t('s29_note')),
        h('div', { className:'formula-card formula-card--hchange' },
          h('span', { className:'formula-title' }, t('s29_hchange_title')),
          h('span', { className:'formula-eq' }, t('s29_hchange'))
        ),
        h('div', { className:'formula-card formula-card--vchange' },
          h('span', { className:'formula-title' }, t('s29_vchange_title')),
          h('span', { className:'formula-eq' }, t('s29_vchange'))
        )
      );
    }
    if (screen === 15){
      return h('div', { className:'formula-panel' },
        h('div', { className:'formula-note' }, t('s31_note')),
        h('div', { className:'formula-card' },
          t('s31_formula_intro'),
          h('span', { className:'formula-eq math-line', html: window.renderMathExpression ? window.renderMathExpression(t('s31_formula')) : t('s31_formula') })
        )
      );
    }
    // screen 16 (free exploration): once both points are chosen, step through the same
    // formula -> substituted -> simplified -> answer chain as the storyboard (page 33), each
    // line rendered through KaTeX so the radicals get a proper vinculum bar.
    if (screen === 16 && app.explore.p1 && app.explore.p2){
      var d = distanceText(app.explore.p1, app.explore.p2);
      var mathLine = function(text, cls){
        return h('span', {
          className:(cls || 'formula-eq') + ' math-line',
          html: window.renderMathExpression ? window.renderMathExpression(text) : text
        });
      };
      var rows = [h('span', { className:'explore-eq-label' }, 'PQ ='), mathLine(d.formula)];
      if (exploreReveal >= 1) rows.push(h('span', { className:'explore-eq-label' }, '='), mathLine(d.substituted));
      if (exploreReveal >= 2) rows.push(h('span', { className:'explore-eq-label' }, '='), mathLine(d.simplified));
      if (exploreReveal >= 3) rows.push(h('span', { className:'explore-eq-label' }, '='), mathLine(d.answer, 'formula-eq formula-eq--answer'));
      return h('div', { className:'formula-panel' },
        h('div', { className:'formula-card explore-formula-card' }, rows)
      );
    }
    return null;
  }

  // ======================================================================
  // footer (Next / sample-line buttons / Explore again + instruction text)
  // ======================================================================
  function deriveFooter(screen, app, t, tBtn, calcSwapped, on){
    var els = [];

    // screens 2-4: Horizontal / Vertical sample-line buttons. Once opened, a button greys out
    // (--active) and stops responding to further taps. Tapping a button jumps straight into
    // that line's reveal screen (see onSelectLine), so the buttons stay visible and live
    // throughout 2-4 until both lines have been opened.
    if (screen >= 2 && screen <= 4){
      var hOn = app.lineMode.horizontal;
      var vOn = app.lineMode.vertical;
      var handOnH = screen === 2 && !hOn;
      var handOnV = screen === 2 && hOn && !vOn;
      els.push(h('div', { className:'line-btn-group' },
        h('div', { className:'line-btn-wrap' },
          h('button', {
            className:'line-btn' + (hOn ? ' line-btn--active' : ''),
            disabled: hOn,
            onClick: hOn ? undefined : function(){ on.onSelectLine('horizontal'); }
          }, tBtn('horizontal_line')),
          handOnH ? h(window.HandPointer, {}) : null
        ),
        h('div', { className:'line-btn-wrap' },
          h('button', {
            className:'line-btn' + (vOn ? ' line-btn--active' : ''),
            disabled: vOn,
            onClick: vOn ? undefined : function(){ on.onSelectLine('vertical'); }
          }, tBtn('vertical_line')),
          handOnV ? h(window.HandPointer, {}) : null
        )
      ));
    }

    var instr = footerInstruction(screen, app, t);
    if (instr) els.push(h('div', { className:'screen-instruction' }, instr));

    // Explore again on the exploration screen
    if (screen === 16){
      els.push(h('button', { className:'explore-again', onClick: on.onExploreAgain }, tBtn('explore_again')));
    }

    // Next when allowed (not on the terminal/explore screen, and not on screens 2-4 which
    // navigate themselves — tapping a sample-line button jumps screens, and once both lines
    // have been opened screens 3/4 auto-advance onward — see the effects in AppletContainer).
    // Screens 6/7 additionally wait for calcSwapped: canAdvance flips true the instant the MCQ
    // is answered correctly, but Next shouldn't appear until the "7 - 3" -> "4" swap animation
    // has actually finished playing.
    var isSelfNavigating = screen >= 2 && screen <= 4;
    var waitingOnSwap = (screen === 6 || screen === 7) && !calcSwapped;
    var showNext = app.canAdvance && screen !== 16 && !isSelfNavigating && !waitingOnSwap;
    if (showNext){
      els.push(h('button', { className:'next-btn', onClick: on.onNext }, tBtn('next')));
    }

    return els;
  }

  function footerInstruction(screen, app, t){
    if (screen === 1) return t('s1_cta');
    if (screen === 5) return t('s7_cta');
    if (screen === 9 && app.ad.result === 'correct') return t('s15_cta');
    if (screen === 11 && app.dm.result === 'correct') return t('s23_cta');
    if (screen === 16){
      if (!app.explore.p1) return t('s32_cta_p1');
      if (!app.explore.p2) return t('s32_cta_p2');
      return '';
    }
    return '';
  }

  // ======================================================================
  // exploration distance text
  // ======================================================================
  // signed value formatted for substitution into "(a - b)": negatives get parens, e.g. "(-8)"
  function signedTerm(n){ return n < 0 ? '(' + n + ')' : String(n); }

  function distanceText(p1, p2){
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    var sum = dx * dx + dy * dy;
    var r = Math.sqrt(sum);
    var label = Number.isInteger(r) ? (r + ' units') : ('√' + sum + ' units');
    // the 4-line substitution chain shown on screen 16 (storyboard page 33):
    //   PQ = √((x₂-x₁)² + (y₂-y₁)²)
    //      = √((qx - px))² + (qy - py)²)
    //      = √(dx)² + (dy)²
    //      = √sum = r units
    var formula = '√((x₂-x₁)² + (y₂-y₁)²)';
    var substituted = '√((' + signedTerm(p2.x) + ' - ' + signedTerm(p1.x) + ')² + (' +
      signedTerm(p2.y) + ' - ' + signedTerm(p1.y) + ')²)';
    var simplified = '√((' + dx + ')² + (' + dy + ')²)';
    var answer = '√' + sum + ' = ' + label;
    return { dx:dx, dy:dy, sum:sum, label:label, formula:formula, substituted:substituted, simplified:simplified, answer:answer };
  }

  window.AppletContainer = AppletContainer;
})();
