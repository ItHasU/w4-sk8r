import { AbstractFrameHandler, Mode } from "./frameHandler";
import { Play } from "./play";
import { SplashScreen } from "./splashscreen";

let frameHandler: AbstractFrameHandler = new Play();

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
        }
    }
}
