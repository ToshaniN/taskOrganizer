from flask import render_template
from database import agendas, tasks, comments, session
from sqlalchemy import func, exc

class CommentHandler:
    def createNewComment(receivedInfo):
        # comment2task = receivedInfo["comment2task"]
        # comment_text = receivedInfo["comment_text"]
        # newComment = comments(comment2task=comment2task, comment_text=comment_text, status="Active")
        newComment = comments(status="Active")
        for key in receivedInfo:
            setattr(newComment, key, receivedInfo[key])
        try:
            session.add(newComment)
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            addedId = session.query(func.max(comments.id)).first()
            response = {"errCode":0,
                        "datarec": {"id": int(addedId[0]),
                                    "comment2task": newComment.comment2task, 
                                    "comment_text": newComment.comment_text}}
        return response
    
    def updateComment(receivedInfo):
        id = receivedInfo["id"]
        toUpdate = session.query(comments).filter(comments.id==id).first()
        # toUpdate.comment_text = receivedInfo["comment_text"]
        for key in receivedInfo:
            setattr(toUpdate, key, receivedInfo[key])
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            response = {"errCode":0, 
                        "datarec": {"id": id,
                                    "comment2task": toUpdate.comment2task, 
                                    "comment_text": toUpdate.comment_text}}
        return response
    
    def deleteComment(receivedInfo):
        id = receivedInfo["id"]
        toDelete = session.query(comments).filter(comments.id==id).first()
        toDelete.status = "Inactive"
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            response = {"errCode":0, 
                        "datarec": {"id": id,
                                    "comment2task": toDelete.comment2task, 
                                    "comment_text": toDelete.comment_text}}
        return response
