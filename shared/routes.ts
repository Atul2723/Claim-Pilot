import { z } from 'zod';
import { insertCompanySchema, insertExpenseSchema, companies, expenses, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/auth/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
  },
  companies: {
    list: {
      method: 'GET' as const,
      path: '/api/companies',
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies',
      input: insertCompanySchema,
      responses: {
        201: z.custom<typeof companies.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/companies/:id',
      responses: {
        204: z.void(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses',
      input: z.object({
        status: z.enum(['pending', 'approved_manager', 'approved_finance', 'rejected']).optional(),
        companyId: z.coerce.number().optional(),
        userId: z.string().optional(), // For admin/finance to filter by user
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof expenses.$inferSelect & { company: typeof companies.$inferSelect, user: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema,
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/expenses/:id',
      input: z.any(), 
      responses: {
        200: z.custom<any>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/expenses/:id',
      responses: {
        200: z.custom<typeof expenses.$inferSelect & { company: typeof companies.$inferSelect, user: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/expenses/:id/status',
      input: z.object({
        status: z.enum(['approved_manager', 'approved_finance', 'rejected']),
        rejectionReason: z.string().optional(),
        billable: z.boolean().optional(),
      }),
      responses: {
        200: z.custom<typeof expenses.$inferSelect>(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    updateRole: {
      method: 'PATCH' as const,
      path: '/api/users/:id/role',
      input: z.object({
        role: z.enum(['admin', 'manager', 'finance', 'employee']),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
