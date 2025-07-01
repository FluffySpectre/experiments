#!/usr/bin/env python3

import subprocess
import requests
import argparse
import sys
import ollama

class GitCommitGenerator:
    def __init__(
        self, llm_url: str = "http://localhost:11434", model: str = "gemma3"
    ):
        self.llm_url = llm_url
        self.model = model

    def get_staged_diff(self) -> str:
        """Get the diff of staged changes"""
        try:
            # Get staged changes with context
            result = subprocess.run(
                ["git", "diff", "--staged"], capture_output=True, text=True, check=True
            )
            return result.stdout
        except subprocess.CalledProcessError as e:
            raise Exception(f"Git error: {e.stderr}")

    def get_staged_files(self) -> list:
        """Get list of staged files"""
        try:
            result = subprocess.run(
                ["git", "diff", "--staged", "--name-only"],
                capture_output=True,
                text=True,
                check=True,
            )
            return [f.strip() for f in result.stdout.split("\n") if f.strip()]
        except subprocess.CalledProcessError as e:
            raise Exception(f"Git error: {e.stderr}")

    def check_staged_changes(self) -> bool:
        """Check if there are any staged changes"""
        staged_files = self.get_staged_files()
        return len(staged_files) > 0

    def generate_commit_message(self, diff: str) -> str:
        """Generate commit message using Ollama API"""
        prompt = f"""
Based on the following git diff of staged changes, generate a concise and descriptive commit message following conventional commit format:

Rules:
- Use conventional commits format: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore
- Keep the description under 50 characters when possible
- Be specific about what changed
- Don't include file names unless necessary for context

Git diff:
{diff}

Generate only the commit message, no explanations and no formatting.
"""

        try:
            response = ollama.chat(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that generates git commit messages following conventional commit format.",
                    },
                    {"role": "user", "content": prompt},
                ],
                # format="json",
                options={"temperature": 0.3, "top_p": 0.8},
            )
            return response["message"]["content"].strip()

        except requests.exceptions.RequestException as e:
            raise Exception(f"LLM API error: {e}")

    def generate_message(self) -> str:
        """Generate commit message based on staged changes"""
        if not self.check_staged_changes():
            raise Exception(
                "No staged changes found. Please stage your changes first with 'git add'."
            )

        diff = self.get_staged_diff()
        if not diff:
            raise Exception("No diff found for staged changes.")

        # Truncate diff if too long (keep first 3000 characters)
        if len(diff) > 3000:
            diff = diff[:3000] + "\n... (diff truncated)"

        return self.generate_commit_message(diff)

def main():
    parser = argparse.ArgumentParser(
        description="Generate Git commit messages using local LLM"
    )
    parser.add_argument(
        "--url",
        default="http://localhost:11434",
        help="LLM API URL (default: http://localhost:11434)",
    )
    parser.add_argument(
        "--model", default="gemma3", help="Model name (default: gemma3)"
    )
    parser.add_argument(
        "--commit",
        action="store_true",
        help="Automatically commit with generated message",
    )
    parser.add_argument(
        "--interactive",
        "-i",
        action="store_true",
        help="Interactive mode - review message before committing",
    )

    args = parser.parse_args()

    generator = GitCommitGenerator(args.url, args.model)

    try:
        print("Analyzing staged changes...")
        commit_message = generator.generate_message()

        print(f"\nGenerated commit message:")
        print(f"'{commit_message}'")

        if args.commit or args.interactive:
            if args.interactive:
                user_input = input("\nUse this message? (y/n/e for edit): ").lower()
                if user_input == "n":
                    print("Commit cancelled.")
                    return
                elif user_input == "e":
                    commit_message = input("Enter your commit message: ")

            # Perform the commit
            try:
                subprocess.run(["git", "commit", "-m", commit_message], check=True)
                print(f"✓ Committed with message: '{commit_message}'")
            except subprocess.CalledProcessError as e:
                print(f"Error committing: {e}")
                sys.exit(1)
        else:
            print("\nTo commit with this message, run:")
            print(f'git commit -m "{commit_message}"')
            print("\nOr use --commit flag to commit automatically")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
