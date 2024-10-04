import "./style.css";

const workerInstance = new ComlinkWorker<typeof import("./worker.js")>(
  new URL("./worker", import.meta.url)
);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <label>
      <p>Table Definition: <span class="dot"></span></p>
      <textarea name="tabol-definition" rows="20" cols="48"></textarea>
      <span class="error"></span>
    </label>
  </div>
`;

const textArea = document.querySelector(
  'textarea[name="tabol-definition"]'
) as HTMLTextAreaElement;

const errorFeedback = document.querySelector(".error") as HTMLSpanElement;

textArea.addEventListener("input", async function onChange(e: Event) {
  if (e.target instanceof HTMLTextAreaElement) {
    const value = e.target.value.trim();

    try {
      console.clear();

      if (value) {
        const hash = await workerInstance.parse(value);
        const tableIds = await workerInstance.tableIds(hash);
        console.log("main", hash, tableIds);
      }

      errorFeedback.innerText = "";
    } catch (e: unknown) {
      console.error(e);
      errorFeedback.innerText = String(e);
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
