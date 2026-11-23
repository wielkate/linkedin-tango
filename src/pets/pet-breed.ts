export type PetSpecies = "cat" | "dog";

export type EarShape = "pointed" | "erect" | "floppy" | "folded";

export interface PetPalette {
  fur: string;
  earOuter: string;
  earInner: string;
  muzzle: string;
  nose: string;
  // The color of the paws and of the arm that reaches into the screen.
  pawColor: string;
  // The soft pads under the paw.
  padColor: string;
  eyeColor: string;
  whiskerColor: string;
}

export interface PetBreed {
  name: string;
  species: PetSpecies;
  earShape: EarShape;
  // Only floppy ears use it: 1 is a normal ear, a smaller number is a shorter ear.
  earScale: number;
  palette: PetPalette;
  // SVG drawn on top of the head and under the eyes: stripes, spots, a white blaze, a mask.
  markings: string;
}
