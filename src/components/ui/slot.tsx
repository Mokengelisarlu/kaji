import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SlotProps = {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
};

/**
 * Polymorphisme minimal : rend un unique enfant en lui fusionnant `className`
 * et les props reçues. Évite d'ajouter la dépendance Radix pour le MVP.
 *
 * L'enfant doit être un élément React valide. Sinon, `null` est rendu plutôt
 * qu'une erreur : un Slot mal utilisé ne doit pas casser une page.
 */
export function Slot({ children, className, ...props }: SlotProps) {
  if (!isValidElement(children)) {
    return null;
  }

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props as Record<string, unknown>;

  return cloneElement(child, {
    ...props,
    ...childProps,
    className: cn(className, typeof childProps.className === "string" ? childProps.className : undefined),
  });
}
