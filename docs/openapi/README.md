# FluentCart OpenAPI Documentation

This is a separate VitePress installation for experimenting with OpenAPI documentation using `vitepress-openapi`.

## Setup

Dependencies have been installed. This is an independent VitePress installation separate from the parent directory.

## Usage

### Development Server

```bash
npm run dev
```

This will start the VitePress development server at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

The OpenAPI specification is configured globally in `.vitepress/theme/index.js`. The current setup:

- Imports the OpenAPI spec from `public/openapi.json`
- Uses `useOpenapi` composable to set the specification globally
- Enables the vitepress-openapi theme

## Adding OpenAPI Specifications

### Global Configuration (Current Setup)

1. Place your OpenAPI specification file (`.json` or `.yaml`) in the `public/` directory
2. Import it in `.vitepress/theme/index.js`:

```javascript
import spec from '../../public/openapi.json'

useOpenapi({ 
  spec, 
})
```

### Using Components in Markdown

Once the spec is configured globally, you can use components in your markdown files:

- `<OASpec />` - Display the complete OpenAPI specification
- `<OAOperation path="/files" method="get" />` - Display a specific operation

## Documentation

For more details, refer to the [vitepress-openapi documentation](https://vitepress-openapi.vercel.app/guide/getting-started.html).

