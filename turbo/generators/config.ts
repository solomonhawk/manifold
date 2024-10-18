import isPascalCase from "@stdlib/assert-is-pascalcase";
import { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("ui/component", {
    description: "A new UI component",
    prompts: [
      {
        type: "input",
        name: "component_name",
        message: "What is the name of the new component?",
        validate: (input: string) => {
          if (!input) {
            return "file name is required";
          }

          if (!isPascalCase(input)) {
            return "file name must be in PascalCase";
          }

          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/ui/src/components/{{ dashCase component_name }}.tsx",
        templateFile: "templates/ui/component/index.hbs",
      },
    ],
  });
}
