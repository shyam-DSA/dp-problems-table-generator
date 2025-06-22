# DP Problems Table Generator

This project contains a small Flask backend and React frontend for generating and visualizing dynamic programming problems such as knapsack variants.

## Setup

1. **Install Python dependencies**
   ```bash
   cd knapsack_react_flask/backend
   pip install -r requirements.txt
   ```

2. **Run the Flask server**
   ```bash
   python app.py
   ```
   The server will start on `http://localhost:5000`.

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the React development server**
   ```bash
   npm start
   ```
The React app runs on `http://localhost:3000` and expects the Flask backend on port `5000`.

## Versioning

Application version information is stored in `version.js` at the repository root. The frontend displays the version and last update time in the bottom right corner.

## Usage

- Use the interface to generate and solve different knapsack problems.
- Click **Solve** to visualize the dynamic programming table and see which items were selected.
- The "Download PDF" button exports the current view as a PDF.

