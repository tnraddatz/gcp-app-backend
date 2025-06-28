# GCP App Backend

This is the Node.js backend for the GCP application, integrated with Google OAuth 2.0.

## Setup and Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables (`.env` file):**
    Create a file named `.env` in the `backend` directory with the following content. Replace the placeholder values with your actual Google OAuth credentials.

    ```
    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
    NODE_ENV=development
    ```

    *   `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID.
    *   `GOOGLE_CLIENT_SECRET`: Your Google OAuth 2.0 Client Secret.
    *   `NODE_ENV`: Set to `development` for local testing.

3.  **Run Locally:**
    ```bash
    node index.js
    ```
    The backend will run on `http://localhost:8080`.

## Deployment to Google Cloud Run

To deploy this backend to Google Cloud Run, follow these steps:

1.  **Ensure `gcloud` CLI and Docker are installed and authenticated.**

2.  **Configure Environment Variables in Cloud Run:**
    When deploying to Cloud Run, you must configure the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as environment variables directly in the Cloud Run service settings. The `NODE_ENV` will automatically be set to `production` by Cloud Run.

    You can do this via the Google Cloud Console (Cloud Run service details -> REVISION tab -> CONTAINER, VARIABLES & SECRETS section) or using the `gcloud` CLI during deployment.

3.  **Build and Push Docker Image:**
    Navigate to the `backend` directory in your terminal. Build the Docker image and push it to Google Container Registry (GCR). Remember to replace `gen-lang-client-0466337224` with your actual GCP Project ID.

    ```bash
    docker build --platform linux/amd64 -t gcr.io/gen-lang-client-0466337224/gcp-app-backend .
    docker push gcr.io/gen-lang-client-0466337224/gcp-app-backend
    ```

4.  **Deploy to Cloud Run:**
    Deploy the image to Cloud Run. The service name will be `gcp-app-backend`. Replace `gen-lang-client-0466337224` with your actual GCP Project ID.

    ```bash
    gcloud run deploy gcp-app-backend \
      --image gcr.io/gen-lang-client-0466337224/gcp-app-backend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --project gen-lang-client-0466337224 \
      --set-env-vars GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
    ```
    **Important:** Replace `YOUR_GOOGLE_CLIENT_ID` and `YOUR_GOOGLE_CLIENT_SECRET` with your actual values. For production, consider using Secret Manager for sensitive variables.

## Cloud Run Deployment Details

- **Service Name:** `gcp-app-backend`
- **Service URL:** `https://gcp-app-backend-530548492160.us-central1.run.app`

This URL is crucial for your frontend to communicate with the backend. Ensure your frontend's `fetch` calls are updated to use this URL for API requests.