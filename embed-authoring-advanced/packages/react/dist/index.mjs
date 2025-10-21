import { jsx as u } from "react/jsx-runtime";
import { useRef as r, useEffect as s } from "react";
function g(e) {
  const d = r(null);
  function m() {
    const a = e.host || "https://app.documenso.com", n = btoa(
      encodeURIComponent(
        JSON.stringify({
          name: e.name,
          lockName: e.lockName,
          email: e.email,
          lockEmail: e.lockEmail,
          css: e.css,
          cssVars: e.cssVars,
          darkModeDisabled: e.darkModeDisabled,
          ...e.additionalProps
        })
      )
    ), t = new URL(`/embed/direct/${e.token}`, a);
    return e.externalId && t.searchParams.set("externalId", e.externalId), `${t}#${n}`;
  }
  function c(a) {
    var n, t, i, o, l, f;
    if (((n = d.current) == null ? void 0 : n.contentWindow) === a.source)
      switch (a.data.action) {
        case "document-ready":
          (t = e.onDocumentReady) == null || t.call(e);
          break;
        case "document-completed":
          (i = e.onDocumentCompleted) == null || i.call(e, a.data.data);
          break;
        case "document-error":
          (o = e.onDocumentError) == null || o.call(e, a.data.data);
          break;
        case "field-signed":
          (l = e.onFieldSigned) == null || l.call(e);
          break;
        case "field-unsigned":
          (f = e.onFieldUnsigned) == null || f.call(e);
          break;
      }
  }
  return s(() => {
    window.addEventListener("message", c);
  }, []), s(() => () => {
    window.removeEventListener("message", c);
  }, []), /* @__PURE__ */ u("iframe", { ref: d, className: e.className, src: m() });
}
function w(e) {
  const d = r(null);
  function m() {
    const a = e.host || "https://app.documenso.com", n = btoa(
      encodeURIComponent(
        JSON.stringify({
          name: e.name,
          lockName: e.lockName,
          css: e.css,
          cssVars: e.cssVars,
          darkModeDisabled: e.darkModeDisabled,
          allowDocumentRejection: e.allowDocumentRejection,
          ...e.additionalProps
        })
      )
    );
    return `${new URL(`/embed/sign/${e.token}`, a)}#${n}`;
  }
  function c(a) {
    var n, t, i, o, l;
    if (((n = d.current) == null ? void 0 : n.contentWindow) === a.source)
      switch (a.data.action) {
        case "document-ready":
          (t = e.onDocumentReady) == null || t.call(e);
          break;
        case "document-completed":
          (i = e.onDocumentCompleted) == null || i.call(e, a.data.data);
          break;
        case "document-error":
          (o = e.onDocumentError) == null || o.call(e, a.data.data);
          break;
        case "document-rejected":
          (l = e.onDocumentRejected) == null || l.call(e, a.data.data);
          break;
      }
  }
  return s(() => {
    window.addEventListener("message", c);
  }, []), s(() => () => {
    window.removeEventListener("message", c);
  }, []), /* @__PURE__ */ u("iframe", { ref: d, className: e.className, src: m() });
}
function h(e) {
  const d = r(null);
  function m() {
    const a = e.host || "https://app.documenso.com", n = btoa(
      encodeURIComponent(
        JSON.stringify({
          token: e.presignToken,
          externalId: e.externalId,
          features: e.features,
          css: e.css,
          cssVars: e.cssVars,
          darkModeDisabled: e.darkModeDisabled,
          ...e.additionalProps
        })
      )
    ), t = new URL("/embed/v1/authoring/document/create", a);
    return t.searchParams.set("token", e.presignToken), t.hash = n, t.toString();
  }
  function c(a) {
    var n, t;
    if (((n = d.current) == null ? void 0 : n.contentWindow) === a.source)
      switch (a.data.type) {
        case "document-created":
          (t = e.onDocumentCreated) == null || t.call(e, {
            documentId: a.data.documentId,
            externalId: a.data.externalId
          });
          break;
      }
  }
  return s(() => {
    window.addEventListener("message", c);
  }, []), s(() => () => {
    window.removeEventListener("message", c);
  }, []), /* @__PURE__ */ u("iframe", { ref: d, className: e.className, src: m() });
}
function D(e) {
  const d = r(null);
  function m() {
    const a = e.host || "https://app.documenso.com", n = btoa(
      encodeURIComponent(
        JSON.stringify({
          token: e.presignToken,
          externalId: e.externalId,
          features: e.features,
          css: e.css,
          cssVars: e.cssVars,
          darkModeDisabled: e.darkModeDisabled,
          ...e.additionalProps
        })
      )
    ), t = new URL("/embed/v1/authoring/template/create", a);
    return t.searchParams.set("token", e.presignToken), t.hash = n, t.toString();
  }
  function c(a) {
    var n, t;
    if (((n = d.current) == null ? void 0 : n.contentWindow) === a.source)
      switch (a.data.type) {
        case "template-created":
          (t = e.onTemplateCreated) == null || t.call(e, {
            templateId: a.data.templateId,
            externalId: a.data.externalId
          });
          break;
      }
  }
  return s(() => {
    window.addEventListener("message", c);
  }, []), s(() => () => {
    window.removeEventListener("message", c);
  }, []), /* @__PURE__ */ u("iframe", { ref: d, className: e.className, src: m() });
}
function I(e) {
  const d = r(null);
  function m() {
    const a = e.host || "https://app.documenso.com", n = btoa(
      encodeURIComponent(
        JSON.stringify({
          token: e.presignToken,
          externalId: e.externalId,
          features: e.features,
          css: e.css,
          cssVars: e.cssVars,
          darkModeDisabled: e.darkModeDisabled,
          ...e.additionalProps
        })
      )
    ), t = new URL(
      `/embed/v1/authoring/document/edit/${e.documentId}`,
      a
    );
    return t.searchParams.set("token", e.presignToken), t.hash = n, t.toString();
  }
  function c(a) {
    var n, t;
    if (((n = d.current) == null ? void 0 : n.contentWindow) === a.source)
      switch (a.data.type) {
        case "document-updated":
          (t = e.onDocumentUpdated) == null || t.call(e, {
            documentId: a.data.documentId,
            externalId: a.data.externalId
          });
          break;
      }
  }
  return s(() => {
    window.addEventListener("message", c);
  }, []), s(() => () => {
    window.removeEventListener("message", c);
  }, []), /* @__PURE__ */ u("iframe", { ref: d, className: e.className, src: m() });
}
function E(e) {
  const d = r(null);
  function m() {
    const a = e.host || "https://app.documenso.com", n = btoa(
      encodeURIComponent(
        JSON.stringify({
          token: e.presignToken,
          externalId: e.externalId,
          features: e.features,
          css: e.css,
          cssVars: e.cssVars,
          darkModeDisabled: e.darkModeDisabled,
          ...e.additionalProps
        })
      )
    ), t = new URL(
      `/embed/v1/authoring/template/edit/${e.templateId}`,
      a
    );
    return t.searchParams.set("token", e.presignToken), t.hash = n, t.toString();
  }
  function c(a) {
    var n, t;
    if (((n = d.current) == null ? void 0 : n.contentWindow) === a.source)
      switch (a.data.type) {
        case "template-updated":
          (t = e.onTemplateUpdated) == null || t.call(e, {
            templateId: a.data.templateId,
            externalId: a.data.externalId
          });
          break;
      }
  }
  return s(() => {
    window.addEventListener("message", c);
  }, []), s(() => () => {
    window.removeEventListener("message", c);
  }, []), /* @__PURE__ */ u("iframe", { ref: d, className: e.className, src: m() });
}
function U(e) {
  const d = r(null);
  function m() {
    const a = e.host || "https://app.documenso.com", n = btoa(
      encodeURIComponent(
        JSON.stringify({
          name: e.name,
          lockName: e.lockName,
          css: e.css,
          cssVars: e.cssVars,
          darkModeDisabled: e.darkModeDisabled,
          allowDocumentRejection: e.allowDocumentRejection,
          ...e.additionalProps
        })
      )
    ), t = new URL("/embed/v1/multisign", a);
    for (const i of e.tokens)
      t.searchParams.append("token", i);
    return `${t}#${n}`;
  }
  function c(a) {
    var n, t, i, o, l, f;
    if (((n = d.current) == null ? void 0 : n.contentWindow) === a.source)
      switch (a.data.action) {
        case "document-ready":
          (t = e.onDocumentReady) == null || t.call(e);
          break;
        case "document-completed":
          (i = e.onDocumentCompleted) == null || i.call(e, a.data.data);
          break;
        case "document-error":
          (o = e.onDocumentError) == null || o.call(e, a.data.data);
          break;
        case "document-rejected":
          (l = e.onDocumentRejected) == null || l.call(e, a.data.data);
          break;
        case "all-documents-completed":
          (f = e.onAllDocumentsCompleted) == null || f.call(e, a.data.data);
          break;
      }
  }
  return s(() => {
    window.addEventListener("message", c);
  }, []), s(() => () => {
    window.removeEventListener("message", c);
  }, []), /* @__PURE__ */ u("iframe", { ref: d, className: e.className, src: m() });
}
export {
  g as EmbedDirectTemplate,
  w as EmbedSignDocument,
  h as unstable_EmbedCreateDocument,
  D as unstable_EmbedCreateTemplate,
  U as unstable_EmbedMultiSignDocument,
  I as unstable_EmbedUpdateDocument,
  E as unstable_EmbedUpdateTemplate
};
