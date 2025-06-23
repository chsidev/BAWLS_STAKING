// src/app/core/interceptors/logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request to safely inspect it
  const clonedRequest = req.clone();
  
  // Get the complete URL with parameters
  const fullUrl = clonedRequest.urlWithParams;
  
  console.log('Full Request URL:', fullUrl);
  console.log('Request Method:', clonedRequest.method);
  console.log('Request Headers:', clonedRequest.headers);
  
  return next(req);
};