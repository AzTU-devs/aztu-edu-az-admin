import { Extension } from "@tiptap/core";

/**
 * Line spacing for block nodes.
 *
 * The Rector's letter is one long rich-text field, and an editor needs to
 * control how far apart its paragraphs sit — Tiptap ships no such control, so
 * this stores the value as an inline `line-height` style on the paragraph or
 * heading and round-trips it through `parseHTML`, which is what makes the
 * setting survive a save-and-reload.
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (height: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LINE_HEIGHTS = ["1", "1.15", "1.5", "1.75", "2", "2.5"] as const;

export const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return { types: ["paragraph", "heading", "listItem"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.lineHeight
                ? { style: `line-height: ${attributes.lineHeight}` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (height: string) =>
        ({ commands }) =>
          // Applied to every block type in scope so a selection spanning a
          // heading and a paragraph ends up consistent.
          this.options.types.every((type: string) =>
            commands.updateAttributes(type, { lineHeight: height })
          ),
      unsetLineHeight:
        () =>
        ({ commands }) =>
          this.options.types.every((type: string) =>
            commands.resetAttributes(type, "lineHeight")
          ),
    };
  },
});

export default LineHeight;
