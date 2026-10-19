// subset-font ships no types; only the call signature used by subset_fontawesome.js is declared.
declare module 'subset-font' {
    function subsetFont(
        font: Buffer | Uint8Array,
        text: string,
        options?: { targetFormat?: 'sfnt' | 'woff' | 'woff2' }
    ): Promise<Buffer>;
    export = subsetFont;
}
