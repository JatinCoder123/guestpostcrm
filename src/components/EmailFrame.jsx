// Renders email HTML inside a sandboxed iframe so the email keeps its own
// <style> blocks and the app's CSS (Tailwind preflight, prose, ...) can't
// restyle it. Scripts are blocked by the empty sandbox.
const EmailFrame = ({ html = "", className = "", title = "Email Preview" }) => (
  <iframe
    title={title}
    className={`border-0 ${className}`}
    sandbox=""
    srcDoc={`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body {
              margin: 0;
              padding: 16px;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `}
  />
);

export default EmailFrame;
