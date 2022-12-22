import * as splash from "./assets/splash";
import { AbstractFrameHandler, Mode } from "./frameHandler";
import * as w4 from "./wasm4";

export class SplashScreen extends AbstractFrameHandler {

    constructor() {
        super();
    }

    protected _update_impl(): Mode {
        const gamepad = load<u8>(w4.GAMEPAD1);
        if (gamepad & w4.BUTTON_1) {
            return Mode.PLAY;
        }

        store<u16>(w4.DRAW_COLORS, 0x2341);
        w4.blit(splash.splash, 0, 0, splash.splashWidth, splash.splashHeight, splash.splashFlags);

        store<u16>(w4.DRAW_COLORS, 0x4);
        w4.text("Press X to play", 17, 141);
        store<u16>(w4.DRAW_COLORS, 0x1);
        w4.text("Press X to play", 16, 140);
        return Mode.KEEP;
    }
}
