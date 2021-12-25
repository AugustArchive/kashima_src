import Router from 'next/router';

/**
 * Retrives the token or `null` if not found
 * @param {import('next').NextPageContext} context The page context
 * @returns {string | null} Returns the token or `null` if the user isn't logged in
 */
export default function getToken(context) {
  const token = localStorage.getItem('token');

  // If we have access to the request from the Context
  if (context.req && token === null) {
    context.res.writeHead(302, { Location: '/login' });
    context.res.end();
    return null;
  }

  // If not, we just use the Router itself
  if (token === null) {
    Router.push('/login');
  }

  return token;
}