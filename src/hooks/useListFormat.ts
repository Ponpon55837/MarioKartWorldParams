import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * 依目前語言把清單接成自然語句，例如「速度和重量」、"speed and weight"
 */
export function useListFormat() {
  const { i18n } = useTranslation();
  const formatter = useMemo(
    () =>
      new Intl.ListFormat(i18n.language, {
        style: "long",
        type: "conjunction",
      }),
    [i18n.language],
  );

  return useCallback(
    (items: readonly string[]) => formatter.format(items),
    [formatter],
  );
}
