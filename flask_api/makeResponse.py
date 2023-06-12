import datetime

class MakeResponse:
    def createResponse(values):
        toReturn = {}
        for key in values.__table__.columns:
            value = getattr(values, key.name)
            if (isinstance(value, datetime.datetime)):
                value = str(value)
            toReturn[key.name] = value
        return toReturn