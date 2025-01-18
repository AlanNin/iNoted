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
    } catch (error) {
      return content;
    }
  }

  let texts: any = [];

  function traverse(node: any) {
    if (!node) return;

    if (node.type === "text" && node.text) {
      texts.push(node.text);
      return;
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }

    if (node.root) {
      traverse(node.root);
    }
  }

  traverse(data);
  return texts.join("\n");
}
