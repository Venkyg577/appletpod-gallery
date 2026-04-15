// Minimal React-like runtime: h(), render(), useState(), useEffect() (global UMD)
function h(type, props, ...children){
  return { type, props: props || {}, children: children.flat() };
}

let currentComponent = null;
function useState(initial){
  const comp = currentComponent;
  if (!comp) { // fallback when used outside component (non-reactive)
    let value = typeof initial === 'function' ? initial() : initial;
    const setValue = (v)=>{ value = typeof v === 'function' ? v(value) : v; };
    return [value, setValue];
  }
  const i = comp.hookIndex++;
  if (comp.hooks[i] === undefined) comp.hooks[i] = typeof initial === 'function' ? initial() : initial;
  const setState = (v)=>{ comp.hooks[i] = typeof v === 'function' ? v(comp.hooks[i]) : v; rerender(comp); };
  return [comp.hooks[i], setState];
}

function useEffect(effect, deps){
  const comp = currentComponent;
  if (!comp) { effect && effect(); return; }
  const i = comp.hookIndex++;
  const prev = comp.hooks[i];
  const changed = !prev || !deps || deps.some((d, idx)=>d !== prev.deps[idx]);
  if (changed){
    comp.pendingEffects.push(()=>{
      if (prev && prev.cleanup) prev.cleanup();
      const cleanup = effect();
      comp.hooks[i] = { deps, cleanup };
    });
  }
}

function createDom(node, ns){
  if (node == null || node === false) return document.createTextNode('');
  if (typeof node !== 'object') return document.createTextNode(String(node));
  if (typeof node.type === 'function') return mountComponent(node.type, node.props);
  const isSvg = ns || node.type === 'svg';
  const namespace = isSvg ? (ns || 'http://www.w3.org/2000/svg') : null;
  const el = isSvg ? document.createElementNS(namespace, node.type) : document.createElement(node.type);
  setProps(el, node.props);
  const childNs = isSvg ? namespace : undefined;
  (node.children || []).forEach(c=>el.appendChild(createDom(c, childNs)));
  return el;
}

function setProps(el, props={}){
  Object.entries(props).forEach(([k,v])=>{
    if (k === 'key') return;
    if (k === 'className') el.setAttribute('class', v);
    else if (k === 'ref' && typeof v === 'function') {
      v(el);
    }
    else if (k.startsWith('on') && typeof v === 'function') {
      const eventName = k.slice(2).toLowerCase();
      el.addEventListener(eventName, v);
    }
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'role' || k === 'tabIndex' || k === 'aria-hidden' || k === 'preserveAspectRatio') {
      el.setAttribute(k.toLowerCase(), v);
    }
    // Boolean DOM properties: setAttribute('disabled','false') still disables — must use property/removeAttribute.
    else if (k === 'disabled' || k === 'checked' || k === 'selected') {
      el[k] = !!v;
      if (v) el.setAttribute(k, '');
      else el.removeAttribute(k);
    }
    else if (v != null && k !== 'children') el.setAttribute(k, v);
  });
}

function mountComponent(fn, props){
  const comp = { fn, props, hooks: [], hookIndex: 0, dom: null, container: null, pendingEffects: [] };
  const prev = currentComponent; currentComponent = comp;
  const vnode = fn(props);
  currentComponent = prev;
  const dom = createDom(vnode);
  comp.dom = dom; dom.__component = comp;
  queueMicrotask(()=>{ comp.pendingEffects.splice(0).forEach(f=>f()); });
  return dom;
}

function rerender(comp){
  if (!comp.dom || !comp.dom.parentNode) return;
  const container = comp.dom.parentNode;

  comp.hookIndex = 0;
  comp.pendingEffects = [];

  const prevComponent = currentComponent;
  currentComponent = comp;
  const vnode = comp.fn(comp.props);
  currentComponent = prevComponent;

  const newDom = createDom(vnode);
  container.replaceChild(newDom, comp.dom);
  comp.dom = newDom;
  newDom.__component = comp;

  queueMicrotask(()=>{ comp.pendingEffects.splice(0).forEach(f=>f()); });
}

function render(vnode, container){
  container.innerHTML = '';
  container.appendChild(createDom(vnode));
}

window.MiniReact = { h, render, useState, useEffect };
