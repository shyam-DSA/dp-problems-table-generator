import os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
import pytest
from knapsack_react_flask.backend.app import (
    solve_knapsack,
    solve_unbounded_knapsack,
    solve_fractional_knapsack,
    solve_subset_sum,
    solve_lcs,
    solve_longest_common_substring,
    solve_scs,
    solve_knapsack_steps
)

def test_solve_knapsack():
    values = [1, 2, 3]
    weights = [1, 2, 3]
    W = 5
    dp = solve_knapsack(values, weights, W)
    assert dp[-1][-1] == 5

def test_solve_unbounded():
    values = [1, 2]
    weights = [2, 3]
    W = 7
    dp = solve_unbounded_knapsack(values, weights, W)
    assert dp[-1][-1] == 4

def test_solve_fractional():
    values = [6, 10]
    weights = [2, 3]
    W = 5
    value = solve_fractional_knapsack(values, weights, W)
    assert pytest.approx(value) == 16

def test_solve_subset_sum():
    values = [3, 1, 5, 9]
    W = 9
    dp = solve_subset_sum(values, W)
    assert dp[-1][W] is True


def test_solve_lcs():
    s1 = "abcde"
    s2 = "ace"
    dp = solve_lcs(s1, s2)
    assert dp[-1][-1] == 3


def test_longest_common_substring():
    s1 = "abcdxyz"
    s2 = "xyzabcd"
    dp, substr = solve_longest_common_substring(s1, s2)
    assert substr == "abcd"


def test_scs():
    s1 = "abac"
    s2 = "cab"
    dp = solve_scs(s1, s2)
    assert dp[-1][-1] == 5


def test_solve_knapsack_steps():
    values = [1, 2, 3]
    weights = [1, 2, 3]
    W = 5
    dp, steps, coords = solve_knapsack_steps(values, weights, W)
    assert dp[-1][-1] == 5
    assert len(steps) == len(values) * (W + 1)
    assert len(coords) == len(steps)
    assert steps[-1][-1][-1] == 5
