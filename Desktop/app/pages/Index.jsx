import React from 'react';
import Head from 'next/head';

export default () => (
  <React.Fragment>
    <Head>
      <title>Kashima | Desktop App</title>
    </Head>
    <div className='home'>
      <h1 className='title'>Welcome!</h1>
      <h2 className='subtitle'>You successfully made Electron + Next.js compatible! ^W^</h2>
    </div>
  </React.Fragment>
);