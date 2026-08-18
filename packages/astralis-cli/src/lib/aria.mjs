/* ==========================================================================
   ARIA 1.2 vocabulary — the finite sets the a11y checks close over.
   A typo'd aria attribute or role is the same failure class as a dead
   astralis class: it typechecks (React passes aria-* through untouched),
   renders, and assistive technology hears nothing.
   ========================================================================== */

export const ARIA_ATTRS = new Set([
  "aria-activedescendant", "aria-atomic", "aria-autocomplete",
  "aria-braillelabel", "aria-brailleroledescription", "aria-busy",
  "aria-checked", "aria-colcount", "aria-colindex", "aria-colindextext",
  "aria-colspan", "aria-controls", "aria-current", "aria-describedby",
  "aria-description", "aria-details", "aria-disabled", "aria-dropeffect",
  "aria-errormessage", "aria-expanded", "aria-flowto", "aria-grabbed",
  "aria-haspopup", "aria-hidden", "aria-invalid", "aria-keyshortcuts",
  "aria-label", "aria-labelledby", "aria-level", "aria-live", "aria-modal",
  "aria-multiline", "aria-multiselectable", "aria-orientation", "aria-owns",
  "aria-placeholder", "aria-posinset", "aria-pressed", "aria-readonly",
  "aria-relevant", "aria-required", "aria-roledescription", "aria-rowcount",
  "aria-rowindex", "aria-rowindextext", "aria-rowspan", "aria-selected",
  "aria-setsize", "aria-sort", "aria-valuemax", "aria-valuemin",
  "aria-valuenow", "aria-valuetext",
]);

/** Concrete (non-abstract) ARIA roles — abstract roles are invalid in markup. */
export const ROLES = new Set([
  "alert", "alertdialog", "application", "article", "banner", "blockquote",
  "button", "caption", "cell", "checkbox", "code", "columnheader", "combobox",
  "complementary", "contentinfo", "definition", "deletion", "dialog",
  "directory", "document", "emphasis", "feed", "figure", "form", "generic",
  "grid", "gridcell", "group", "heading", "img", "insertion", "link", "list",
  "listbox", "listitem", "log", "main", "marquee", "math", "menu", "menubar",
  "menuitem", "menuitemcheckbox", "menuitemradio", "meter", "navigation",
  "none", "note", "option", "paragraph", "presentation", "progressbar",
  "radio", "radiogroup", "region", "row", "rowgroup", "rowheader",
  "scrollbar", "search", "searchbox", "separator", "slider", "spinbutton",
  "status", "strong", "subscript", "superscript", "switch", "tab", "table",
  "tablist", "tabpanel", "term", "textbox", "time", "timer", "toolbar",
  "tooltip", "tree", "treegrid", "treeitem",
]);
