import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// This is a basic setup. In a real app, you'd generate the spec from Zod schemas.
// For now, we'll just setup the UI with a placeholder spec.
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'DOGG API',
        version: '1.0.0',
        description: 'API Documentation for DOGG application',
    },
    servers: [
        {
            url: 'http://localhost:3001/api',
            description: 'Local server',
        },
    ],
    paths: {},
};

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log('Swagger UI available at /api-docs');
};
