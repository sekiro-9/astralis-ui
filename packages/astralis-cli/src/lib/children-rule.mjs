/** Rule: a component whose type requires children must be given some (requiresChildren, spec 3+). */

/** Whether a JSX child renders: whitespace spanning a line break and `{/* comments *\/}` do not. */
function renders(child) {
  if (child.type === "JSXText") return child.value.trim() !== "" || !child.value.includes("\n");
  if (child.type === "JSXExpressionContainer") return child.expression.type !== "JSXEmptyExpression";
  return true;
}

export function checkRequiredChildren(ctx, identity, element) {
  const comp = identity.specName ? ctx.spec.components[identity.specName] : null;
  if (!comp?.requiresChildren) return;
  const opening = element.openingElement;
  // A spread may carry children, and an explicit children prop supplies them.
  const supplied = opening.attributes.some(
    (attr) => attr.type === "JSXSpreadAttribute" || (attr.name.type === "JSXIdentifier" && attr.name.name === "children"),
  );
  if (supplied || element.children.some(renders)) return;
  const parts = ctx.spec.components[identity.owner ?? identity.specName]?.anatomy?.children;
  const hint = parts && !identity.part ? ` — compose its parts (${parts.join(", ")})` : "";
  ctx.error("missing-children", opening,
    `${identity.display} requires children: its type makes them mandatory, so this fails type checking and renders empty${hint}`);
}
