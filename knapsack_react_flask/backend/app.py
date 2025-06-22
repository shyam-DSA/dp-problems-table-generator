from flask import Flask, request, jsonify
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


INSIGHTS = {
    "01": (
        "Classic 0/1 knapsack solved using a DP table where dp[i][w] represents "
        "the best value with the first i items and capacity w. Trace back from "
        "dp[n][W] to list chosen item indices."
    ),
    "unbounded": (
        "Unbounded knapsack also uses a DP table but each item may be reused "
        "multiple times by looking at the current row when adding an item."
    ),
    "fractional": (
        "Items are sorted by value/weight ratio and taken greedily. A fraction of "
        "the next item may be taken when capacity is nearly full."
    ),
    "subset_sum": (
        "Boolean DP where dp[i][t] states if a sum t can be formed using the "
        "first i numbers. Trace back from the target to see the chosen numbers."
    ),
    "subset_partition": (
        "Check subset sum for half of the total array sum to determine if a "
        "partition exists and trace back the subset achieving that sum."
    ),
}


def generate_problem(level="medium", ptype="01"):
    """Generate random problem parameters adjusted for the knapsack variant."""

    if ptype in ["subset_sum", "subset_partition"]:
        n = {"easy": 4, "medium": 5, "hard": 6}[level]
        values = [random.randint(1, 15) for _ in range(n)]
        weights = list(values)
        if ptype == "subset_sum":
            W = random.randint(1, sum(values))
        else:
            W = sum(values) // 2
        return values, weights, W, n

    if ptype == "unbounded":
        n = {"easy": 3, "medium": 4, "hard": 5}[level]
        W = {"easy": 15, "medium": 25, "hard": 35}[level]
        values = [random.randint(1, 10) for _ in range(n)]
        weights = [random.randint(1, W // 4) for _ in range(n)]
        return values, weights, W, n

    if ptype == "fractional":
        n = {"easy": 3, "medium": 4, "hard": 5}[level]
        base_W = {"easy": 10, "medium": 20, "hard": 30}[level]
        values = [random.randint(1, 20) for _ in range(n)]
        weights = [random.randint(1, base_W // 2) for _ in range(n)]
        # force capacity smaller than total weight to exercise fractions
        W = min(base_W, max(1, sum(weights) - random.randint(1, n)))
        return values, weights, W, n

    n = {"easy": 3, "medium": 4, "hard": 5}[level]
    W = {"easy": 10, "medium": 20, "hard": 30}[level]
    values = [random.randint(1, 15) for _ in range(n)]
    weights = [random.randint(1, W // 2) for _ in range(n)]
    return values, weights, W, n


def solve_knapsack(values, weights, W, *, return_states=False):
    """Solve 0/1 knapsack. Optionally capture each DP table state."""
    n = len(values)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    states = []
    for i in range(1, n + 1):
        for w in range(W + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(
                    dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]
                )
            else:
                dp[i][w] = dp[i - 1][w]
        if return_states:
            states.append([row[:] for row in dp])
    return (dp, states) if return_states else dp


def solve_unbounded_knapsack(values, weights, W, *, return_states=False):
    """Solve unbounded knapsack. Optionally capture each DP state."""
    n = len(values)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    states = []
    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], values[i - 1] + dp[i][w - weights[i - 1]])
        if return_states:
            states.append([row[:] for row in dp])
    return (dp, states) if return_states else dp


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


def solve_subset_sum(values, W, *, return_states=False):
    """Subset sum DP. Optionally capture each DP state."""
    n = len(values)
    dp = [[False] * (W + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = True
    states = []
    for i in range(1, n + 1):
        for w in range(1, W + 1):
            dp[i][w] = dp[i - 1][w]
            if values[i - 1] <= w:
                dp[i][w] = dp[i][w] or dp[i - 1][w - values[i - 1]]
        if return_states:
            states.append([row[:] for row in dp])
    return (dp, states) if return_states else dp


def traceback_subset(dp, values, W, *, return_path=False):
    """Trace back chosen numbers. Optionally return path coordinates."""
    i = len(values)
    w = W
    items = []
    path = []
    while i > 0 and w >= 0:
        if w >= 0 and dp[i][w] and not dp[i - 1][w]:
            items.append(i - 1)
            path.append((i, w))
            w -= values[i - 1]
        i -= 1
    items.reverse()
    path.reverse()
    return (items, path) if return_path else items


def traceback_knapsack(dp, values, weights, W, *, return_path=False):
    """Trace back chosen items. Optionally return path coordinates."""
    i = len(values)
    w = W
    items = []
    path = []
    while i > 0 and w >= 0:
        if dp[i][w] != dp[i - 1][w]:
            items.append(i - 1)
            path.append((i, w))
            w -= weights[i - 1]
        i -= 1
    items.reverse()
    path.reverse()
    return (items, path) if return_path else items


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    level = data.get("level", "medium")
    ptype = data.get("type", "01")
    values, weights, W, n = generate_problem(level, ptype)
    return jsonify({"values": values, "weights": weights, "W": W, "n": n})


@app.route("/solve", methods=["POST"])
def solve():
    data = request.get_json()
    values = data["values"]
    weights = data["weights"]
    W = data["W"]
    knap_type = data.get("type", "01")
    if knap_type == "unbounded":
        dp, states = solve_unbounded_knapsack(values, weights, W, return_states=True)
        items, path = traceback_knapsack(dp, values, weights, W, return_path=True)
        return jsonify({"dp": dp, "states": states, "items": items, "path": path,
                        "insight": INSIGHTS["unbounded"]})
    elif knap_type == "fractional":
        value = solve_fractional_knapsack(values, weights, W)
        return jsonify({"value": value, "insight": INSIGHTS["fractional"]})
    elif knap_type == "subset_sum":
        dp, states = solve_subset_sum(values, W, return_states=True)
        possible = dp[len(values)][W]
        items, path = (traceback_subset(dp, values, W, return_path=True) if possible else ([], []))
        return jsonify({"dp": dp, "states": states, "possible": bool(possible),
                        "items": items, "path": path, "insight": INSIGHTS["subset_sum"]})
    elif knap_type == "subset_partition":
        total = sum(values)
        if total % 2 != 0:
            return jsonify({"possible": False, "insight": INSIGHTS["subset_partition"]})
        target = total // 2
        dp, states = solve_subset_sum(values, target, return_states=True)
        possible = dp[len(values)][target]
        items, path = (traceback_subset(dp, values, target, return_path=True) if possible else ([], []))
        return jsonify({"dp": dp, "states": states, "possible": bool(possible),
                        "target": target, "items": items, "path": path,
                        "insight": INSIGHTS["subset_partition"]})
    else:
        dp, states = solve_knapsack(values, weights, W, return_states=True)
        items, path = traceback_knapsack(dp, values, weights, W, return_path=True)
        return jsonify({"dp": dp, "states": states, "items": items, "path": path,
                        "insight": INSIGHTS["01"]})


if __name__ == "__main__":
    app.run(debug=True)
