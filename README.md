# QueRKode

This is a simple webservice that combines two nice features:
a url-redirect with a qr-code generator.
It allows you to use so called 'dynamic QR Codes' a for some reason quiet
expensive feature.

In order to use a dynamic QR code you need a static url that looks up a
destination in a database and redirects the client to that url. Its also nice
to know some metrics of that QR-code so each resolve action is stored in a
dedicated statistics table.

While its nice to have a fluffy user-interface with streamlined UX,
the main interface is api-driven.
This way a remote application can create, update and remove a url using a simple
GET call.

It is build using

- nextjs - for handling the routing and a nice developer experience
- prisma - for database access and streamlined migrations
- qrcode - for generating a qr-code from data
- sharp - for manipulating the qr-code image, adding a overlay, scaling
- axios - for a very simple ui

## Process

As the service is hosted on a public domain, it only needs to store a 'key' for a url:

```
trace.example.com
  https://trace.example.com/some-key
```

`some key` is stored in the dynamicUrl table and has a destination value

```
select destination from DynamicUrl where key="some key";
```

now the user gets redirected to the destination using http-headers

```
  Location: ${destination}
```

The QR-Code also only gets the key, compiles the URL with the key and hostname
and combines the resulting image with a optional overlay.
The process is pure and not related to any database request.

## API

To create/update/delete a dynamic url use the manage api endpoints:

`axios.get('/api/manage/create/some-key/https%3A%2F%2Fexample.org%2Fsome-slug')`

creates the database entry for 'some-key' storing the url as destination. When
the key already exists, it will return a error.

`axios.get('/api/manage/update/some-key/https%3A%2F%2Fexample.org%2Fsome-other-slug')`

updates a existing key with the new destination. When the key does not exist,
it will return a error.

`axios.get('/api/manage/remove/some-key')`

removes a existing key. When the key does not exist, it will return a error.

on production, you'll need to set a Authorization Header:

```
    axios.get(
      '/api/manage/remove/some-key',
      {
        headers: { 'Authorization', 'Bearer: SomeSecretValue' }
      }
    );
```

In order to get a QR-code image for any key on the domain, use the `/api/qr`
endpoint:

```
    axios.get(
      `/api/qr/${encodeURIComponent(key)}?size=128&overlay=default&format=png&uppercase=1`
    )
```

As this uses the resources of your host, this endpoint is also secured by the
Authorization header.

key - the key for the url: This will be added to the URL in the qr-code:
`URL:https://example.com/key`

Those options are optional:
size - size of the qr-code in pixels
overlay - use a overlay that is stored in `/public/overlays`
format - generate the image as png or jpeg
uppercase - make the string in the URL use upper case characters only. This
simplifies the QRCode and makes it easier to read if printed very small.

## Configuration

This service has few configuration options:
`NEXT_PUBLIC_HOST` - this is the public fqdn like `https://trace.example.org`
This must be set at container build time
`AUTH_BEARER` - this is a secret that needs to be set in production to
avoid others changing your codes
`AUTH_NONE=YES` - this is a developer set auth that bypasses the authorization
checks. DO NOT USE IN PRODUCTION!

The database also needs configuration, provide a Prisma connection string
in `prisma/.env` before build or by setting
`DATABASE_URL=mysql://username:password@dbhostname:3306/dbname` in the
.env.local for deployment

## Customize

Depending on your needs you may want to extend the codebase for a more
sophisticated image transformation or adding more overlays.
Fork and edit the `pages/api/qr/[key].ts` to your needs

There is a very basic ui that allows you to create the qr-code on the page.
Maybe you want to enhance that, but honestly - dont. use a dedicated application
to create a nice user-interface

## Deployment

To deploy this service, just build the runner-image along with a appropriate
.env.production, then start the image on any host with a public DNS and
preferably a https reverse proxy:

```
  build:
    run: |
      echo "NEXT_PUBLIC_HOST=${mydomain}" > .env.production
      export DOCKER_BUILDKIT=1
      docker build -t "${registry}/querkode:latest" . --target runner
      docker push "${registry}/querkode:latest"
```

On your hosting provider you then pull the image and pass the secret values

```
  get_secrets.sh > /absolute/path/to/.env.local
  docker pull "${registry}/querkode:latest"
  docker run -d \
    --restart=always \
    --env-file /absolute/path/to/.env.local \
    --name="querkode" \
    "querkode:latest"
```

## Usage

usage in docker-compose for local development:

```
services:

  querkode:
    depends_on:
      - querkode-rdb
    build:
      context: ./querkode
      target: devrunner
    restart: unless-stopped
    ports:
      - "127.0.0.1:1902:1902"
      # uncomment to allow node-inspect in local browser
      # - "127.0.0.1:9229:9229"
    networks: &querkode-networks
      querkode-rdb-net:
        aliases:
          - querkode
    volumes:
      - ./querkode:/app
      - ./dev_modules/querkode/node_modules:/app/node_modules
      - ./dev_modules/querkode/.next:/app/.next
      - ./dev_modules/querkode/yarn-cache:/usr/local/share/.cache/yarn
    profiles:
      - console
      - task

  querkode-rdb:
    image: mysql:8
    restart: unless-stopped
    environment:
      - MYSQL_DATABASE=querkode
      - MYSQL_ROOT_PASSWORD=password
    command: [mysqld, --skip-name-resolve, --mysql-native-password=ON, --max-connections=1000]
    hostname: rdb
    ports:
      - '3306'
    #   - "127.0.0.1:3306:3306"
    cap_add:
      - SYS_NICE # CAP_SYS_NICE
    networks:
      querkode-rdb-net:
        aliases:
          - rdb
    volumes:
      - ./config/querkode-rdb/:/docker-entrypoint-initdb.d/
      # ^^- execute init scripts, only executed when /var/lib/mysql is empty
      - ./dev_modules/querkode-rdb:/var/lib/mysql
      # ^^- make sure this is a ramdisk to get some performance
    profiles:
      - console
      - task

  task-querkode-shell:
    depends_on:
      - querkode-rdb
    build:
      context: ./querkode
      target: devrunner
    stdin_open: true
    tty: true
    networks: *querkode-networks
    volumes_from:
      - querkode
    profiles:
      - task

networks:
  querkode-rdb-net:
```
