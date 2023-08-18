from app import app

if __name__ == "__main__":
    print("Starting api server")
    app.run(debug=True, host='api_server', port=5000)
