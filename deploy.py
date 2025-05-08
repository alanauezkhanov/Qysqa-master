from waitress import serve
import ngrok
import os
from app import app
import threading
import webbrowser
import time

def open_browser(url):
    """Open the browser after a short delay"""
    time.sleep(2)  # Give the server a moment to start
    print(f"Opening browser to {url}")
    webbrowser.open(url)

# Configure Ngrok
# You can get your authtoken by signing up at https://dashboard.ngrok.com/signup
ngrok.set_auth_token("2nZgNVyp8oJtvciCPTgzyZoKl41_4SPWF7fNmjPyuZVvxwbxk")

# Get port from environment or use default
port = int(os.environ.get("PORT", 8080))

# Print some information
print("Starting Qysqa with Waitress and Ngrok...")
print(f"Local port: {port}")

try:
    # Set up ngrok tunnel with HTTP protocol only (no HTTPS)
    # This eliminates certificate issues for all clients
    print("Creating HTTP-only tunnel (no certificate issues)...")
    
    # Try newer API style first
    try:
        # For ngrok Python API v1.0+
        listener = ngrok.forward(port, authtoken="2nZgNVyp8oJtvciCPTgzyZoKl41_4SPWF7fNmjPyuZVvxwbxk", 
                                proto="http")
        public_url = listener.url()
    except Exception as e1:
        print(f"Newer API failed, trying legacy API: {e1}")
        # For older ngrok Python API
        tunnel = ngrok.connect(port, 
                              authtoken="2nZgNVyp8oJtvciCPTgzyZoKl41_4SPWF7fNmjPyuZVvxwbxk",
                              bind_tls=False)
        
        # Get the public URL
        if isinstance(tunnel, str):
            # Older versions return the URL directly as a string
            public_url = tunnel
        else:
            # Newer versions return an object with a URL method
            try:
                public_url = tunnel.url()
            except:
                # Another possible format
                public_url = tunnel.public_url
    
    print(f"Waitress serving Flask app on port {port}")
    print(f"Public URL: {public_url}")
    print("\nSHARE THIS URL: Anyone on the internet can access the app with this URL")
    print("The URL will remain valid as long as this program is running")
    
    # Open browser thread
    threading.Thread(target=open_browser, args=(public_url,)).start()
    
    # Start waitress server
    serve(app, host="0.0.0.0", port=port)
except Exception as e:
    print(f"Error setting up Ngrok: {e}")
    print("\nMake sure you've set up your Ngrok authtoken as described in DEPLOYMENT.md")
    print("You can get your authtoken at https://dashboard.ngrok.com/get-started/your-authtoken")
    input("Press Enter to exit...") 