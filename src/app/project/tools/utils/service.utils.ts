export function generateServiceMongo(
    nameService: string, 
    loading: boolean = true, 
    retry: number = 0, 
    timeout: number = 30000
  ) {
    return {
      service: nameService,
      loading: loading,
      retry: retry,
      timeout: timeout
    };
  }