import "./style.css";
import "./ui/panel.css";
import "./hints/hint-note.css";
import "./pets/pets.css";
import { PuzzleLibrary } from "./game/puzzle-library";
import { SolvedBoards } from "./game/solved-boards";
import { registerServiceWorker } from "./offline/register-service-worker";
import { walkPawPrints } from "./pets/paw-print-walk";
import { peekIn } from "./pets/pet-peek";
import { VisitScheduler } from "./pets/visit-scheduler";
import { GamePage } from "./ui/game-page";
import { getRequiredElement } from "./ui/required-element";

new GamePage(new PuzzleLibrary(), SolvedBoards.loadFromStorage()).start();
// One visitor at a time: most visits are an animal peeking in, now and then paw prints walk by.
new VisitScheduler(Math.random, [
  {
    weight: 4,
    perform: () => peekIn(Math.random, getRequiredElement("board")),
  },
  { weight: 1, perform: () => walkPawPrints(Math.random) },
]).start();
registerServiceWorker();
