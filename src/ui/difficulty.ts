import './controls.css';
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '../game/puzzle';

// Builds one button per difficulty and marks the selected one.
export function renderDifficultyPicker(
  pickerElement: HTMLElement,
  selectedDifficulty: Difficulty,
  onDifficultySelected: (difficulty: Difficulty) => void,
): void {
  pickerElement.replaceChildren();

  for (const difficulty of DIFFICULTIES) {
    const isSelected = difficulty === selectedDifficulty;

    const buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.className = 'difficulty-button';
    buttonElement.classList.toggle('selected', isSelected);
    buttonElement.setAttribute('aria-pressed', String(isSelected));
    buttonElement.textContent = DIFFICULTY_LABELS[difficulty];
    buttonElement.addEventListener('click', () => onDifficultySelected(difficulty));
    pickerElement.appendChild(buttonElement);
  }
}
