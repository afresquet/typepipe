# Express.js Example

## Usage

From the root of TypePipe run:

```shell
npm install

npm run build

cd examples/express

npm install

npm run dev
```

## Endpoints

- GET /api/user/:id
- POST /api/user
- PUT /api/user/:id
- DELETE /api/user/:id

## Body

For POST and PUT, the body is parsed as JSON.

```json
{
	"name": "John Doe",
	"email": "john@doe.com"
}
```

Both fields are required for POST, and are optional for PUT.
