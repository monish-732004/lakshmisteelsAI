import sys
import os

# Add the api directory to the Python path to ensure 'app' package is found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
