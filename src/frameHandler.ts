import * as w4 from "./wasm4";


export enum Mode {
    /** Keep current mode */
    KEEP = 0,

    // -- Different modes for the application --
    SPLASHSCREEN,
    PLAY,
    SCORE
}

export abstract class AbstractFrameHandler {
    protected _framesCount: u32 = 0;
    protected _globalFramesCount: u32 = 0;

    /** 
     * Called on each frame
     * @returns null to keep running current frame handler or the mode to be switched to.
     */
    public update(): Mode {
        const result = this._update_impl();
        this._framesCount++;
        this._globalFramesCount++;
        return result;
    }

    /** 
     * Method called by update()
     * Should update everything necessary on display and return new mode if needed.
     * 
     * This method is wrapped through update() to handle all the tools
     */
    protected abstract _update_impl(): Mode;

    //#region Timer -----------------------------------------------------------

    protected _timer_reset(): void {
        this._framesCount = 0;
    }

    protected _timer_wait_s(seconds: u16): bool {
        return this._framesCount >= seconds * 60 /*fps*/;
    }

    protected _timer_wait_f(frames: u16): bool {
        return this._framesCount >= frames;
    }

    //#endregion

    //#region Score -----------------------------------------------------------

    public getLastScore(): u64 {
        const ptr = memory.data(2 * sizeof<u64>());
        w4.diskr(ptr, 2 * sizeof<u64>());

        return load<u64>(ptr);
    }

    public getBestScore(): u64 {
        const ptr = memory.data(2 * sizeof<u64>());
        w4.diskr(ptr, 2 * sizeof<u64>());

        return load<u64>(ptr + 1 * sizeof<u64>());
    }

    /**
     *  Save last score and update high score if needed 
     * @returns true if score is better than previous highscore.
     */
    public setLastScore(score: u64): bool {
        let better: bool = false;
        // Reserve some memory to exchange data with the storage
        const ptr = memory.data(2 * sizeof<u64>());
        // Read data from the disk
        w4.diskr(ptr, 2 * sizeof<u64>());

        let highscore: u64 = load<u64>(ptr + 1 * sizeof<u64>());
        if (score > highscore) {
            highscore = score;
            better = true;
        }

        // First we need to store the value somewhere in memory to get a pointer
        store<u64>(ptr + 0 * sizeof<u64>(), score);
        store<u64>(ptr + 1 * sizeof<u64>(), highscore);
        // Then we write the data
        w4.diskw(ptr, 2 * sizeof<u64>());

        return better;
    }

    //#endregion
}
