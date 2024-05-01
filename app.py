import prawmanga
import traceback
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.head("/")
def read_root_head():
    return {"message": "Hello World"}

@app.get("/")
def root():
    return {"message": "Hello World"}


@app.get("/latestposts")
def latestposts():
    try:
        return prawmanga.get_latest_posts()
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Couldn't get latest posts: {traceback.format_exception_only(type(e), e)}",
        )


@app.get("/upvote/{postId}")
def upvote(postId):
    try:
        prawmanga.upvote_post(postId)
        return {"message": "Post upvoted"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Couldn't upvote post: {traceback.format_exception_only(type(e), e)}",
        )


@app.get("/downvote/{postId}")
def downvote(postId):
    try:
        prawmanga.downvote_post(postId)
        return {"message": "Post downvoted"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Couldn't downvote post: {postId}: {traceback.format_exception_only(type(e), e)}",
        )

