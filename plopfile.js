const fs = require('fs');
const path = require('path');

module.exports = function (plop) {
    plop.setGenerator('feature', {
        description: 'Create a new feature across the monorepo',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the feature? (kebab-case)',
                validate: (value) => {
                    if (/.+/.test(value)) {
                        return true;
                    }
                    return 'name is required';
                },
            },
        ],
        actions: [
            // 1. Create Zod schema in packages/types
            {
                type: 'add',
                path: 'packages/types/src/{{name}}.ts',
                template: `import { z } from 'zod';

export const {{pascalCase name}}Schema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Add your fields here
});

export type {{pascalCase name}} = z.infer<typeof {{pascalCase name}}Schema>;

export const Create{{pascalCase name}}Schema = {{pascalCase name}}Schema.omit({ id: true, createdAt: true, updatedAt: true });
export type Create{{pascalCase name}}Input = z.infer<typeof Create{{pascalCase name}}Schema>;
`,
            },
            // 2. Export from packages/types/src/index.ts
            {
                type: 'append',
                path: 'packages/types/src/index.ts',
                pattern: /$/,
                template: `export * from './{{name}}';`,
            },
            // 3. Create API module in apps/api
            {
                type: 'add',
                path: 'apps/api/src/modules/{{name}}/{{name}}.model.ts',
                template: `import mongoose, { Schema } from 'mongoose';
import { {{pascalCase name}} } from 'types';

const {{camelCase name}}Schema = new Schema<{{pascalCase name}}>({
  // Define your mongoose schema here to match the Zod type
}, { timestamps: true });

export const {{pascalCase name}}Model = mongoose.model<{{pascalCase name}}>('{{pascalCase name}}', {{camelCase name}}Schema);
`,
            },
            {
                type: 'add',
                path: 'apps/api/src/modules/{{name}}/{{name}}.controller.ts',
                template: `import { Request, Response } from 'express';
import { {{pascalCase name}}Model } from './{{name}}.model';
import { Create{{pascalCase name}}Schema } from 'types';

export const create{{pascalCase name}} = async (req: Request, res: Response) => {
  const input = Create{{pascalCase name}}Schema.parse(req.body);
  const {{camelCase name}} = await {{pascalCase name}}Model.create(input);
  res.json({{camelCase name}});
};

export const get{{pascalCase name}} = async (req: Request, res: Response) => {
  const {{camelCase name}} = await {{pascalCase name}}Model.findById(req.params.id);
  if (!{{camelCase name}}) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({{camelCase name}});
};
`,
            },
            {
                type: 'add',
                path: 'apps/api/src/modules/{{name}}/{{name}}.routes.ts',
                template: `import { Router } from 'express';
import { create{{pascalCase name}}, get{{pascalCase name}} } from './{{name}}.controller';

const router = Router();

router.post('/', create{{pascalCase name}});
router.get('/:id', get{{pascalCase name}});

export const {{camelCase name}}Router = router;
`,
            },
            // 4. Create Web feature folder
            {
                type: 'add',
                path: 'apps/web/src/features/{{name}}/components/{{pascalCase name}}List.tsx',
                template: `import React from 'react';
import { {{pascalCase name}} } from 'types';

interface {{pascalCase name}}ListProps {
  items: {{pascalCase name}}[];
}

export const {{pascalCase name}}List: React.FC<{{pascalCase name}}ListProps> = ({ items }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{JSON.stringify(item)}</li>
      ))}
    </ul>
  );
};
`,
            },
        ],
    });
};
