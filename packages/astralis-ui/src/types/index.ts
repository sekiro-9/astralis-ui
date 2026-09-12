import type { ComponentRef, ElementType, Ref } from "react";

/** The ref a polymorphic component takes: an instance of whatever `as` renders. */
export type PolymorphicRef<T extends ElementType> = Ref<ComponentRef<T>>;
