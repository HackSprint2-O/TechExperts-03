from pymongo import MongoClient

def check_mongodb():
    try:
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB Connection Successful!")
        print(f"Server Version: {client.server_info()['version']}")

        # List all databases (excluding system ones)
        all_dbs = client.list_database_names()
        user_dbs = [db for db in all_dbs if db not in ['admin', 'config', 'local']]
        print(f"User Databases: {user_dbs}")

        if 'edubot_db' in all_dbs:
            db = client['edubot_db']
            collections = db.list_collection_names()
            print(f"Collections in edubot_db: {collections}")

            # Check users collection
            if 'users' in collections:
                user_count = db.users.count_documents({})
                print(f"Users Count: {user_count}")
                print("Users:")
                for user in db.users.find({}, {'_id': 0}):
                    print(f"  - Username: {user.get('username')}, Email: {user.get('email')}")

            # Check chat_history collection
            if 'chat_history' in collections:
                chat_count = db.chat_history.count_documents({})
                print(f"Chat History Count: {chat_count}")
                print("Recent Chats:")
                for chat in db.chat_history.find({}, {'_id': 0}).sort('timestamp', -1).limit(3):
                    user_msg = chat.get('user_message', '')[:50]
                    print(f"  - {chat.get('user_email')}: {user_msg}...")
        else:
            print("❌ edubot_db database not found!")

    except Exception as e:
        print(f"❌ MongoDB Error: {e}")

if __name__ == "__main__":
    check_mongodb()
