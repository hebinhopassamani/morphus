# Horizon
Modern admin template. It includes a comprehensive set of features and a well-organized directory structure to help you kickstart your Angular projects efficiently.

## Getting Started

1. Make sure you have the latest compatible version of Node.js (preferably latest LTS) and Angular CLI installed:

   ```bash
   npm install -g @angular/cli
   ```

2. Navigate to the project directory and install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

## Production Build

1. Update the **allowedHosts** array in `angular.json` file to allow your production domains. You can learn more about this in the [Angular documentation](https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf):

    ```json
    "security": {
      "allowedHosts": ["yourdomain.com", "*.yourdomain.com"]
    }
    ```

2. Build the application for production:

    ```bash
    npm run build
    ```
