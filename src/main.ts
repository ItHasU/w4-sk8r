import { AbstractFrameHandler, Mode } from "./frameHandler";
import { Play } from "./play";
import { Score } from "./score";
import { SplashScreen } from "./splashscreen";

let frameHandler: AbstractFrameHandler = new Score();

export function update(): void {
    const nextMode = frameHandler.update();
    if (nextMode != Mode.KEEP) {
        switch (nextMode) {
            case Mode.SPLASHSCREEN:
                frameHandler = new SplashScreen();
                break;
            case Mode.PLAY:
                frameHandler = new Play();
                break;
            case Mode.SCORE:
                frameHandler = new Score();
                break;
        }
    }
}
