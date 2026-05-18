import praw
import os
from dotenv import load_dotenv
from pprint import pprint
import json
import time

load_dotenv()

username = os.getenv("REDDIT_USERNAME")
password = os.getenv("REDDIT_PASSWORD")
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    username=username,
    password=password,
    user_agent=f"render:{client_id}:v1 (by /u/{username})",
)


def get_latest_posts():
    posts = []
    for submission in reddit.subreddit("manga").new(limit=25):
        post = {
            "data": {
                "title": submission.title,
                "url": submission.url,
                "permalink": submission.permalink,
                "created": int(submission.created),
            }
        }

        posts.append(post)

    print("✅✅ Latest posts:")
    pprint(posts)
    return posts

def get_latest_giveaway_posts():
    posts = []
    subreddits = json.loads(os.getenv("SUB_NAMES"))
    print(f"Fetching from {len(subreddits)} subreddits...")
    for i, subreddit in enumerate(subreddits):
        for submission in reddit.subreddit(subreddit).new(limit=25):
            post = {
                "data": {
                    "title": submission.title,
                    "url": submission.url,
                    "permalink": submission.permalink,
                    "created": int(submission.created),
                    "subreddit": subreddit
                }
            }
    
            posts.append(post)
        if i < len(subreddits) - 1:
            time.sleep(0.1)   # or even remove it completely

    print("✅✅ Latest giveaway posts:")
    pprint(len(posts))
    return posts

def upvote_post(postId):

    username = os.getenv("PERSONAL_USERNAME")
    password = os.getenv("PERSONAL_PASSWORD")
    client_id = os.getenv("PERSONAL_CLIENT_ID")
    client_secret = os.getenv("PERSONAL_CLIENT_SECRET")

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        username=username,
        password=password,
        user_agent=f"render:{client_id}:v1 (by /u/{username})",
    )

    reddit.submission(postId).upvote()


def downvote_post(postId):

    username = os.getenv("PERSONAL_USERNAME")
    password = os.getenv("PERSONAL_PASSWORD")
    client_id = os.getenv("PERSONAL_CLIENT_ID")
    client_secret = os.getenv("PERSONAL_CLIENT_SECRET")

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        username=username,
        password=password,
        user_agent=f"render:{client_id}:v1 (by /u/{username})",
    )

    reddit.submission(postId).downvote()


if __name__ == "__main__":
    print("Fetching latest posts...")
    pprint(get_latest_posts())
