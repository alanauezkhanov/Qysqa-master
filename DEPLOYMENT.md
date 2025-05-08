# Deploying Qysqa with Waitress and Ngrok

This guide will help you deploy the Qysqa educational platform so that it can be accessed by others over the internet.

## Prerequisites

- Python 3.6 or higher
- All project dependencies installed
- Ngrok account (free tier is sufficient)

## Step 1: Install Required Packages

```bash
pip install waitress ngrok
```

## Step 2: Get Your Ngrok Authtoken

1. Sign up for a free account at [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. After signing in, go to [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your authtoken

## Step 3: Set Up Your Authtoken

You have two options:

### Option 1: Environment Variable (Recommended)

Set the NGROK_AUTHTOKEN environment variable:

On Windows:
```
set NGROK_AUTHTOKEN=your_authtoken_here
```

On macOS/Linux:
```
export NGROK_AUTHTOKEN=your_authtoken_here
```

### Option 2: Edit the deploy.py file

Open deploy.py and uncomment this line:
```python
# ngrok.set_auth_token("YOUR_AUTHTOKEN")
```

Replace "YOUR_AUTHTOKEN" with your actual token.

## Step 4: Run the Deployment Script

```bash
python deploy.py
```

The script will:
1. Start your Flask application using Waitress (a production WSGI server)
2. Create a secure tunnel using Ngrok
3. Print the public URL that others can use to access your application
4. Open the URL in your default browser

## Important Notes

- The free tier of Ngrok has some limitations:
  - Sessions last up to 2 hours
  - Limited connections per minute
  - URLs change each time you restart

- For persistent URLs, consider:
  - Upgrading to a paid Ngrok plan
  - Deploying to a proper hosting service like Heroku, PythonAnywhere, or Azure

- Your computer must remain running for the service to be available

## Troubleshooting

- If you see "Failed to establish tunnel: ngrok tunnel quota exceeded", wait until the next day or upgrade your plan
- If your server stops after closing the terminal, consider using a tool like `nohup` (Linux/Mac) or running as a background service (Windows) 