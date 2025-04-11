import isPascalCase from "@stdlib/assert-is-pascalcase";
import { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("ui/component", {
    description: "A new UI component",
    prompts: [
      {
        type: "confirm",
        name: "core",
        message: "Is this a core component?",
        default: false,
      },

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

    actions: (answers) => {
      const isCoreComponent = answers?.core ?? false;

      if (isCoreComponent) {
        return [
          // components/core/<component>/index.ts
          {
            type: "add",
            path: "{{ turbo.paths.root }}/packages/ui/src/components/core/{{ dashCase component_name }}/index.ts",
            templateFile: "templates/ui/component/core/index.ts.hbs",
          },
          // components/core/<component>/<component>.tsx
          {
            type: "add",
            path: "{{ turbo.paths.root }}/packages/ui/src/components/core/{{ dashCase component_name }}/{{ dashCase component_name }}.tsx",
            templateFile: "templates/ui/component/core/component.tsx.hbs",
          },
          // components/core/<component>/<component>.stories.tsx
          {
            type: "add",
            path: "{{ turbo.paths.root }}/packages/ui/src/components/core/{{ dashCase component_name }}/{{ dashCase component_name }}.stories.tsx",
            templateFile:
              "templates/ui/component/core/component.stories.tsx.hbs",
          },
        ];
      }

      return [
        // components/<component>/index.ts
        {
          type: "add",
          path: "{{ turbo.paths.root }}/packages/ui/src/components/{{ dashCase component_name }}/index.ts",
          templateFile: "templates/ui/component/index.ts.hbs",
        },
        // components/<component>/<component>.tsx
        {
          type: "add",
          path: "{{ turbo.paths.root }}/packages/ui/src/components/{{ dashCase component_name }}/{{ dashCase component_name }}.tsx",
          templateFile: "templates/ui/component/component.tsx.hbs",
        },
        // components/<component>/<component>.stories.tsx
        {
          type: "add",
          path: "{{ turbo.paths.root }}/packages/ui/src/components/{{ dashCase component_name }}/{{ dashCase component_name }}.stories.tsx",
          templateFile: "templates/ui/component/component.stories.tsx.hbs",
        },
      ];
    },
  });
}
