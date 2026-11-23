import { createPetElement, pointPupilsAt } from "./pet-element";
import { PET_BREEDS } from "./pet-breeds";
import {
  calculateFreeSpaceByEdge,
  planPeek,
  type BoardBounds,
  type PeekPlan,
  type RandomNumberGenerator,
} from "./pet-peek-plan";
import { wait } from "./wait";

// Must match the transition time of .pet in pets.css.
const SLIDE_MILLISECONDS = 700;

// One visit: a cat or a dog peeks in from an edge of the screen, looks around and leaves.
// It is drawn over the text and buttons but under the board, and it ignores the mouse.
// Nobody comes when the board leaves no room on any edge.
export async function peekIn(
  random: RandomNumberGenerator,
  boardElement: HTMLElement,
): Promise<void> {
  const viewport = {
    widthPixels: window.innerWidth,
    heightPixels: window.innerHeight,
  };
  const freeSpaceByEdge = calculateFreeSpaceByEdge(
    viewport,
    readBoardBounds(boardElement),
  );
  const plan = planPeek(random, viewport, PET_BREEDS, freeSpaceByEdge);

  if (plan === null) {
    return;
  }

  const element = createPetElement(plan);
  document.body.appendChild(element);

  try {
    await peekAndLookAround(element, plan);
  } finally {
    element.remove();
  }
}

function readBoardBounds(boardElement: HTMLElement): BoardBounds {
  const bounds = boardElement.getBoundingClientRect();

  return {
    leftPixels: bounds.left,
    topPixels: bounds.top,
    rightPixels: bounds.right,
    bottomPixels: bounds.bottom,
  };
}

async function peekAndLookAround(
  element: HTMLElement,
  plan: PeekPlan,
): Promise<void> {
  // Reading the layout lets the browser draw the hidden start before the slide begins.
  void element.offsetWidth;
  element.classList.add("pet--peeking");
  await wait(SLIDE_MILLISECONDS);

  for (const lookTarget of plan.lookTargets) {
    pointPupilsAt(element, lookTarget.horizontal, lookTarget.vertical);
    await wait(lookTarget.pauseMilliseconds);
  }

  element.classList.remove("pet--peeking");
  await wait(SLIDE_MILLISECONDS);
}
