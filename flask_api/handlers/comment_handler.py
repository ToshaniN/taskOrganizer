from orm.database import comments, session
from sqlalchemy import func
from middleware.makeResponse import MakeResponse

class CommentHandler:
    def createNewComment(receivedInfo):
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
            justAdded = session.query(comments).filter(comments.id==addedId[0]).first()
            datarec = MakeResponse.createResponse(justAdded)
            response = {"errCode":0,
                        "datarec": datarec}
        return response
    

    def updateComment(receivedInfo):
        id = receivedInfo["id"]
        toUpdate = session.query(comments).filter(comments.id==id).first()
        for key in receivedInfo:
            setattr(toUpdate, key, receivedInfo[key])
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            datarec = MakeResponse.createResponse(toUpdate)
            response = {"errCode":0, 
                        "datarec": datarec}
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
            datarec = MakeResponse.createResponse(toDelete)
            response = {"errCode":0, 
                        "datarec": datarec}
        return response


    def getComments(receivedInfo):
        comment2task = receivedInfo["comment2task"]
        try:
            commentList = session.query(comments).filter(comments.comment2task==comment2task, comments.status=="Active")
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            print(str(err))
            return response
        datarec = []
        if commentList is not None:
            for comment in commentList:
                datarec.append(MakeResponse.createResponse(comment))
        response = {"errCode":0, 
                    "datarec": datarec}
        return response