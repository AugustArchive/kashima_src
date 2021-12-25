/**
 * Grabs the latest commit of a repository
 * @param {import('@augu/orchid').HttpClient} http The Http Client
 * @param {'desktop-app' | 'mobile-app' | 'website' | 'browser'} repository The repository to fetch from
 * @returns {string} A sliced hash code of the commit
 */
module.exports = async function getCommitHash(http, repository) {
  const res = await http
    .request({
      method: 'get',
      url: `https://api.github.com/repos/kashima-org/${repository}/commits`
    }).execute();

  try {
    const data = res.json();
    return data[0].sha;
  } catch {
    return null;
  }
};