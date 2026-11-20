import './controls.css';
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '../game/difficulty';

// One button per difficulty, with the selected one marked.
export class DifficultyPicker {
  constructor(
    private readonly pickerElement: HTMLElement,
    private readonly onDifficultySelected: (difficulty: Difficulty) => void,
  ) {}

  render(selectedDifficulty: Difficulty): void {
    this.pickerElement.replaceChildren();

    for (const difficulty of DIFFICULTIES) {
      this.pickerElement.appendChild(this.createButton(difficulty, difficulty === selectedDifficulty));
    }
  }

  private createButton(difficulty: Difficulty, isSelected: boolean): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.className = 'difficulty-button';
    buttonElement.classList.toggle('selected', isSelected);
    buttonElement.setAttribute('aria-pressed', String(isSelected));
    buttonElement.textContent = DIFFICULTY_LABELS[difficulty];
    buttonElement.addEventListener('click', () => this.onDifficultySelected(difficulty));
    return buttonElement;
  }
}
