
from flask import Flask, request, jsonify
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def generate_problem(level='medium'):
    n = {"easy": 3, "medium": 4, "hard": 5}[level]
    W = {"easy": 10, "medium": 20, "hard": 30}[level]
    values = [random.randint(1, 15) for _ in range(n)]
    weights = [random.randint(1, W // 2) for _ in range(n)]
    return values, weights, W, n

def solve_knapsack(values, weights, W):
    n = len(values)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]])
            else:
                dp[i][w] = dp[i-1][w]
    return dp

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    level = data.get('level', 'medium')
    values, weights, W, n = generate_problem(level)
    return jsonify({"values": values, "weights": weights, "W": W, "n": n})

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    values = data['values']
    weights = data['weights']
    W = data['W']
    dp = solve_knapsack(values, weights, W)
    return jsonify({"dp": dp})

if __name__ == '__main__':
    app.run(debug=True)
