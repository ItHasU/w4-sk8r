import { obstacle_trash_down, obstacle_trash_downFlags, obstacle_trash_downHeight, obstacle_trash_downWidth } from "./assets/obstacle-trash-down";
import { player_falling, player_fallingFlags, player_fallingHeight, player_fallingWidth } from "./assets/player-falling";
import { AbstractFrameHandler, Mode } from "./frameHandler";
import * as w4 from "./wasm4";

export class Score extends AbstractFrameHandler {

    /** Position of the road */
    protected readonly ROAD_Y: u8 = u8(w4.SCREEN_SIZE - 1);
    protected exitNext: bool = false;

    constructor() {
        super();
    }

    protected _update_impl(): Mode {
        const gamepad = load<u8>(w4.GAMEPAD1);
        if (gamepad & w4.BUTTON_1) {
            this.exitNext = true;
        }
        if (this.exitNext && !(gamepad & w4.BUTTON_1)) {
            return Mode.SPLASHSCREEN;
        }

        const last: u64 = this.getLastScore();
        const best: u64 = this.getBestScore();

        store<u16>(w4.DRAW_COLORS, 0x3);
        if (last >= best) {
            store<u16>(w4.DRAW_COLORS, 0x4);
        }
        w4.text("Score: " + last.toString(), 5, 5);
        store<u16>(w4.DRAW_COLORS, 0x4);
        w4.text("Best: " + best.toString(), 5, 20);

        store<u16>(w4.DRAW_COLORS, 0x4320);
        w4.blit(obstacle_trash_down, 16, this.ROAD_Y - obstacle_trash_downHeight, obstacle_trash_downWidth, obstacle_trash_downHeight, obstacle_trash_downFlags);
        w4.blit(player_falling, 48, this.ROAD_Y - obstacle_trash_downHeight, player_fallingWidth, player_fallingHeight, player_fallingFlags);

        return Mode.KEEP;
    }
}
