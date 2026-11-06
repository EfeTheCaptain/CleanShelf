(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function svgEl(attrs, children) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    for (const k in attrs) svg.setAttribute(k, attrs[k]);
    for (const c of children || []) svg.appendChild(c);
    return svg;
  }

  function ns(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }

  function makeFolderIcon() {
    const path = ns("path");
    path.setAttribute("d", "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z");
    return svgEl({
      viewBox: "0 0 24 24", width: "32", height: "32",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round",
      "class": "cs-folder-icon",
    }, [path]);
  }

  function makeGearIcon() {
    const circle = ns("circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "3");
    const path = ns("path");
    path.setAttribute("d", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z");
    return svgEl({
      viewBox: "0 0 24 24", width: "16", height: "16",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round",
    }, [circle, path]);
  }

  function makeDraftIcons() {
    const dot = ns("circle");
    dot.setAttribute("cx", "6");
    dot.setAttribute("cy", "6");
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", "currentColor");
    const dotIcon = svgEl({
      viewBox: "0 0 12 12", width: "12", height: "12",
      "class": "cs-draft-icon cs-draft-icon-dot",
    }, [dot]);

    const checkPath = ns("path");
    checkPath.setAttribute("d", "M2 6.5l2.5 2.5L10 3");
    const checkIcon = svgEl({
      viewBox: "0 0 12 12", width: "12", height: "12",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round",
      "class": "cs-draft-icon cs-draft-icon-check",
    }, [checkPath]);

    const errPath = ns("path");
    errPath.setAttribute("d", "M6 2v4.5");
    const errDot = ns("circle");
    errDot.setAttribute("cx", "6");
    errDot.setAttribute("cy", "9");
    errDot.setAttribute("r", "0.9");
    errDot.setAttribute("fill", "currentColor");
    const errIcon = svgEl({
      viewBox: "0 0 12 12", width: "12", height: "12",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round",
      "class": "cs-draft-icon cs-draft-icon-error",
    }, [errPath, errDot]);

    return { dotIcon, checkIcon, errIcon };
  }

  CS.dom = { el, svgEl, makeFolderIcon, makeGearIcon, makeDraftIcons };
})();