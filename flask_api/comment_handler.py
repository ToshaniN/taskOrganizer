from flask import render_template
from database import agendas, tasks, comments, session
from sqlalchemy import func, exc

class CommentHandler:
    def createNewComment(receivedInfo):
        comment2task = receivedInfo["comment2task"]
        comment_text = receivedInfo["comment_text"]
        newComment = comments(comment2task=comment2task, comment_text=comment_text)
        try:
            session.add(newComment)
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            addedId = session.query(func.max(agendas.id)).first()
            response = {"errCode":0,
                        "datarec": {"id": int(addedId[0]),
                                    "comment2task": comment2task, 
                                    "comment_text": comment_text}}
        return response
