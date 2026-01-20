# Deployment Instructions for Railway

To deploy TeleMatic to Railway, follow these steps:

## 1. Prepare Environment Variables
You need to set the following environment variables in your Railway project settings:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `SESSION_SECRET`: A random string for session encryption.
- `NODE_ENV`: Set to `production`.

## 2. PostgreSQL Database
TeleMatic uses PostgreSQL. You can add a PostgreSQL service directly in Railway.
The `DATABASE_URL` will be automatically provided if you use Railway's built-in PostgreSQL.

## 3. Deployment Command
Railway will use the `railway.json` or the default build settings. Ensure the start command is:
```bash
npm run start
```

## 4. Telegram API Keys
The application requires `apiId` and `apiHash` for each Telegram account, which are managed within the app UI. Ensure your server can make outgoing requests to Telegram's servers.

## 5. Build Script
The project includes a `script/build.ts` for bundling. This is triggered by `npm run build`. Railway's Nixpacks will handle this automatically.

