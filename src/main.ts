import './style.css';
import './ui/panel.css';
import './hints/hint-note.css';
import { PuzzleLibrary } from './game/puzzle-library';
import { SolvedBoards } from './game/solved-boards';
import { GamePage } from './ui/game-page';

new GamePage(new PuzzleLibrary(), SolvedBoards.loadFromStorage()).start();
