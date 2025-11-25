/**
 * Error Handler Utility for Pesca Pro
 * Provides user-friendly error messages for different error scenarios
 */

// Map of error codes/messages to user-friendly messages
const errorMessages = {
  // Authentication errors
  'Invalid credentials': 'Wrong email/mobile number or password. Please try again.',
  'Invalid email or password': 'Wrong email or password. Please check and try again.',
  'Invalid mobile or password': 'Wrong mobile number or password. Please check and try again.',
  'User not found': 'No account found with this mobile number.',
  'Organizer not found': 'No organizer account found with this email.',
  'Email or mobile number already registered': 'This email or mobile number is already in use.',
  'Mobile number already registered': 'This mobile number is already registered.',
  'Token expired': 'Your session has expired. Please login again.',
  'Invalid token': 'Your session is invalid. Please login again.',
  'Authentication required': 'Please login to continue.',
  
  // Validation errors
  'Password must be at least 6 characters': 'Password is too short. Use at least 6 characters.',
  'Valid email is required': 'Please enter a valid email address.',
  'Mobile number is required': 'Please enter your mobile number.',
  'Full name is required': 'Please enter your full name.',
  
  // Tournament errors
  'Tournament not found': 'Tournament not found or has been deleted.',
  'Tournament not found or not active': 'This tournament is not available for registration.',
  'Tournament not found or unauthorized': 'You don\'t have permission to access this tournament.',
  
  // Registration errors
  'You have already registered for this tournament': 'You\'ve already registered for this tournament.',
  'Some selected areas are no longer available': 'Some areas have been taken. Please select different areas.',
  'Registration not found': 'Registration not found.',
  'Registration not found, not confirmed, or unauthorized': 'Your registration needs to be confirmed first.',
  
  // Catch errors
  'Catch image is required': 'Please upload a photo of your catch.',
  'Tournament is not currently active': 'The tournament is not active. You cannot upload catches now.',
  
  // Network errors
  'Network Error': 'Unable to connect to server. Please check your internet connection.',
  'timeout': 'Request timed out. Please try again.',
  
  // Server errors
  'Server error': 'Something went wrong on our end. Please try again later.',
  'Internal server error': 'Something went wrong. Please try again later.',
};

/**
 * Get user-friendly error message
 * @param {Error} error - The error object from axios
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network error (no response)
  if (!error.response) {
    if (error.message === 'Network Error') {
      return errorMessages['Network Error'];
    }
    if (error.code === 'ECONNABORTED') {
      return errorMessages['timeout'];
    }
    return 'Connection error. Please check your internet and try again.';
  }

  // Get the error message from response
  const responseMessage = error.response?.data?.message;
  const responseErrors = error.response?.data?.errors;
  
  // Handle validation errors array
  if (responseErrors && Array.isArray(responseErrors)) {
    const firstError = responseErrors[0];
    if (firstError?.msg) {
      return errorMessages[firstError.msg] || firstError.msg;
    }
  }
  
  // Check if we have a mapped message
  if (responseMessage && errorMessages[responseMessage]) {
    return errorMessages[responseMessage];
  }
  
  // Handle specific HTTP status codes
  const status = error.response?.status;
  switch (status) {
    case 400:
      return responseMessage || 'Invalid request. Please check your input.';
    case 401:
      return responseMessage || 'Invalid credentials. Please try again.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return responseMessage || 'The requested resource was not found.';
    case 409:
      return responseMessage || 'This action conflicts with existing data.';
    case 413:
      return 'File is too large. Maximum size is 10MB.';
    case 422:
      return responseMessage || 'Invalid data. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
      return 'Server error. Please try again later.';
    default:
      return responseMessage || 'Something went wrong. Please try again.';
  }
};

/**
 * Get error type for styling purposes
 * @param {Error} error - The error object
 * @returns {string} Error type: 'auth', 'validation', 'network', 'server'
 */
export const getErrorType = (error) => {
  if (!error.response) {
    return 'network';
  }
  
  const status = error.response?.status;
  if (status === 401 || status === 403) {
    return 'auth';
  }
  if (status === 400 || status === 422) {
    return 'validation';
  }
  if (status >= 500) {
    return 'server';
  }
  return 'general';
};

export default { getErrorMessage, getErrorType };

