# List all users
read -p $'\nList user with id 1'
curl -X GET http://localhost:3000/users?id=1

# Create User 
# @required params: name, email, username, password, program, year_of_study,city
read -p $'\nCreate User'
curl -X POST \
    -H 'Content-Type: application/json; charset=utf-8' \
    -d '{"username": "first", "password": "1234", "email": "first@email.com", "name":"first user", "program": "UofT Engineering", "year_of_study":3}' \
http://localhost:3000/users

# List all users
read -p $'\nList all users'
curl -X GET http://localhost:3000/users

# Delete that user
read -p $'\nDelete User with id 1'
curl -X DELETE http://localhost:3000/users?id=1

# Create Study Group
read -p $'\nCreate 309 Study Group'
curl -X POST \
    -H 'Content-Type: application/json; charset=utf-8' \
    -d '{"groupname": "CSC309 Study Group", "description": "study for programming on the web.", "room": "BA 1210", "link":"uoft.com/309", "day": "Wed", "time": "1PM"}' \
http://localhost:3000/studygroups

read -p $'\nCreate 343 Study Group'
curl -X POST \
    -H 'Content-Type: application/json; charset=utf-8' \
    -d '{"groupname": "CSC343 Study Group", "description": "study for csc343 databases.", "room": "BA 1245", "link":"uoft.com/343", "day": "Fri", "time": "7PM"}' \
http://localhost:3000/studygroups

read -p $'\nCreate No Name Study Group'
curl -X POST \
    -H 'Content-Type: application/json; charset=utf-8' \
    -d '{"groupname": "NoName", "description": "study for HPS100.", "room": "BA 1245", "link":"uoft.com/HPS100", "day": "Mon", "time": "2PM"}' \
http://localhost:3000/studygroups

# List all study groups
read -p $'\nList all studygroups'
curl -X GET http://localhost:3000/studygroups

read -p $'\nModify No Name Study Group'
curl -X PUT \
    -H 'Content-Type: application/json; charset=utf-8' \
    -d '{"new_name": "HPS100 Study Group"}' \
http://localhost:3000/studygroups?id=3

read -p $'\nDelete No Name Study Group'
curl -X DELETE http://localhost:3000/studygroups?id=4

# List all study groups
read -p $'\nList all studygroups'
curl -X GET http://localhost:3000/studygroups


