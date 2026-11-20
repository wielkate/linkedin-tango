export function getRequiredElement(elementId: string): HTMLElement {
  const element = document.getElementById(elementId);

  if (element === null) {
    throw new Error(`Missing element with id "${elementId}" in index.html`);
  }

  return element;
}

export function getRequiredButton(elementId: string): HTMLButtonElement {
  return getRequiredElement(elementId) as HTMLButtonElement;
}
