from flask import Flask, request, jsonify
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def generate_problem(level="medium"):
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
            if weights[i - 1] <= w:
                dp[i][w] = max(
                    dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]
                )
            else:
                dp[i][w] = dp[i - 1][w]
    return dp


def solve_unbounded_knapsack(values, weights, W):
    n = len(values)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], values[i - 1] + dp[i][w - weights[i - 1]])
    return dp


def solve_fractional_knapsack(values, weights, W):
    ratio_items = sorted([(v / w, v, w) for v, w in zip(values, weights)], reverse=True)
    remaining = W
    total = 0.0
    for ratio, value, weight in ratio_items:
        if remaining <= 0:
            break
        if weight <= remaining:
            total += value
            remaining -= weight
        else:
            total += ratio * remaining
            remaining = 0
    return total


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    level = data.get("level", "medium")
    values, weights, W, n = generate_problem(level)
    return jsonify({"values": values, "weights": weights, "W": W, "n": n})


@app.route("/solve", methods=["POST"])
def solve():
    data = request.get_json()
    values = data["values"]
    weights = data["weights"]
    W = data["W"]
    knap_type = data.get("type", "01")
    if knap_type == "unbounded":
        dp = solve_unbounded_knapsack(values, weights, W)
        return jsonify({"dp": dp})
    elif knap_type == "fractional":
        value = solve_fractional_knapsack(values, weights, W)
        return jsonify({"value": value})
    else:
        dp = solve_knapsack(values, weights, W)
        return jsonify({"dp": dp})


if __name__ == "__main__":
    app.run(debug=True)
