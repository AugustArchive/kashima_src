import Document, { Head, Main, NextScript } from 'next/document';

export default class KashimaDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <link rel='/_next/static/css/style.chunk.css' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}