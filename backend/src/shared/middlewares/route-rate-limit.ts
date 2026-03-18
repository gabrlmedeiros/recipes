export const routeRateLimit = {
  config: {
    rateLimit: {
      max: 30,
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        data: null,
        error: {
          message: 'Muitas tentativas. Tente novamente em instantes.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      }),
    },
  },
};

export const authRouteRateLimit = {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '15 minutes',
      errorResponseBuilder: () => ({
        data: null,
        error: {
          message: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      }),
    },
  },
};
