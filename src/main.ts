import "./style.css";
import "./ui/panel.css";
import "./hints/hint-note.css";
import "./pets/pets.css";
import "./ui/start-paw.css";
import { PuzzleLibrary } from "./game/puzzle-library";
import { SolvedBoards } from "./game/solved-boards";
import { registerServiceWorker } from "./offline/register-service-worker";
import { peekIn } from "./pets/pet-peek";
import { VisitScheduler } from "./pets/visit-scheduler";
import { GamePage } from "./ui/game-page";
import { getRequiredElement } from "./ui/required-element";
import { showStartPawPointingAt } from "./ui/start-paw";

new GamePage(new PuzzleLibrary(), SolvedBoards.loadFromStorage()).start();
showStartPawPointingAt(getRequiredElement("info"));
// One visitor at a time: an animal peeks in now and then.
new VisitScheduler(Math.random, [
  {
    weight: 1,
    perform: () => peekIn(Math.random, getRequiredElement("board")),
  },
]).start();
registerServiceWorker();
