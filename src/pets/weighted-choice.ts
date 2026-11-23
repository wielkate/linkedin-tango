import type { RandomNumberGenerator } from "./pet-peek-plan";

// Picks one item; an item with a bigger weight is picked more often.
export function pickWeightedItem<Item>(
  random: RandomNumberGenerator,
  items: readonly Item[],
  getWeight: (item: Item) => number,
): Item {
  const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
  let remainingWeight = random() * totalWeight;

  for (const item of items) {
    remainingWeight -= getWeight(item);

    if (remainingWeight < 0) {
      return item;
    }
  }

  return items[items.length - 1];
}
