
Overview

This backend organizes problem generators as “agents” for various dynamic programming (DP) problem types. Each agent returns randomized, valid problems according to requested parameters. Agents are defined in knapsack_react_flask/backend/app.py and are accessed via Flask API routes.
Agent Development Tips

    Add or update agents by extending the generate_problem(level, ptype) function.

    Match existing patterns for parameters:

        ptype for problem type (e.g., "01", "lcs", "subset_sum", etc.)

        level for difficulty ("easy", "medium", "hard")

    Ensure all returned data is JSON serializable.

    Use clear and consistent naming (snake_case) for new agent types.

    Update any relevant frontend selectors if you add a new agent type.

How to Add a New Agent

    Extend the Generator:
    Add a new branch in the generate_problem function for your ptype.

    Parameter Handling:
    Set up your agent to handle difficulty levels and return all necessary fields.

    API Consistency:
    Agents must return all required problem data for both frontend rendering and answer checking.

    Example Pattern:

    def generate_problem(level="medium", ptype="new_agent"):
        if ptype == "new_agent":
            # Set up difficulty parameters
            # Generate random instance
            return <problem_data>

Testing Instructions

    Add tests for new agents in /tests to ensure all levels and edge cases are covered.

    Run all tests before merging:

    cd knapsack_react_flask/backend
    pytest

    For focused testing, you can call specific endpoints using Postman or curl.

    Fix any failing tests or type errors until all checks pass.

    Always add or update tests for code you change.

API Usage

    API endpoint:
    POST /generate-problem
    Expects JSON body:

    {
      "ptype": "lcs",
      "level": "medium"
    }

    All agents should return data as JSON objects.

PR Instructions

    Title format: [backend] Add <problem_type> agent

    Summary: Briefly describe supported parameters and how to test your new agent.
