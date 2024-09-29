import "./style.css";
import init, * as wasm from "@repo/tabol-core";

await init();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <label>
      <p>Table Definition: <span class="dot"></span></p>
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

let direction = -1;

const dot = document.querySelector(".dot") as HTMLSpanElement;

requestAnimationFrame(runAnimation);

function runAnimation() {
  const opacity = parseFloat(getComputedStyle(dot).opacity);
  let nextOpacity = opacity + 0.05 * direction;

  if (nextOpacity < 0 || nextOpacity > 1) {
    direction = direction * -1;
    nextOpacity = Math.min(1, Math.max(0, nextOpacity));
  }

  dot.style.opacity = String(nextOpacity);

  requestAnimationFrame(runAnimation);
}
