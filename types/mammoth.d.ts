declare module "mammoth/mammoth.browser.js" {
  export function convertToMarkdown(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<{ value: string; messages: Array<{ type: string; message: string }> }>;

  export function convertToHtml(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<{ value: string; messages: Array<{ type: string; message: string }> }>;

  export function extractRawText(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<{ value: string; messages: Array<{ type: string; message: string }> }>;

  const _default: {
    convertToMarkdown: typeof convertToMarkdown;
    convertToHtml: typeof convertToHtml;
    extractRawText: typeof extractRawText;
  };
  export default _default;
}
