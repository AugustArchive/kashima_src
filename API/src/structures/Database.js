/*
 * Copyright (c) 2019-2020 LiquidBlast
 * 
 * All code contained in this software ("Software") is copyrighted by LiquidBlast and 
 * may not be used outside this project without written permission from LiquidBlast. Art 
 * assets and libraries are licensed by their respective owners.
 * 
 * Permission is hearby granted to use the Software under the following terms and conditions:
 * * You will not attempt to reverse engineer or modify the Software.
 * * You will not sell or distribute the Software under your own name without written permission 
 *   from LiquidBlast.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const AccountModel = require('./models/AccountModel');
const ThemeModel = require('./models/ThemeModel');
const NewsModel = require('./models/NewsModel');
const mongoose = require('mongoose');
const Logger = require('./Logger');
const crypto = require('crypto');

module.exports = class Database {
  /**
   * Creates a new instance of the `Database` class
   * @param {string} url The URL to connect to MongoDB
   */
  constructor(url) {
    /** Logger instance */
    this.logger = new Logger('Database');

    /** URL to connect to MongoDB */
    this.url = url;
  }

  /** Creates a new connection pool */
  async connect() {
    const m = await mongoose.connect(this.url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoIndex: false
    });

    m.connection.on('error', (error) => this.logger.error('Unexpected error from MongoDB:', error));
    m.connection.once('open', () => this.logger.info('Opened a new connection pool'));

    this.logger.info(`Connected to the database with URI: ${this.logger.colors.green(this.url)}`);
    this.m = m;
    this.admin = m.connection.db.admin();
  }

  /**
   * Gets a user's account by their authenication token
   * @param {string} token The token to find the user's data
   */
  getAccountByToken(token) {
    return AccountModel
      .findOne({ token })
      .exec();
  }

  /**
   * Get a user's account by the JWT token that was generated
   * @param {string} token The bearer token
   */
  getAccountByJWT(token) {
    return AccountModel
      .findOne({ jwt: token })
      .exec();
  }

  /**
   * Gets a user's account
   * @param {'email' | 'username'} type The type to fetch from
   * @param {string} data The username or email to fetch from
   * @returns {Promise<import('./models/AccountModel').AccountModel | null>} The account or `null` if not found
   */
  getAccount(type, data) {
    return AccountModel
      .findOne({ [type]: data })
      .exec();
  }

  /**
   * Gets a theme's metadata
   * @param {string} id The theme's ID
   */
  getTheme(id) {
    return ThemeModel
      .findOne({ id })
      .exec();
  }

  /**
   * Gets news metadata
   * @param {string} uuid The UUID of the news id
   */
  getNews(uuid) {
    return NewsModel
      .findOne({ uuid })
      .exec();
  }

  /**
   * Sets the user's current status
   * @param {string} username The account's username
   * @param {'online' | 'listening' | 'offline'} type The type to set
   * @param {string} song The song itself
   */
  async setStatus(username, type, song) {
    return AccountModel
      .updateOne({ username }, {
        $set: {
          'status.current': type,
          'status.song': song
        }
      }).exec();
  }

  /**
   * Update an account's metadata
   * @param {string} username The account's username
   * @param {'set' | 'push'} type The type to update
   * @param {Omit<import('./models/AccountModel').AccountModel, ''>} data The data to inject
   */
  updateAccount(username, type, data) {
    const t = `$${type}`;
    return AccountModel
      .updateOne({ username }, { [t]: data })
      .exec();
  }

  /**
   * Update a theme's metadata
   * @param {string} id The theme's ID
   * @param {'set' | 'push'} type The type to update
   * @param {Omit<import('./models/ThemeModel').ThemeModel, ''>} data The data to update
   */
  updateTheme(id, type, data) {
    return ThemeModel
      .updateOne({ id }, { [`$${type}`]: data })
      .exec();
  }

  /**
   * Update a news article's metadata
   * @param {string} id The article's ID
   * @param {'set' | 'push'} type The type to update
   * @param {Omit<import('./models/NewsModel').NewsModel, ''>} data The data to update
   */
  updateNewsArticle(id, type, data) {
    return NewsModel
      .updateOne({ uuid: id }, { [`$${type}`]: data })
      .exec();
  }

  /**
   * Removes an account from the database
   * @param {string} username The account's username
   */
  deleteAccount(username) {
    return AccountModel
      .deleteOne({ username })
      .exec();
  }

  /**
   * Removes a theme from the database
   * @param {string} id The theme's ID
   */
  deleteTheme(id) {
    return ThemeModel
      .deleteOne({ id })
      .exec();
  }

  /**
   * Removes a news article from the database
   * @param {string} uuid The news article's UUID
   */
  deleteNewsArticle(uuid) {
    return NewsModel
      .deleteOne({ uuid })
      .exec();
  }

  /**
   * Creates a new user account
   * @param {string} username The account's username for their vanity url (example: https://kashima.app/users/<username>)
   * @param {string} email The account's email address
   * @param {string} password The account's password to be hashed
   */
  createAccount(username, email, password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const pass = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const token = crypto.randomBytes(32).toString('hex');

    const query = new AccountModel({
      permissions: {
        allowed: 0,
        denied: 0
      },
      connections: {
        gravatar: null
      },
      description: '',
      avatarUrl: 'https://cdn.kashima.app/default.png',
      following: [],
      followers: [],
      activated: false,
      username,
      password: pass.toString('hex'),
      friends: [],
      status: {
        current: 'offline',
        song: null
      },
      token,
      email,
      salt,
      jwt: require('../util/JWT').encode(username, pass)
    });

    query.save();
    return query;
  }

  /**
   * Creates a theme
   * @param {import('./models/ThemeModel').ThemeModel} model The model to inject
   */
  createTheme(model) {
    const query = new ThemeModel(model);
    query.save();

    return query;
  }

  /**
   * Creates a news article
   * @param {string} author The author's username
   * @param {string} content The content of the article
   */
  createNewsArticle(author, content) {
    const query = new NewsModel({
      createdAt: Date.now(),
      content,
      author,
      uuid: crypto.randomBytes(16).toString('hex')
    });

    query.save();
    return query;
  }

  /**
   * Count all of the documents
   */
  async count() {
    return {
      accounts: await AccountModel.countDocuments().exec(),
      articles: await NewsModel.countDocuments().exec(),
      themes: await ThemeModel.countDocuments().exec()
    };
  }
};