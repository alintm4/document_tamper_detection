"""
Main entry point - imports from modular app structure
For backward compatibility, run this file or app.py
"""
from app import app

if __name__ == '__main__':
    app.run(debug=True, port=8081, host='0.0.0.0')
