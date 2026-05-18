interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  url?: string
  userId?: string
  timestamp: number
}

class ErrorMonitor {
  private static instance: ErrorMonitor
  private errors: ErrorReport[] = []
  private maxErrors = 50

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  captureError(error: Error, componentStack?: string, userId?: string) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userId,
      timestamp: Date.now(),
    }

    this.errors.push(report)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorMonitor]', report)
    }

    // In production, you could send to an API endpoint
    // this.sendToApi(report)
  }

  getErrors(): ErrorReport[] {
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
  }
}

export const errorMonitor = ErrorMonitor.getInstance()
