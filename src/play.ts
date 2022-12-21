import { AbstractFrameHandler, Mode } from "./frameHandler";
import * as w4 from "./wasm4";

export class Play extends AbstractFrameHandler {
    /** Size of the road in pixels */
    protected readonly ROAD_SIZE: i16;
    /** Offset for rendering the second line of the road (in pixels) */
    protected readonly Y_OFFSET: i16;
    /** Offset for rendering the second line of the road (in pixels) */
    protected readonly X_OFFSET: i16;

    constructor() {
        super();
        this.ROAD_SIZE = 16;
        this.Y_OFFSET = -this.ROAD_SIZE;
        this.X_OFFSET = i16(this.ROAD_SIZE * Math.cos(Math.PI / 6.));
    }

    protected _update_impl(): Mode {
        // -- Clear screen --
        store<u16>(w4.DRAW_COLORS, 1);
        w4.rect(0, 0, w4.SCREEN_SIZE, w4.SCREEN_SIZE);

        // -- Draw background --
        store<u16>(w4.DRAW_COLORS, 2);
        w4.line(
            0, w4.SCREEN_SIZE - 1,
            w4.SCREEN_SIZE, w4.SCREEN_SIZE - 1
        );
        w4.line(
            0, w4.SCREEN_SIZE - 1 + this.Y_OFFSET,
            w4.SCREEN_SIZE, w4.SCREEN_SIZE - 1 + this.Y_OFFSET
        );
        const offset: i32 = this._globalFramesCount % this.ROAD_SIZE
        for (let i: i32 = -offset; i < i32(w4.SCREEN_SIZE); i += this.ROAD_SIZE) {
            w4.line(
                i, this.ROAD_SIZE + w4.SCREEN_SIZE - 1,
                i + this.X_OFFSET, w4.SCREEN_SIZE - 1 + this.Y_OFFSET
            );
        }
        w4.text(this._globalFramesCount.toString(), 0, 0);

        // -- Draw sprite --
        store<u16>(w4.DRAW_COLORS, 4);
        w4.blit(PLAYER_STANDING, 0, w4.SCREEN_SIZE - 16 - 1, 16, 16, w4.BLIT_1BPP);

        const gamepad = load<u8>(w4.GAMEPAD1);
        if (gamepad & w4.BUTTON_UP) {
            return Mode.SPLASHSCREEN;
        }

        return Mode.KEEP;
    }
}

//#region Assets --------------------------------------------------------------

const PLAYER_STANDING = memory.data<u8>([
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111110, 0b01111111,
    0b11111110, 0b01111111,
    0b11111100, 0b00011111,
    0b11111010, 0b00101111,
    0b11110110, 0b00101111,
    0b11101110, 0b00101111,
    0b11001110, 0b00101111,
    0b11001110, 0b10111111,
    0b11001110, 0b10111111,
    0b11001110, 0b10111111,
    0b11001110, 0b10111111,
    0b11001100, 0b10011111,
]);

//#endregion