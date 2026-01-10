import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, TextNode, $createTextNode } from "lexical";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";

type SearchPluginProps = {
  searchTerm: string | null;
  matchIndex: number;
  trigger?: number;
  setSearchResultsNumber: (number: number) => void;
  handleToastAndroid: (message: string) => void;
};

const HIGHLIGHT_MARK = "lexical-search-highlight";

const SearchPlugin: React.FC<SearchPluginProps> = ({
  searchTerm,
  matchIndex,
  trigger,
  setSearchResultsNumber,
  handleToastAndroid,
}) => {
  const theme = useColorScheme();
  const HIGHLIGHT_COLOR = colors[theme].primary_dark;
  const [editor] = useLexicalComposerContext();
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchTerm || searchTerm.trim() === "") {
      editor.update(() => {
        const root = $getRoot();
        const textNodes = root.getAllTextNodes();

        textNodes.forEach((node) => {
          if (!node || typeof (node as any).getStyle !== "function") {
            return;
          }
          const style = (node as TextNode).getStyle();
          if (style && style.includes(HIGHLIGHT_MARK)) {
            const cleanStyle = style
              .replace(/;?\s*lexical-search-highlight:[^;]*/g, "")
              .replace(/;?\s*background-color:[^;]*/g, "")
              .replace(/;?\s*color:[^;]*/g, "");
            (node as TextNode).setStyle(cleanStyle);
          }
        });
      });
      setSearchResultsNumber(0);
      return;
    }

    let targetKey: string | null = null;
    let totalMatches = 0;

    editor.update(() => {
      const root = $getRoot();
      const lowerSearch = searchTerm.toLowerCase();

      const textNodes = root.getAllTextNodes();
      const processedParents = new Set<string>();

      textNodes.forEach((node) => {
        if (!(node instanceof TextNode)) return;

        const parent = node.getParent();
        if (!parent) return;

        const parentKey = parent.getKey();
        if (processedParents.has(parentKey)) return;
        processedParents.add(parentKey);

        const children = parent.getChildren();
        const textChildren: TextNode[] = [];

        children.forEach((child) => {
          if (child instanceof TextNode) {
            textChildren.push(child);
          }
        });

        if (textChildren.length > 1) {
          const hasHighlight = textChildren.some((child) => {
            const style = child.getStyle();
            return style && style.includes(HIGHLIGHT_MARK);
          });

          if (hasHighlight) {
            let fullText = "";
            let baseStyle = "";

            textChildren.forEach((child) => {
              fullText += child.getTextContent();
              if (!baseStyle) {
                const style = child.getStyle();
                baseStyle = style
                  ? style
                      .replace(/;?\s*lexical-search-highlight:[^;]*/g, "")
                      .replace(/;?\s*background-color:[^;]*/g, "")
                      .replace(/;?\s*color:[^;]*/g, "")
                  : "";
              }
            });

            const consolidatedNode = $createTextNode(fullText);
            consolidatedNode.setStyle(baseStyle);

            textChildren[0].replace(consolidatedNode);
            for (let i = 1; i < textChildren.length; i++) {
              textChildren[i].remove();
            }
          }
        }
      });

      const cleanTextNodes = root.getAllTextNodes();

      type NodeInfo = {
        node: TextNode;
        text: string;
        style: string;
      };

      const nodeInfos: NodeInfo[] = [];

      cleanTextNodes.forEach((node) => {
        if (node instanceof TextNode) {
          const style = node.getStyle() || "";
          const cleanStyle = style
            .replace(/;?\s*lexical-search-highlight:[^;]*/g, "")
            .replace(/;?\s*background-color:[^;]*/g, "")
            .replace(/;?\s*color:[^;]*/g, "");

          node.setStyle(cleanStyle);

          nodeInfos.push({
            node,
            text: node.getTextContent(),
            style: cleanStyle,
          });
        }
      });

      type Match = {
        nodeIndex: number;
        startOffset: number;
        endOffset: number;
      };

      const matches: Match[] = [];

      nodeInfos.forEach((nodeInfo, nodeIndex) => {
        const { text } = nodeInfo;
        const lowerText = text.toLowerCase();

        let from = 0;
        while (true) {
          const foundIndex = lowerText.indexOf(lowerSearch, from);
          if (foundIndex === -1) break;

          matches.push({
            nodeIndex,
            startOffset: foundIndex,
            endOffset: foundIndex + lowerSearch.length,
          });

          from = foundIndex + 1;
        }
      });

      totalMatches = matches.length;

      setSearchResultsNumber(totalMatches);

      if (totalMatches > 0) {
        const safeIndex = Math.max(0, Math.min(matchIndex, totalMatches - 1));
        const match = matches[safeIndex];

        if (match) {
          const nodeInfo = nodeInfos[match.nodeIndex];
          const { node, text, style } = nodeInfo;

          try {
            node.getParent();
          } catch {
            return;
          }

          const before = text.substring(0, match.startOffset);
          const matchText = text.substring(match.startOffset, match.endOffset);
          const after = text.substring(match.endOffset);

          const highlightStyle =
            (style ? style + ";" : "") +
            `${HIGHLIGHT_MARK}:1;background-color:${HIGHLIGHT_COLOR};color:#FFFFFF`;

          if (!before && !after) {
            node.setStyle(highlightStyle);
            targetKey = node.getKey();
          } else if (before && matchText && after) {
            const beforeNode = $createTextNode(before);
            beforeNode.setStyle(style);

            const matchNode = $createTextNode(matchText);
            matchNode.setStyle(highlightStyle);

            const afterNode = $createTextNode(after);
            afterNode.setStyle(style);

            node.replace(beforeNode);
            beforeNode.insertAfter(matchNode);
            matchNode.insertAfter(afterNode);

            targetKey = matchNode.getKey();
          } else if (before && matchText) {
            const beforeNode = $createTextNode(before);
            beforeNode.setStyle(style);

            const matchNode = $createTextNode(matchText);
            matchNode.setStyle(highlightStyle);

            node.replace(beforeNode);
            beforeNode.insertAfter(matchNode);

            targetKey = matchNode.getKey();
          } else if (matchText && after) {
            const matchNode = $createTextNode(matchText);
            matchNode.setStyle(highlightStyle);

            const afterNode = $createTextNode(after);
            afterNode.setStyle(style);

            node.replace(matchNode);
            matchNode.insertAfter(afterNode);

            targetKey = matchNode.getKey();
          }
        }
      }
    });

    debounceTimerRef.current = setTimeout(() => {
      if (totalMatches === 0) {
        handleToastAndroid("No results found");
      }
    }, 2000);

    if (targetKey) {
      setTimeout(() => {
        const domElem = editor.getElementByKey(targetKey!);
        if (domElem && "scrollIntoView" in domElem) {
          (domElem as HTMLElement).scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 100);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    editor,
    searchTerm,
    matchIndex,
    trigger,
    setSearchResultsNumber,
    HIGHLIGHT_COLOR,
  ]);

  return null;
};

export default SearchPlugin;
