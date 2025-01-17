// dom component, use inside existing dom component or specify "use dom" in the file
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { formatLongDate } from "@/lib/format_date";

export default function ContentTop({
  title,
  noteDate,
  setTitle,
  isTitleEditable,
}: {
  title: string;
  noteDate: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  isTitleEditable: boolean;
}) {
  const theme = useColorScheme();

  return (
    <div className="content-top">
      <p style={{ color: colors[theme].grayscale }} className="last-edited">
        Last edited on {formatLongDate(noteDate!)}
      </p>
      <input
        placeholder="Untitled note"
        autoComplete="off"
        spellCheck="false"
        autoCorrect="off"
        className="title-input"
        style={{
          color: colors[theme].text,
        }}
        defaultValue={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={!isTitleEditable}
      />
    </div>
  );
}
