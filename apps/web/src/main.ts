import "./style.css";
import init, * as wasm from "@repo/tabol-core";

await init();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <label>
      <p>Table Definition:</p>
      <textarea name="tabol-definition" rows="20" cols="48"></textarea>
    </label>
  </div>
`;

const textArea = document.querySelector(
  'textarea[name="tabol-definition"]'
) as HTMLTextAreaElement;

textArea.addEventListener("input", function onChange(e: Event) {
  if (e.target instanceof HTMLTextAreaElement) {
    const value = e.target.value.trim();

    if (value) {
      try {
        console.clear();
        wasm.parse(value);
      } catch (e: unknown) {
        console.error(e);
      }
    }
  }
});
