import "./style.css";
import "./ui/panel.css";
import "./hints/hint-note.css";
import "./pets/pets.css";
import { PuzzleLibrary } from "./game/puzzle-library";
import { SolvedBoards } from "./game/solved-boards";
import { registerServiceWorker } from "./offline/register-service-worker";
import { PawPrintWalker } from "./pets/paw-print-walker";
import { PetPeeker } from "./pets/pet-peeker";
import { GamePage } from "./ui/game-page";

new GamePage(new PuzzleLibrary(), SolvedBoards.loadFromStorage()).start();
new PetPeeker().start();
new PawPrintWalker().start();
registerServiceWorker();
