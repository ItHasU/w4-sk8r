import * as w4 from "./wasm4";

//#region Global code ---------------------------------------------------------

enum Mode {
    SPLASHSCREEN,
    PLAY
}

let mode: Mode = Mode.SPLASHSCREEN;

export function update(): void {
    timer.update();

    switch (mode) {
        case Mode.PLAY:
            update_play();
            break;
        default:
        case Mode.SPLASHSCREEN:
            update_splashscreen();
            break;

    }
}

//#endregion

//#region Splashscreen mode ---------------------------------------------------

function update_splashscreen(): void {
    store<u16>(w4.DRAW_COLORS, 2);
    w4.text("Sk8r!", 10, 10);

    const gamepad = load<u8>(w4.GAMEPAD1);
    if (gamepad & w4.BUTTON_1) {
        mode = Mode.PLAY;
        timer.reset();
    }

    w4.text("Press X to play", 16, 90);

}

//#endregion

//#region Play mode -----------------------------------------------------------

function update_play(): void {
    // -- Clear screen --
    store<u16>(w4.DRAW_COLORS, 0);
    w4.rect(0, 0, w4.SCREEN_SIZE, w4.SCREEN_SIZE);

    const gamepad = load<u8>(w4.GAMEPAD1);
    if (gamepad & w4.BUTTON_UP || timer.wait_s(5)) {
        mode = Mode.SPLASHSCREEN;
    }
}

//#endregion

//#region Time tools ----------------------------------------------------------

class Timer {
    protected _frameCount: u32 = 0;

    public update(): void {
        this._frameCount++;
    }

    public reset(): void {
        this._frameCount = 0;
    }

    public wait_s(timeout: u16): bool {
        return this._frameCount > timeout * 60;
    }
}

const timer: Timer = new Timer();