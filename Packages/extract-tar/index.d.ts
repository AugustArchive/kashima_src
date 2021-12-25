declare module '@kashima-org/tar' {
  namespace ExtractTool {
    /** Returns the version of the package */
    export const version: string;

    /**
     * Extracts a file from the web
     * @param options The options to use
     */
    export function extract(options: ExtractOptions): Promise<void>;

    interface ExtractOptions {
      /** If the file is compressed */
      compressed?: boolean;

      /** The destination directory */
      dest: string;

      /** The filename to place/remove */
      path: string;

      /** The URL to fetch from */
      url: string;
    }
  }

  export = ExtractTool;
}