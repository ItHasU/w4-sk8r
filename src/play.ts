import { player_jumping, player_jumpingFlags, player_jumpingHeight, player_jumpingWidth } from "./assets/player-jumping";
import { player_running, player_runningFlags, player_runningHeight, player_runningWidth } from "./assets/player-running";
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
        // Automatically done on each frame

        // -- Draw background --
        store<u16>(w4.DRAW_COLORS, 3);
        w4.line(
            0, w4.SCREEN_SIZE - 1,
            w4.SCREEN_SIZE, w4.SCREEN_SIZE - 1
        );
        w4.text("Score: " + this._position_x.toString(), 0, 0);

        // -- Draw sprite --
        store<u16>(w4.DRAW_COLORS, 0x4321);
        const offset_y: i32 = w4.SCREEN_SIZE - player_jumpingHeight - 1 - this._position_y;
        if (this._position_y === 0) {
            w4.blit(player_running, 0, offset_y, player_runningWidth, player_runningHeight, player_runningFlags);
        } else {
            w4.blit(player_jumping, 0, offset_y, player_jumpingWidth, player_jumpingHeight, player_jumpingFlags);

        }



        return Mode.KEEP;
    }
}
