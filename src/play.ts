import { AbstractFrameHandler, Mode } from "./frameHandler";
import * as w4 from "./wasm4";

export class Play extends AbstractFrameHandler {
    /** Size of the road in pixels */
    protected readonly ROAD_SIZE: i16;
    /** Offset for rendering the second line of the road (in pixels) */
    protected readonly Y_OFFSET: i16;
    /** Offset for rendering the second line of the road (in pixels) */
    protected readonly X_OFFSET: i16;

    protected _speed_x: i8 = 0;
    protected _speed_y: i8 = 0;
    protected _position_x: i32 = 0;
    protected _position_y: i32 = 0;
    protected _obstacle_x: i32;

    constructor() {
        super();
        this.ROAD_SIZE = 24;
        this.Y_OFFSET = -this.ROAD_SIZE;
        this.X_OFFSET = i16(this.ROAD_SIZE * Math.cos(Math.PI / 6.));
        this._next_obstacle();
    }

    protected _next_obstacle(): void {
        this._obstacle_x = this._position_x + i32(Math.random() * 6 * this.ROAD_SIZE);
    }

    protected _update_impl(): Mode {
        // -- Handle buttons --
        const gamepad = load<u8>(w4.GAMEPAD1);
        if (gamepad & w4.BUTTON_DOWN) {
            this._speed_x = 0;
            this._speed_y = 0;
            this._position_y = 0;
            // } else if (gamepad & w4.BUTTON_LEFT) {
            //     this._speed_x = -1;
            //     this._speed_y = 0;
            //     this._position_y = 0;
        } else if (gamepad & w4.BUTTON_RIGHT) {
            this._speed_x = 1;
            this._speed_y = 0;
            this._position_y = 0;
        }

        if (gamepad & w4.BUTTON_UP) {
            this._speed_y += 1;
        }

        // -- Handle speed --
        this._position_x += this._speed_x;
        this._position_y += this._speed_y;
        if (this._position_y > this.ROAD_SIZE / 2) {
            this._position_y = this.ROAD_SIZE / 2;
            this._speed_y = 0;
            this._timer_reset()
        }
        if (this._position_y >= this.ROAD_SIZE / 2 && this._timer_wait_f(this.ROAD_SIZE)) {
            this._speed_y = -1;
        }
        if (this._position_y <= 0) {
            this._position_y = 0;
            this._speed_y = 0;
        }
        if (this._obstacle_x + this.ROAD_SIZE < this._position_x) {
            this._next_obstacle();
        }

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
        const offset_x: i32 = this._position_x % this.ROAD_SIZE + this.ROAD_SIZE;
        for (let i: i32 = -offset_x; i < i32(w4.SCREEN_SIZE); i += this.ROAD_SIZE) {
            w4.line(
                i, this.ROAD_SIZE + w4.SCREEN_SIZE - 1,
                i + this.X_OFFSET, w4.SCREEN_SIZE - 1 + this.Y_OFFSET
            );
        }
        w4.text(this._globalFramesCount.toString(), 0, 0);

        // -- Draw obstacle --
        store<u16>(w4.DRAW_COLORS, 2);
        w4.blit(OBSTACLE_TRASH, this._obstacle_x - this._position_x, w4.SCREEN_SIZE - 16 - 1 - this.ROAD_SIZE / 4, 16, 16, w4.BLIT_1BPP);

        // -- Draw sprite --
        store<u16>(w4.DRAW_COLORS, 4);
        const offset_y: i32 = w4.SCREEN_SIZE - 16 - 1 - this._position_y - this.ROAD_SIZE / 4;
        if (this._speed_x === 0) {
            w4.blit(PLAYER_STANDING, 0, offset_y, 16, 16, w4.BLIT_1BPP);
        } else if (this._speed_x > 0) {
            w4.blit(PLAYER_RUNNING, 0, offset_y, 16, 16, w4.BLIT_1BPP);
        } else if (this._speed_x < 0) {
            w4.blit(PLAYER_RUNNING, 0, offset_y, 16, 16, w4.BLIT_1BPP | w4.BLIT_FLIP_X);
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

const PLAYER_RUNNING = memory.data<u8>([
    0b11111111, 0b11111111,
    0b11111110, 0b01111111,
    0b11111110, 0b01111111,
    0b11111000, 0b00000011,
    0b11110100, 0b01111111,
    0b11101100, 0b01111111,
    0b11011100, 0b01111111,
    0b11111100, 0b01111111,
    0b11111101, 0b01111111,
    0b11111101, 0b01111111,
    0b11111101, 0b01111111,
    0b11111101, 0b01111111,
    0b11111101, 0b01111111,
    0b11111101, 0b01111111,
    0b11110000, 0b00000111,
    0b11111011, 0b11101111,
]);

const OBSTACLE_TRASH = memory.data<u8>([
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111111, 0b11111111,
    0b11111110, 0b01111111,
    0b11111000, 0b00011111,
    0b11111100, 0b00111111,
    0b11111100, 0b00111111,
    0b11111100, 0b00111111,
    0b11111100, 0b00111111,
]);

//#endregion