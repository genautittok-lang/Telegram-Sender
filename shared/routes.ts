import { z } from 'zod';
import { insertAccountSchema, insertAccountGroupSchema, accounts, accountGroups, recipients, logs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  accounts: {
    list: {
      method: 'GET' as const,
      path: '/api/accounts',
      responses: {
        200: z.array(z.custom<typeof accounts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/accounts/:id',
      responses: {
        200: z.custom<typeof accounts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Note: Create is handled via Auth flow usually, but we might want manual creation if session string is known?
    // We'll focus on the Auth flow for creation, but update is useful.
    update: {
      method: 'PATCH' as const,
      path: '/api/accounts/:id',
      input: insertAccountSchema.partial().extend({ isRunning: z.boolean().optional() }),
      responses: {
        200: z.custom<typeof accounts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/accounts/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    start: {
        method: 'POST' as const,
        path: '/api/accounts/:id/start',
        responses: { 200: z.object({ success: z.boolean() }) }
    },
    stop: {
        method: 'POST' as const,
        path: '/api/accounts/:id/stop',
        responses: { 200: z.object({ success: z.boolean() }) }
    }
  },
  groups: {
    list: {
      method: 'GET' as const,
      path: '/api/groups',
      responses: {
        200: z.array(z.custom<typeof accountGroups.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/groups',
      input: insertAccountGroupSchema,
      responses: {
        201: z.custom<typeof accountGroups.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/groups/:id',
      input: insertAccountGroupSchema.partial(),
      responses: {
        200: z.custom<typeof accountGroups.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/groups/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  recipients: {
    list: {
      method: 'GET' as const,
      path: '/api/accounts/:accountId/recipients',
      responses: {
        200: z.array(z.custom<typeof recipients.$inferSelect>()),
      },
    },
    bulkAdd: {
      method: 'POST' as const,
      path: '/api/accounts/:accountId/recipients',
      input: z.object({ identifiers: z.array(z.string()) }),
      responses: {
        200: z.object({ added: z.number() }),
      },
    },
    clear: {
        method: 'DELETE' as const,
        path: '/api/accounts/:accountId/recipients',
        responses: { 204: z.void() }
    }
  },
  auth: {
    requestCode: {
      method: 'POST' as const,
      path: '/api/auth/request-code',
      input: z.object({
        phoneNumber: z.string(),
      }),
      responses: {
        200: z.object({ phoneCodeHash: z.string() }),
        400: errorSchemas.validation,
      },
    },
    signIn: {
      method: 'POST' as const,
      path: '/api/auth/sign-in',
      input: z.object({
        phoneNumber: z.string(),
        phoneCode: z.string(),
        phoneCodeHash: z.string(),
        password: z.string().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      },
    },
  },
  control: {
    global: {
      method: 'POST' as const,
      path: '/api/control/global',
      input: z.object({ action: z.enum(['start_all', 'stop_all', 'pause_all']) }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
      },
    },
  },
  stats: {
    get: {
        method: 'GET' as const,
        path: '/api/stats',
        responses: {
            200: z.object({
                totalAccounts: z.number(),
                activeAccounts: z.number(),
                messagesSent: z.number(),
                errors: z.number()
            })
        }
    }
  },
  logs: {
      list: {
          method: 'GET' as const,
          path: '/api/logs',
          responses: {
              200: z.array(z.custom<typeof logs.$inferSelect>())
          }
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
