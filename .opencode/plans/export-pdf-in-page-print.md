# Export PDF: Replace New Tab with In-Page Print Dialog

## Problem
Both "Export PDF" buttons open a new browser tab to trigger the print dialog. This:
- Can be blocked by popup blockers
- Loses page context (user navigates away)
- Is a jarring UX

## Solution
Replace `window.open(url, "_blank")` with a **hidden iframe** approach:
1. Create a hidden `<iframe>` element (zero-size, off-screen)
2. Set the blob URL as the iframe `src` and append to `document.body`
3. On iframe `load`, call `iframe.contentWindow.print()` — opens native print dialog in-page
4. On `afterprint`, remove iframe and revoke blob URL
5. Remove the embedded `<script>window.onload = () => window.print();</script>` (print triggered from parent instead)

## Files to Change

### 1. `src/app/admin/application/_components/ExportPDFButton.tsx`
- Remove `<script>window.onload = () => window.print();</script>` from HTML template (line 596)
- Replace `window.open` block (lines 600-608) with hidden iframe creation + `contentWindow.print()` + cleanup

### 2. `src/app/admin/members/[id]/_components/ExportMemberPDFButton.tsx`
- Remove `<script>window.onload = () => window.print();</script>` from HTML template (line 661)
- Replace `window.open` block (lines 665-673) with hidden iframe creation + `contentWindow.print()` + cleanup

## Files NOT Changed (already use in-page print)
- `src/components/qr/QRDownloader.tsx` — uses `useReactToPrint`
- `src/components/qr/EvaluationQRDownloader.tsx` — uses `useReactToPrint`
- `src/app/admin/events/[eventId]/registration-list/print/_components/NametagPrintPage.tsx` — uses `useReactToPrint`

## Implementation Pattern (same for both files)

```typescript
const blob = new Blob([html], { type: "text/html" });
const url = URL.createObjectURL(blob);

const iframe = document.createElement("iframe");
iframe.style.position = "fixed";
iframe.style.right = "0";
iframe.style.bottom = "0";
iframe.style.width = "0";
iframe.style.height = "0";
iframe.style.border = "0";
iframe.src = url;
document.body.appendChild(iframe);

const cleanup = () => {
  window.removeEventListener("afterprint", cleanup);
  iframe.remove();
  URL.revokeObjectURL(url);
};

iframe.onload = () => {
  iframe.contentWindow?.print();
  window.addEventListener("afterprint", cleanup);
};
```

## Verification
- `bun run biome:check` — lint/format
- `bun run build` — ensure no type errors
- Manual test: click "Export PDF" on application detail page and member detail page — print dialog should appear without opening a new tab
