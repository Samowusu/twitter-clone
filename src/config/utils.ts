export function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

export const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});
