export const convertToJson = (text: string | null | undefined) => {
  if (text === null || text === undefined) {
    return JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
            textFormat: 0,
            textStyle: "",
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    });
  }

  try {
    const parsed = JSON.parse(text);

    if (parsed && typeof parsed === "object" && parsed !== null) {
      return text;
    }
  } catch (e) {
    return JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: text,
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
            textFormat: 0,
            textStyle: "",
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    });
  }
};

export function parseEditorState(content: any) {
  let data = content;

  if (typeof content === "string") {
    try {
      data = JSON.parse(content);
    } catch {
      return content;
    }
  }

  if (!data?.root?.children) return "";

  const lines: string[] = [];

  for (const node of data.root.children) {
    if (node.type === "paragraph") {
      if (!node.children || node.children.length === 0) {
        lines.push("");
        continue;
      }

      const paragraphText = node.children
        .filter((child: any) => child.type === "text")
        .map((child: any) => child.text)
        .join("");

      lines.push(paragraphText);
    }
  }

  return lines.join("\n");
}
