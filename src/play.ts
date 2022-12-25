import { obstacle_trash, obstacle_trashFlags, obstacle_trashHeight, obstacle_trashWidth } from "./assets/obstacle-trash";
import { player_jumping, player_jumpingFlags, player_jumpingHeight, player_jumpingWidth } from "./assets/player-jumping";
import { player_running, player_runningFlags, player_runningHeight, player_runningWidth } from "./assets/player-running";
import { AbstractFrameHandler, Mode } from "./frameHandler";
import * as w4 from "./wasm4";


export class Play extends AbstractFrameHandler {
    /** Size of the jump in pixels */
    protected readonly JUMP_SIZE: i16 = 48;
    /** Height of the jump */
    protected readonly JUMP_HEIGHT: i16 = 24;
    /** Position of the road */
    protected readonly ROAD_Y: u8 = u8(w4.SCREEN_SIZE - 1);

    /** Player velocity (x, pixels/frame) */
    protected _speed_x: i8 = 1;
    /** Player velocity (y, pixels/frame) */
    protected _speed_y: i8 = 0;
    /** Current position of the player (x, pixels) */
    protected _position_x: u64 = 0;
    /** Current position of the player (y, pixels) */
    protected _position_y: i16 = 0;
    /** Position at which the player will be start to go down */
    protected _position_next_down: u64 = 0;
    /** Position at which the player will be able to jump */
    protected _position_next_jump: u64 = 0;

    /** Positions of the obstacles */
    protected _obstacles: Array<u64> = new Array();

    constructor() {
        super();
    }

    protected _update_impl(): Mode {
        // -- Handle buttons --
        const gamepad = load<u8>(w4.GAMEPAD1);
        if (gamepad & w4.BUTTON_LEFT) {
            // Stop the player
            this._speed_x = 0;
            this._speed_y = 0;
            this._position_y = 0;
        } else if (gamepad & w4.BUTTON_RIGHT) {
            // Start the player
            this._speed_x = 1;
            this._speed_y = 0;
            this._position_y = 0;
        }

        if (gamepad & w4.BUTTON_UP && this._speed_x > 0) {
            // Try jump, make sure player has waited enough to start a new jump
            if (this._position_next_jump <= this._position_x) {
                this._speed_y += 1;
                this._position_next_down = this._position_x + this.JUMP_SIZE;
                this._position_next_jump = this._position_next_down + this.JUMP_HEIGHT + 8; // Length of the jump + time to fall down + margin
            }
        }

        // DEBUG
        if (gamepad & w4.BUTTON_2) {
            // DEBUG: Save score and exit
            this.setLastScore(this._position_x);
            return Mode.SCORE;
        }


        // -- Handle speed --
        this._position_x += this._speed_x;
        this._position_y += this._speed_y;
        // Stop jump at max height
        if (this._position_y >= this.JUMP_HEIGHT) {
            this._position_y = this.JUMP_HEIGHT;
            this._speed_y = 0;
        }
        // Make sure players goes down
        if (this._position_x >= this._position_next_down && this._position_y > 0) {
            this._speed_y = -1;
        }
        if (this._position_y <= 0) {
            this._position_y = 0;
            this._speed_y = 0;
        }

        // -- Obstacles --
        // Clear obstacles that are behind the player
        if (this._position_x > u64(player_runningWidth)) {
            const obstacle_threshold = this._position_x - player_runningWidth;
            while (this._obstacles.length > 0 && this._obstacles[0] <= obstacle_threshold) {
                this._obstacles.splice(0, 1);
            }
        }

        // Handle collisions
        for (let i: i32 = 0; i < this._obstacles.length; i++) {
            const obstacle_x: u64 = this._obstacles[i];
            if (this._position_x + player_runningWidth < obstacle_x + 12) {
                // Player is not yet on the obstacle
                continue;
            }
            if (obstacle_x + 20 < this._position_x) {
                // Player has passed the obstacle
                continue;
            }

            // Player is on the obstacle
            if (this._position_y < 5) {
                // Collision
                this.setLastScore(this._position_x);
                return Mode.SCORE;
            }
        }

        // Make sure wa have enough obstacles planned
        let start_x = this._obstacles.length > 0 ? this._obstacles[this._obstacles.length - 1] : this._position_x;
        while (this._obstacles.length < 5) {
            start_x += w4.SCREEN_SIZE / 2 + u64(Math.floor(Math.random() * w4.SCREEN_SIZE));
            // Generate some new obstacle
            this._obstacles.push(start_x);
        }

        // -- Clear screen --
        // Automatically done on each frame

        // -- Score --
        store<u16>(w4.DRAW_COLORS, 3);
        w4.text("Score: " + this._position_x.toString(), 5, 5);

        // -- Ground --
        store<u16>(w4.DRAW_COLORS, 3);
        w4.line(
            0, this.ROAD_Y,
            w4.SCREEN_SIZE, this.ROAD_Y
        );

        // -- Draw obstacle sprites --
        store<u16>(w4.DRAW_COLORS, 0x4320);
        for (let i: i32 = 0; i < this._obstacles.length; i++) {
            const obstacle_x: u64 = this._obstacles[i];
            if (obstacle_x < this._position_x - obstacle_trashWidth) {
                // Obstacle is not visible anymore
                continue;
            }
            if (this._position_x + w4.SCREEN_SIZE <= obstacle_x) {
                // Obstacle is not visible yet
                continue;
            }
            w4.blit(obstacle_trash, i32(obstacle_x - this._position_x), this.ROAD_Y - obstacle_trashWidth, obstacle_trashWidth, obstacle_trashHeight, obstacle_trashFlags);
        }

        // -- Draw player sprite --
        store<u16>(w4.DRAW_COLORS, 0x4320);
        const offset_y: i32 = this.ROAD_Y - player_runningHeight - 1 - this._position_y;
        if (this._position_y === 0) {
            w4.blit(player_running, 0, offset_y, player_runningWidth, player_runningHeight, player_runningFlags);
        } else {
            w4.blit(player_jumping, 0, offset_y, player_jumpingWidth, player_jumpingHeight, player_jumpingFlags);
        }

        return Mode.KEEP;
    }
}
