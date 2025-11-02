# SCSS Variables

This directory contains SCSS variables for the application.

## Usage

### In SCSS files

Import the variables in any SCSS file:

```scss
@import '../styles/variables';

.my-component {
  background-color: $primary-2;
  color: $secondary-b-0;
}
```

### In TypeScript/React components

Use CSS variables in inline styles or className:

```tsx
<div style={{ backgroundColor: 'var(--primary-2)' }}>
  Content
</div>

<div className="primary-2">
  Text with primary-2 color
</div>
```

### Available Variables

#### Primary Colors
- `$primary-0` through `$primary-4`
- CSS variables: `--primary-0` through `--primary-4`
- Utility classes: `.primary-0` through `.primary-4`

#### Secondary A Colors
- `$secondary-a-0` through `$secondary-a-4`
- CSS variables: `--secondary-a-0` through `--secondary-a-4`
- Utility classes: `.secondary-a-0` through `.secondary-a-4`

#### Secondary B Colors
- `$secondary-b-0` through `$secondary-b-4`
- CSS variables: `--secondary-b-0` through `--secondary-b-4`
- Utility classes: `.secondary-b-0` through `.secondary-b-4`

#### Complement Colors
- `$complement-0` through `$complement-4`
- CSS variables: `--complement-0` through `--complement-4`
- Utility classes: `.complement-0` through `.complement-4`

