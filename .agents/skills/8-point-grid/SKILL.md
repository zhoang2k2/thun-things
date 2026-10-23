---
name: 8-point-grid
description: 8-point grid spacing rules for UI layout. Use when setting or reviewing padding, margin, gap, line-height, component sizes, or spacing tokens, or when fixing or auditing inconsistent spacing, even if the user does not mention an 8-point grid. Do not use for font sizes, colors, or breakpoints alone.
---

# 8-point grid

Use multiples of 8px for spacing, with a 4px half-step for tight spacing. This removes arbitrary values and keeps spacing consistent across the product.

If the project already defines a spacing scale or tokens, use them instead of introducing new values. If the project uses rem, convert at 16px = 1rem.

## Spacing scale

| px  | rem  | Typical use                                               |
| :-- | :--- | :-------------------------------------------------------- |
| 4   | 0.25 | Icon-to-text gap, tight inline spacing                    |
| 8   | 0.5  | Spacing between related elements, small component padding |
| 12  | 0.75 | Padding in dense UI, such as table cells                  |
| 16  | 1    | Default component padding, gap between related items      |
| 24  | 1.5  | Spacing between component groups, card padding            |
| 32  | 2    | Spacing within a section                                  |
| 48  | 3    | Spacing between major sections                            |
| 64  | 4    | Large section spacing                                     |
| 96  | 6    | Page-level spacing                                        |

Above 96px, continue in multiples of 8px.

## Rules

- Use a soft grid: every padding, margin, and gap is a multiple of 8px, or 4px for the half-step. Element content, such as a line of text, does not need to align to the grid.
- Use the 4px half-step only for icons, dense UI, and spacing next to text. Use 8px steps everywhere else.
- Set line-heights to multiples of 4px so text blocks stay on the grid.
- Do not use off-grid spacing values such as 5px, 13px, or 15px.

## What the grid applies to

Apply the grid to:

- Padding, margin, and gap.
- Fixed component heights and widths, including borders. A 1px border counts inside the size, not on top of it.
- Icon bounding boxes. The icon glyph inside may vary in size to look visually balanced.

Do not force the grid onto:

- Font sizes, which follow the type scale.
- Border, outline, and divider thickness.
- Fluid container widths. Keep the padding and gap inside and around them on the grid.

## Component heights and targets

- Make interactive controls, such as buttons, inputs, and selects, a multiple of 4px tall.
- Give controls in the same row the same height.
- Define a small set of control sizes in the project, such as small, medium, and large, and reuse them. Do not set one-off heights.
- Make interactive targets at least 24x24px. On touch interfaces, follow the platform minimum, typically 44px to 48px. When the visible control is smaller, extend the hit area with padding.

## Auditing existing spacing

1. Find hardcoded or arbitrary spacing values in styles and markup.
2. List every value that is not on the grid. Do not change them all at once, because some may be intentional.
3. For each value, propose the nearest on-grid value. Leave values from the "do not force" list unchanged.
4. After changes, check the layout at every breakpoint the project supports.

When a value breaks the grid, explain why and give the on-grid alternative. If the user has a deliberate reason to keep it, keep it and note it as an exception.
