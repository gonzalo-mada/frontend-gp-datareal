export function generateServiceMongo(
    nameService: string, 
    loading: boolean = true, 
    retry: number = 0, 
    timeout: number = 50000
  ) {
    return {
      service: nameService,
      loading: loading,
      retry: retry,
      timeout: timeout
    };
  }