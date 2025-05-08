#!/bin/bash
echo "Starting Qysqa deployment with Waitress and Ngrok..."
echo ""
echo "If you haven't set up your Ngrok authtoken yet, please follow the instructions in DEPLOYMENT.md"
echo ""

# Run the deployment script
python deploy.py

echo ""
echo "Press Enter to exit..."
read 