// A Command binding owns feedback and the fallback for every clipboard action.
export function bindClipboard(button, status, readText, fallback) {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(readText());
      status.textContent = '복사됨';
    } catch {
      status.textContent = fallback;
    }
  });
}
