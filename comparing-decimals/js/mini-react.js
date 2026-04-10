// Reuse mini-react implementation from reference applet

/* eslint-disable no-undef */

function createElement(type, props, ...children) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svgTags = new Set([
    'svg',
    'g',
    'defs',
    'clipPath',
    'mask',
    'pattern',
    'marker',
    'symbol',
    'use',
    'foreignObject',
    'line',
    'circle',
    'ellipse',
    'polygon',
    'polyline',
    'path',
    'rect',
    'text',
  ]);
  const isSvg = svgTags.has(type);
  const element = isSvg
    ? document.createElementNS(SVG_NS, type)
    : document.createElement(type);

  if (props) {
    Object.keys(props).forEach((key) => {
      if (key === 'className') {
        if (isSvg) {
          element.setAttribute('class', props[key]);
        } else {
          element.className = props[key];
        }
      } else if (key === 'style' && typeof props[key] === 'object') {
        Object.assign(element.style, props[key]);
      } else if (key.startsWith('on') && typeof props[key] === 'function') {
        const eventType = key.slice(2).toLowerCase();
        element.addEventListener(eventType, props[key]);
      } else if (key === 'key') {
        return;
      } else if (key === 'dangerouslySetInnerHTML') {
        if (props[key] && props[key].__html) {
          element.innerHTML = props[key].__html;
        }
      } else {
        let attrName = key;
        if (isSvg) {
          const preserve = new Set(['viewBox', 'preserveAspectRatio', 'xlink:href']);
          if (!preserve.has(attrName)) {
            attrName = attrName.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
          }
        }
        if (key === 'disabled') {
          if (props[key]) {
            element.setAttribute(attrName, '');
          } else {
            element.removeAttribute(attrName);
          }
        } else {
          element.setAttribute(attrName, props[key]);
        }
      }
    });
  }

  if (!props || !props.dangerouslySetInnerHTML) {
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement || (child && child.nodeType === 1)) {
        element.appendChild(child);
      } else if (Array.isArray(child)) {
        child.forEach((c) => {
          if (typeof c === 'string' || typeof c === 'number') {
            element.appendChild(document.createTextNode(c));
          } else if (c instanceof HTMLElement || (c && c.nodeType === 1)) {
            element.appendChild(c);
          }
        });
      }
    });
  }

  return element;
}

function render(element, container) {
  if (typeof element === 'function') {
    const componentElement = element();
    if (componentElement && (componentElement instanceof HTMLElement || componentElement.nodeType === 1)) {
      container.appendChild(componentElement);
    }
  } else if (element && (element instanceof HTMLElement || element.nodeType === 1)) {
    container.appendChild(element);
  }
}

window.React = {
  createElement,
  render,
};

window.createElement = createElement;
