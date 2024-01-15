To see API specification and try the different endpoints:
- Lift the Docker Compose environment with `docker-compose up --build`.
- Access to http://localhost:3000/api
- Click on any of the drop-downs and click on the `Try it out` button.

Please use this Swagger page as the API Reference.

To insert some initial data into the database to add some users to test with, after deploy the docker-compose, run the following command:
```
docker exec -it db-api npm run seed
```
If you get this message:
```
DEBUG Data seeded successfully
```
means that everything went alright and you have three users to test with: fgata-va, javgonza and pdiaz-pa
