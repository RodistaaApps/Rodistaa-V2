# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog "Server Error" [ref=e4]:
    - generic [ref=e6]:
      - navigation [ref=e8]:
        - button "previous" [disabled] [ref=e9]:
          - img "previous" [ref=e10]
        - button "next" [disabled] [ref=e12]:
          - img "next" [ref=e13]
        - generic [ref=e15]: 1 of 1 error
        - generic [ref=e16]:
          - text: Next.js (14.2.33) is outdated
          - link "(learn more)" [ref=e18] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
      - heading "Server Error" [level=1] [ref=e19]
      - paragraph [ref=e20]: "Error: Cannot find module 'C:\\Users\\devel\\Desktop\\Rodistaa\\node_modules\\.pnpm\\rc-util@5.44.4_react-dom@18.3.1_react@18.2.0\\node_modules\\rc-util\\es\\utils\\get' imported from C:\\Users\\devel\\Desktop\\Rodistaa\\node_modules\\.pnpm\\rc-util@5.44.4_react-dom@18.3.1_react@18.2.0\\node_modules\\rc-util\\es\\utils\\set.js"
      - generic [ref=e21]: This error happened while generating the page. Any console logs will be displayed in the terminal window.
```