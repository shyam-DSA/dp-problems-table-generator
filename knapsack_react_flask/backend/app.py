from flask import Flask, request, jsonify
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


INSIGHTS = {
    "01": "Classic 0/1 knapsack solved with DP table. Trace back from dp[n][W] to find chosen items.",
    "unbounded": "Similar to 0/1 but allows multiple use of the same item at each step.",
    "fractional": "Sort by value/weight ratio and take portions greedily.",
    "subset_sum": "Boolean DP where dp[i][t] tells if sum t is possible with first i numbers.",
    "subset_partition": "Check subset sum for half of total array sum to see if partition exists.",
    "lcs": "Classic LCS DP where dp[i][j] stores length of LCS for prefixes.",
    "lcsubstring": "Track consecutive matches for longest common substring.",
    "scs": "Build DP for shortest common supersequence length and reconstruction."
}


def generate_problem(level="medium", ptype="01"):
    """Generate random problem parameters adjusted for the knapsack variant."""

    if ptype in ["lcs", "lcsubstring", "scs"]:
        length_map = {"easy": 4, "medium": 6, "hard": 8}
        m = length_map[level]
        n = length_map[level]
        alphabet = "abcdef"
        s1 = "".join(random.choice(alphabet) for _ in range(m))
        s2 = "".join(random.choice(alphabet) for _ in range(n))
        return s1, s2, m, n

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


def solve_subset_sum(values, W):
    n = len(values)
    dp = [[False] * (W + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = True
    for i in range(1, n + 1):
        for w in range(1, W + 1):
            dp[i][w] = dp[i - 1][w]
            if values[i - 1] <= w:
                dp[i][w] = dp[i][w] or dp[i - 1][w - values[i - 1]]
    return dp


def traceback_subset(dp, values, W):
    i = len(values)
    w = W
    items = []
    while i > 0 and w >= 0:
        if w >= 0 and dp[i][w] and not dp[i - 1][w]:
            items.append(i - 1)
            w -= values[i - 1]
        i -= 1
    return items[::-1]


def traceback_knapsack(dp, values, weights, W):
    i = len(values)
    w = W
    items = []
    while i > 0 and w >= 0:
        if dp[i][w] != dp[i - 1][w]:
            items.append(i - 1)
            w -= weights[i - 1]
        i -= 1
    return items[::-1]


def solve_lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp


def traceback_lcs(dp, s1, s2):
    i, j = len(s1), len(s2)
    seq = []
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            seq.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(seq))


def solve_longest_common_substring(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    max_len = 0
    end_idx = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                if dp[i][j] > max_len:
                    max_len = dp[i][j]
                    end_idx = i
            else:
                dp[i][j] = 0
    substr = s1[end_idx - max_len:end_idx]
    return dp, substr


def solve_scs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + 1
    return dp


def traceback_scs(dp, s1, s2):
    i, j = len(s1), len(s2)
    res = []
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            res.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] < dp[i][j - 1]:
            res.append(s1[i - 1])
            i -= 1
        else:
            res.append(s2[j - 1])
            j -= 1
    while i > 0:
        res.append(s1[i - 1])
        i -= 1
    while j > 0:
        res.append(s2[j - 1])
        j -= 1
    return "".join(reversed(res))


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    level = data.get("level", "medium")
    ptype = data.get("type", "01")
    if ptype in ["lcs", "lcsubstring", "scs"]:
        s1, s2, m, n = generate_problem(level, ptype)
        return jsonify({"s1": s1, "s2": s2, "m": m, "n": n})
    values, weights, W, n = generate_problem(level, ptype)
    return jsonify({"values": values, "weights": weights, "W": W, "n": n})


@app.route("/solve", methods=["POST"])
def solve():
    data = request.get_json()
    knap_type = data.get("type", "01")
    if knap_type in ["lcs", "lcsubstring", "scs"]:
        s1 = data["s1"]
        s2 = data["s2"]
        if knap_type == "lcs":
            dp = solve_lcs(s1, s2)
            seq = traceback_lcs(dp, s1, s2)
            return jsonify({"dp": dp, "result": seq, "insight": INSIGHTS["lcs"]})
        elif knap_type == "lcsubstring":
            dp, substr = solve_longest_common_substring(s1, s2)
            return jsonify({"dp": dp, "result": substr, "insight": INSIGHTS["lcsubstring"]})
        else:
            dp = solve_scs(s1, s2)
            seq = traceback_scs(dp, s1, s2)
            return jsonify({"dp": dp, "result": seq, "insight": INSIGHTS["scs"]})

    values = data["values"]
    weights = data["weights"]
    W = data["W"]
    if knap_type == "unbounded":
        dp = solve_unbounded_knapsack(values, weights, W)
        return jsonify({"dp": dp, "insight": INSIGHTS["unbounded"]})
    elif knap_type == "fractional":
        value = solve_fractional_knapsack(values, weights, W)
        return jsonify({"value": value, "insight": INSIGHTS["fractional"]})
    elif knap_type == "subset_sum":
        dp = solve_subset_sum(values, W)
        possible = dp[len(values)][W]
        items = traceback_subset(dp, values, W) if possible else []
        return jsonify({"dp": dp, "possible": bool(possible), "items": items, "insight": INSIGHTS["subset_sum"]})
    elif knap_type == "subset_partition":
        total = sum(values)
        if total % 2 != 0:
            return jsonify({"possible": False, "insight": INSIGHTS["subset_partition"]})
        target = total // 2
        dp = solve_subset_sum(values, target)
        possible = dp[len(values)][target]
        items = traceback_subset(dp, values, target) if possible else []
        return jsonify({"dp": dp, "possible": bool(possible), "target": target, "items": items, "insight": INSIGHTS["subset_partition"]})
    else:
        dp = solve_knapsack(values, weights, W)
        items = traceback_knapsack(dp, values, weights, W)
        return jsonify({"dp": dp, "items": items, "insight": INSIGHTS["01"]})


if __name__ == "__main__":
    app.run(debug=True)
