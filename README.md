# Expat

----

Expat [expat.fi] is a company register that primarily functions as a database for people seeking employment. The basis for the database comes from Yritystietojärjestelmä - Open Data: https://ytj.fi/en/index/opendata.html. In addition to the data from ytj.fi, the database contains links to the companies recruitment web pages and a more extensive system of classification of the companies.

The database utilizes the NACE classification system, (https://ec.europa.eu/eurostat/documents/3859598/5902521/KS-RA-07-015-EN.PDF ) in order to create a comprehensive description of the companies fields of activity. The classification involves the use of up to 5 different NACE codes per company to improve search functionality. The YTJ database uses TOL2008 classification.

## Data preparation:
1. We need to execute a HTTP GET request to "all_companies" endpoint specified on
https://avoindata.prh.fi/en/ytj/swagger-ui

```
curl -X 'GET' 'https://avoindata.prh.fi/opendata-ytj-api/v3/all_companies' -H 'accept: application/zip' -o companies.zip; \
mkdir tmp && \
unzip -j -d tmp companies.zip && \
mv "$(ls tmp/*.json | head -n 1)" companies.json && \
rm -rf tmp companies.zip
```

2. We transform the JSON file sequentially and select only entities with:
* addresses[].type == 1 (physical address)
* names[].endDate == null (exclude defuncted companies)
* addresses[].postOffices[].languageCode == 1 (language: Finnish)
* The following fields:
   * businessId
   * names[].name
   * addresses[].street
   * addresses[].postOffices[].postCode
   * addresses[].postOffices[].city
   * addresses[].buildingNumber
   * addresses[].apartmentNumber

Run

```
jq -c '
  .[] |
    .addresses = (.addresses | map(select(.type == 1))) |
    .names |= map(select(.endDate == null)) |
    .addresses[].postOffices |= map(select(.languageCode == "1")) |
    {
      businessId: .businessId.value,
      name: .names[].name,
      mainBusinessLine: .mainBusinessLine.type,
      website: .website.url,
      street: .addresses[].street,
      postCode: .addresses[].postOffices[].postCode,
      city: .addresses[].postOffices[].city,
      buildingNumber: .addresses[].buildingNumber,
      apartmentNumber: .addresses[].apartmentNumber
    }
' < companies.json > companies-sel.json
```

3. Escape double quotes (") in the .name field.

```
jq -c '.name |= gsub("\""; "\\\"")' companies-sel.json > companies-name-escaped.json
```

4. Escape backslashes (\\) and double quotes (")

```
jq -c '.name |= gsub("\\\\"; "\\\\\\\\") | .name |= gsub("\""; "\\\"")' companies-name-escaped.json > companies-name-backslashes-escaped.json
```

5. Escape backslashes (\\) in .website if .website is not null

```
jq -c 'if .website != null then .website |= gsub("\\\\"; "\\\\\\\\") else . end' companies-name-backslashes-escaped.json > companies-transformed.json
```

## Run the application (for the first time):
1. Clone the "expat-app" repo

```sh
git clone git@github.com:vitalybrazhnikov/expat-app.git
```

2. Create a .env file in the same directory as your docker-compose.yml and define the following variables:

```
EXPAT_APP_PORT=<expat-app-port>
EXPAT_DB_HOST=db
EXPAT_DB_NAME=<your-database-name>
EXPAT_DB_HOST_PORT=<your-host-database-port>
EXPAT_DB_CONTAINER_PORT=<your-container-database-port>
EXPAT_DB_USER=<your-database-username>
POSTGRES_PASSWORD=<your-database-password>
JWT_SIGNING_KEY=<your-jwt-signing-key>
INVITE_CODE=<your-invite-code>
```

3. Create a new Docker volume

```sh
docker volume create expat-db-data
```

4. The project uses Postgres database. Run the Postgres docker image:

```sh
docker run --name=expat-db \
  -v expat-db-data:/var/lib/postgresql/data \
  --env-file .env \
  -p <EXPAT_DB_HOST_PORT>:<EXPAT_DB_CONTAINER_PORT> \
  -d --rm postgres
```

5. Install Database Migration Tool

Install [`golang-migrate`](https://github.com/golang-migrate/migrate) if you haven't already.

6. Create the database:

```sh
make create-db
```
> **Note:** You will be prompted to enter the `POSTGRES_PASSWORD` specified in `.env`.

7. Create tables in the database:

```sh
make migrate
```

8. Connect to the created database:

```sh
cd data_prep
psql -U postgres -h localhost -p <EXPAT_DB_HOST_PORT> -d <EXPAT_DB_NAME>
```

9. Import the NACE codes into the database:

```
\i insert_NACE_codes.sql
```

10. Import companies into the "imported_companies_staging" table:

```
\copy imported_companies_staging(data) FROM 'companies-transformed.json'
```

11. Insert "imported_companies" from the "imported_companies_staging" table:

```sql
INSERT INTO imported_companies (
    businessId, name, mainBusinessLine, website, street, postCode, city, buildingNumber, apartmentNumber
)
SELECT
    data->>'businessId',
    data->>'name',
    data->>'mainBusinessLine',
    data->>'website',
    data->>'street',
    data->>'postCode',
    data->>'city',
    data->>'buildingNumber',
    data->>'apartmentNumber'
FROM imported_companies_staging;
```

12. Delete the "Asuntojen ja asuinkiinteistöjen hallinta" companies

```sql
DELETE FROM imported_companies WHERE mainbusinessline='68202';
```

13. Delete companies which do not have a web site

```sql
DELETE FROM imported_companies WHERE website IS NULL;
```

14. Delete the "imported_companies_staging" table

```sql
DROP TABLE imported_companies_staging;
```

15. Delete companies that do not have main business line
```sql
DELETE FROM imported_companies
WHERE mainbusinessline IS NULL;
```

16. Delete the duplicated companies
```sql
WITH CTE AS (
    SELECT id, 
           name, 
           ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS row_num
    FROM imported_companies
)
DELETE FROM imported_companies
WHERE id IN (SELECT id FROM CTE WHERE row_num > 1);
```

17. Transfer companies from "imported_companies" table to "companies" table:

```sql
INSERT INTO companies (businessId, name, mainBusinessLine, website, street, postCode, city, buildingNumber, apartmentNumber) SELECT ic.businessId, ic.name, ic.mainBusinessLine, ic.website, ic.street, ic.postCode, ic.city, ic.buildingNumber, ic.apartmentNumber FROM imported_companies ic WHERE NOT EXISTS ( SELECT 1 FROM companies c WHERE c.businessId = ic.businessId );
```

18. Stop the Postgres container

To stop the database container, run:

```sh
docker stop expat-db
```

19. Build and run the application and the Postgres containers:

```sh
make build && make run
```