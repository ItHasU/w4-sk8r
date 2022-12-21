export enum Mode {
    /** Keep current mode */
    KEEP = 0,

    // -- Different modes for the application --
    SPLASHSCREEN,
    PLAY
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

    protected _wait_s(seconds: u16): bool {
        return this._framesCount >= seconds * 60 /*fps*/;
    }

    //#endregion
}
