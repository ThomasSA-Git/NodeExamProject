
// Function to display a toast notification
// Parameters:
//   - message: The text content of the toast
//   - type: The type of the toast, can be 'success' or 'error' (default is 'success')
//   - duration: The duration in milliseconds for which the toast will be visible (default is 3000ms)
export function showToast(message, type = 'success', duration = 3000) {
  // Step 1: Create a container element for the toast
  const toastContainer = document.createElement('div');
  // Step 2: Add classes to the container, including a type-specific class for styling
  toastContainer.classList.add('toast-container', `toast-${type}`);
  
  // Step 3: Create an element for the toast message
  const toastMessage = document.createElement('div');
  // Step 4: Add a class to the message element
  toastMessage.classList.add('toast-message');
  // Step 5: Set the text content of the message element to the provided message
  toastMessage.textContent = message;
  
  // Step 6: Append the message element to the container element
  toastContainer.appendChild(toastMessage);
  // Step 7: Append the container element to the body of the document
  document.body.appendChild(toastContainer);
  
  // Step 8: Use setTimeout to remove the toast container after the specified duration
  setTimeout(() => {
    document.body.removeChild(toastContainer);
  }, duration);
}