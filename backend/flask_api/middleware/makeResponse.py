import datetime

class MakeResponse:
    # Turn a row into a json object to return as api call response
    def createResponse(values):
        toReturn = {}
        for key in values.__table__.columns:
            value = getattr(values, key.name)
            if (isinstance(value, datetime.datetime)):
                value = str(value)
            toReturn[key.name] = value
        return toReturn