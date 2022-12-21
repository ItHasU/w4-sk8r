import { AbstractFrameHandler, Mode } from "./frameHandler";
import * as w4 from "./wasm4";

export class SplashScreen extends AbstractFrameHandler {

    constructor() {
        super();
    }

    protected _update_impl(): Mode {
        store<u16>(w4.DRAW_COLORS, 2);
        w4.text("Sk8r!", 10, 10);

        const gamepad = load<u8>(w4.GAMEPAD1);
        if (gamepad & w4.BUTTON_1) {
            return Mode.PLAY;
        }

        w4.text("Press X to play", 16, 90);
        return Mode.KEEP;
    }
}
