import * as Sentry from "@sentry/nextjs";

export const captureError = (
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
  }
) => {
  if (!error) return;

  Sentry.withScope((scope: Sentry.Scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    if (context?.level) {
      scope.setLevel(context.level);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error));
    }
  });
};

export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) => {
  Sentry.withScope((scope: Sentry.Scope) => {
    scope.setLevel(level);
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
};

export const setUser = (
  user: { id: string; email?: string; username?: string } | null
) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
};

export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = "info"
) => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
  });
};

export const startSpan = <T>(
  name: string,
  operation: string,
  callback: () => T
): T => {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    callback
  );
};

export const startSpanAsync = <T>(
  name: string,
  operation: string,
  callback: () => Promise<T>
): Promise<T> => {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    callback
  );
};

export const setContext = (
  name: string,
  context: Record<string, unknown> | null
) => {
  Sentry.setContext(name, context);
};

export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

export const showFeedback = () => {
  const feedback = Sentry.getFeedback();
  if (feedback) {
    feedback
      .createForm()
      .then((form: { appendToDom: () => void; open: () => void }) => {
        form.appendToDom();
        form.open();
      });
  }
};

export const trackApiCall = (
  endpoint: string,
  method: string,
  status: number,
  duration: number
) => {
  addBreadcrumb(
    "http",
    `${method} ${endpoint}`,
    {
      url: endpoint,
      method,
      status_code: status,
      duration_ms: duration,
    },
    status >= 400 ? "error" : "info"
  );
};

export const trackUserAction = (
  action: string,
  data?: Record<string, unknown>
) => {
  addBreadcrumb("user", action, data, "info");
};

export const trackNavigation = (from: string, to: string) => {
  addBreadcrumb(
    "navigation",
    `Navigated from ${from} to ${to}`,
    { from, to },
    "info"
  );
};

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      Sentry.logger.debug(message, data);
    } else {
      Sentry.logger.debug(message);
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      Sentry.logger.info(message, data);
    } else {
      Sentry.logger.info(message);
    }
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      Sentry.logger.warn(message, data);
    } else {
      Sentry.logger.warn(message);
    }
  },
  error: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      Sentry.logger.error(message, data);
    } else {
      Sentry.logger.error(message);
    }
  },
};

export const metrics = {
  count: (name: string, value = 1, tags?: Record<string, string>) => {
    Sentry.metrics.count(name, value, { attributes: tags });
  },
  gauge: (name: string, value: number, tags?: Record<string, string>) => {
    Sentry.metrics.gauge(name, value, { attributes: tags });
  },
  distribution: (
    name: string,
    value: number,
    tags?: Record<string, string>,
    unit?: string
  ) => {
    Sentry.metrics.distribution(name, value, { attributes: tags, unit });
  },
};
