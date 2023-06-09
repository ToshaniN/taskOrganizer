from database import agendas, session
from sqlalchemy import func
from makeResponse import MakeResponse

class AgendaHandler:
    def createNewAgenda(receivedInfo):
        newAgenda = agendas(status="Active")
        for key in receivedInfo:
            setattr(newAgenda, key, receivedInfo[key])
        try:
            session.add(newAgenda)
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            addedId = session.query(func.max(agendas.id)).first()
            justAdded = session.query(agendas).filter(agendas.id==addedId[0]).first()
            datarec = MakeResponse.createResponse(justAdded)
            response = {"errCode":0,
                        "datarec": datarec}
        return response
    

    def updateAgenda(receivedInfo):
        id = receivedInfo["id"]
        toUpdate = session.query(agendas).filter(agendas.id==id).first()
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
                        "datarec": datarec }   
        return response
    

    def deleteAgenda(receivedInfo):
        id = receivedInfo["id"]
        toDelete = session.query(agendas).filter(agendas.id==id).first()
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
