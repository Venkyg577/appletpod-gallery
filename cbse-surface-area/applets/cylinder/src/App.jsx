import React, { useEffect, useMemo, useState } from "react";
import { appData } from "../data.js";
import { useScaleFactor, updateScaleFactor } from "./hooks/useScaleFactor.js";
import { playTap, playChime } from "./utils/audio.js";
import { ShapeSelector } from "./components/ShapeSelector.jsx";
import { NextRail } from "./components/NextRail.jsx";
import { CylinderStyledDiagram } from "./components/CylinderStyledDiagram.jsx";
import { CylinderRectStep } from "./components/CylinderRectStep.jsx";
import { CylinderNetStep } from "./components/CylinderNetStep.jsx";
import { CylinderRevealSummary, CylinderSideArt } from "./components/CylinderRevealSummary.jsx";
import { CylinderFormulaBoard } from "./components/CylinderFormulaBoard.jsx";
import { SummaryScreen } from "./components/SummaryScreen.jsx";

const SCREENS = /** @type {const} */ ({
  SELECT: "SELECT",
  CYL_INTRO: "CYL_INTRO",
  CYL_TOP: "CYL_TOP",
  CYL_BOTTOM: "CYL_BOTTOM",
  CYL_CURVED: "CYL_CURVED",
  CYL_RECT: "CYL_RECT",
  CYL_ROLL: "CYL_ROLL",
  CYL_2PI: "CYL_2PI",
  CYL_COMBO: "CYL_COMBO",
  CYL_FORMULA: "CYL_FORMULA",
  SUMMARY: "SUMMARY",
});

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function App() {
  useScaleFactor();
  const locale = "en";
  const [screen, setScreen] = useState(SCREENS.SELECT);
  const [topRollProgress, setTopRollProgress] = useState(0);
  const [bottomRollProgress, setBottomRollProgress] = useState(0);
  const [activeRollTarget, setActiveRollTarget] = useState(null);
  const [cylFormulaStep, setCylFormulaStep] = useState(0);

  const su = useMemo(() => appData[locale]["standard-ui"], [locale]);
  const screens = useMemo(() => appData[locale]["content-ui"].screens, [locale]);

  const headerTitle = useMemo(() => {
    switch (screen) {
      case SCREENS.SELECT:
        return screens.select.title;
      case SCREENS.CYL_INTRO:
        return screens.cyl_intro.title;
      case SCREENS.CYL_TOP:
        return screens.cyl_two_bases_top.title;
      case SCREENS.CYL_BOTTOM:
        return screens.cyl_two_bases_bottom.title;
      case SCREENS.CYL_CURVED:
        return screens.cyl_curved.title;
      case SCREENS.CYL_RECT:
        return screens.cyl_rectangle.title;
      case SCREENS.CYL_ROLL:
        return screens.cyl_roll.title;
      case SCREENS.CYL_2PI:
        return screens.cyl_2pi.title;
      case SCREENS.CYL_COMBO:
        return screens.cyl_combo.title;
      case SCREENS.CYL_FORMULA:
        return screens.cyl_formula_opening.title;
      case SCREENS.SUMMARY:
        return screens.summary.title;
      default:
        return "";
    }
  }, [screen, screens]);

  const bumpTap = () => {
    playTap();
  };

  const onSelectCylinder = () => {
    bumpTap();
    setScreen(SCREENS.CYL_INTRO);
  };

  const railNext = () => {
    bumpTap();
    if (screen === SCREENS.CYL_INTRO) setScreen(SCREENS.CYL_TOP);
    else if (screen === SCREENS.CYL_RECT) setScreen(SCREENS.CYL_ROLL);
    else if (screen === SCREENS.CYL_ROLL) setScreen(SCREENS.CYL_2PI);
    else if (screen === SCREENS.CYL_2PI) setScreen(SCREENS.CYL_COMBO);
    else if (screen === SCREENS.CYL_COMBO) {
      setCylFormulaStep(0);
      setScreen(SCREENS.CYL_FORMULA);
    } else if (screen === SCREENS.CYL_FORMULA) {
      if (cylFormulaStep < 6) setCylFormulaStep((s) => s + 1);
      else setScreen(SCREENS.SUMMARY);
    }
  };

  const railDisabled = () => {
    if (screen === SCREENS.CYL_ROLL && (topRollProgress < 1 || bottomRollProgress < 1)) return true;
    if (screen === SCREENS.CYL_FORMULA && cylFormulaStep < 6) return true;
    if (screen === SCREENS.SELECT) return true;
    return false;
  };

  const railPulse = () => {
    if (screen === SCREENS.CYL_INTRO) return true;
    if (screen === SCREENS.CYL_RECT) return true;
    if (screen === SCREENS.CYL_ROLL && topRollProgress >= 1 && bottomRollProgress >= 1) return true;
    if (screen === SCREENS.CYL_2PI) return true;
    if (screen === SCREENS.CYL_COMBO) return true;
    if (screen === SCREENS.CYL_FORMULA && cylFormulaStep >= 6) return true;
    return false;
  };

  const railHint = () => {
    if (screen === SCREENS.CYL_INTRO) return su.labels.to_explore_cylinder;
    if (screen === SCREENS.CYL_RECT) return su.labels.to_continue;
    if (screen === SCREENS.CYL_ROLL && (topRollProgress < 1 || bottomRollProgress < 1)) return "";
    if (screen === SCREENS.CYL_ROLL && topRollProgress >= 1 && bottomRollProgress >= 1) return su.labels.to_continue;
    if (screen === SCREENS.CYL_2PI || screen === SCREENS.CYL_COMBO) return su.labels.to_understand_surface_area;
    if (screen === SCREENS.CYL_FORMULA && cylFormulaStep >= 6) return su.labels.to_understand_next_solid;
    return "";
  };

  const callout = () => {
    if (screen === SCREENS.CYL_INTRO) return screens.cyl_intro.callout;
    return null;
  };

  const hint = () => {
    if (screen === SCREENS.CYL_TOP) return screens.cyl_two_bases_top.hint_top;
    if (screen === SCREENS.CYL_BOTTOM) return screens.cyl_two_bases_bottom.hint_bottom;
    if (screen === SCREENS.CYL_CURVED) return screens.cyl_curved.hint_curved;
    if (screen === SCREENS.CYL_ROLL) return screens.cyl_roll.hint_roll;
    return null;
  };

  const showRail =
    screen === SCREENS.CYL_INTRO ||
    screen === SCREENS.CYL_RECT ||
    screen === SCREENS.CYL_ROLL ||
    screen === SCREENS.CYL_2PI ||
    screen === SCREENS.CYL_COMBO ||
    screen === SCREENS.CYL_FORMULA;

  const diagram = () => {
    if (screen === SCREENS.CYL_INTRO) {
      return <CylinderStyledDiagram step={0} pulseTarget={null} />;
    }
    if (screen === SCREENS.CYL_TOP || screen === SCREENS.CYL_BOTTOM || screen === SCREENS.CYL_CURVED) {
      const step = screen === SCREENS.CYL_TOP ? 0 : screen === SCREENS.CYL_BOTTOM ? 1 : 2;
      const pulse = screen === SCREENS.CYL_TOP ? "top" : screen === SCREENS.CYL_BOTTOM ? "bottom" : "curved";
      return (
        <CylinderStyledDiagram
          step={step}
          pulseTarget={pulse}
          onTopTap={screen === SCREENS.CYL_TOP ? () => { bumpTap(); setScreen(SCREENS.CYL_BOTTOM); } : undefined}
          onBottomTap={screen === SCREENS.CYL_BOTTOM ? () => { bumpTap(); setScreen(SCREENS.CYL_CURVED); } : undefined}
          onCurvedTap={screen === SCREENS.CYL_CURVED ? () => { bumpTap(); setScreen(SCREENS.CYL_RECT); } : undefined}
        />
      );
    }
    if (screen === SCREENS.CYL_RECT) {
      return <CylinderRectStep key="cyl-rect" />;
    }
    if (screen === SCREENS.CYL_ROLL) {
      const rollTarget = topRollProgress < 1 ? "top" : bottomRollProgress < 1 ? "bottom" : null;
      const startRoll = (target) => {
        if (!target || activeRollTarget) return;
        if (target === "top" && topRollProgress > 0) return;
        if (target === "bottom" && (topRollProgress < 1 || bottomRollProgress > 0)) return;
        bumpTap();
        playChime();
        setActiveRollTarget(target);
        const start = Date.now();
        const ROLL_DUR = 1100;
        const tick = () => {
          const p = Math.min((Date.now() - start) / ROLL_DUR, 1);
          const eased = easeInOut(p);
          if (target === "top") setTopRollProgress(eased);
          else setBottomRollProgress(eased);
          if (p < 1) {
            requestAnimationFrame(tick);
          } else {
            setActiveRollTarget(null);
          }
        };
        requestAnimationFrame(tick);
      };

      return (
        <CylinderNetStep
          topRollProgress={topRollProgress}
          bottomRollProgress={bottomRollProgress}
          activeTarget={activeRollTarget || rollTarget}
          showLabel={topRollProgress >= 1 && bottomRollProgress >= 1}
          onRollTap={startRoll}
        />
      );
    }
    if (screen === SCREENS.CYL_2PI || screen === SCREENS.CYL_COMBO) {
      if (screen === SCREENS.CYL_COMBO) return <CylinderRevealSummary />;
      return <CylinderNetStep topRollProgress={1} bottomRollProgress={1} showLabel={true} />;
    }
    return null;
  };

  const centerBody = () => {
    if (screen === SCREENS.SELECT) {
      return (
        <ShapeSelector
          titles={{ cylinder: screens.select.cylinder }}
          only="cylinder"
          pulseCylinder
          onCylinder={onSelectCylinder}
        />
      );
    }
    if (screen === SCREENS.CYL_FORMULA) {
      return (
        <div className="formula-split-layout">
          <div className="formula-split-left">
            <CylinderSideArt />
          </div>
          <div className="formula-split-right">
            <CylinderFormulaBoard
              step={cylFormulaStep}
              onAdvance={() => setCylFormulaStep((s) => Math.min(6, s + 1))}
              copy={screens.cyl_formula}
            />
          </div>
        </div>
      );
    }
    if (screen === SCREENS.SUMMARY) {
      return <SummaryScreen copy={screens.summary} only="cylinder" />;
    }
    return diagram();
  };

  useEffect(() => {
    updateScaleFactor();
  }, [screen]);

  useEffect(() => {
    if (screen === SCREENS.CYL_ROLL) {
      setTopRollProgress(0);
      setBottomRollProgress(0);
      setActiveRollTarget(null);
    }
  }, [screen]);

  const footerHint = () => {
    if (hint()) return hint();
    if (screen === SCREENS.CYL_ROLL && topRollProgress >= 1 && bottomRollProgress >= 1) return su.instructions.tap_highlighted;
    return railHint();
  };

  return (
    <div className="responsive-container">
      <div className="responsive-wrapper">
        <div className="applet-root">
          <header className="applet-header">
            <span>{headerTitle}</span>
          </header>

          <div className="applet-body">
            <main className="stage-panel">
              <div className="diagram-wrap">{centerBody()}</div>
              {callout() ? (
                <div className="callout" role="note">
                  <span>{callout()}</span>
                </div>
              ) : null}
            </main>
          </div>

          <footer className="applet-footer">
            <div className="footer-hint">
              {footerHint() ? <span>{footerHint()}</span> : null}
            </div>
            <div className="footer-nav">
              {showRail ? (
                <NextRail
                  disabled={railDisabled()}
                  pulse={railPulse()}
                  onClick={railNext}
                  nextLabel={su.buttons.next}
                />
              ) : <div className="footer-nav-placeholder" />}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
