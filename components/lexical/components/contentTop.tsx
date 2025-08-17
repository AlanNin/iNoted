// dom component, use inside existing dom component or specify "use dom" in the file
import colors from "@/constants/colors";
import { formatLongDate } from "@/lib/format_date";
import { useEffect } from "react";

export default function ContentTop({
  title,
  noteDate,
  setTitle,
  isTitleEditable,
  theme,
  setIsTitleFocused,
}: {
  title: string;
  noteDate: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  isTitleEditable: boolean;
  theme: "light" | "dark";
  setIsTitleFocused: (value: boolean) => void;
}) {
  useEffect(() => {
    if (!isTitleEditable) {
      setIsTitleFocused(false);
    }
  }, [isTitleEditable]);

  return (
    <div className="content-top">
      <p style={{ color: colors[theme].grayscale }} className="last-edited">
        Last edited on {formatLongDate(noteDate!)}
      </p>
      <input
        placeholder="Untitled note"
        autoComplete="on"
        spellCheck="true"
        autoCorrect="on"
        className="title-input"
        style={{
          color: colors[theme].text,
        }}
        defaultValue={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={!isTitleEditable}
        onFocus={() => setIsTitleFocused(true)}
        onBlur={() => setIsTitleFocused(false)}
      />
    </div>
  );
}
