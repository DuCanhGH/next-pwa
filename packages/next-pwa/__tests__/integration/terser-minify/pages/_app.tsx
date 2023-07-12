import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <p id="app-root-text">This is placed at _app.tsx!</p>
    <Component {...pageProps} />
  </>
);

export default App;
