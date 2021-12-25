/// Copyright (c) 2019-2020 LiquidBlast
/// 
/// All code contained in this software ("Software") is copyrighted by LiquidBlast and 
/// may not be used outside this project without written permission from LiquidBlast. Art 
/// assets and libraries are licensed by their respective owners.
/// 
/// Permission is hearby granted to use the Software under the following terms and conditions:
/// * You will not attempt to reverse engineer or modify the Software.
/// * You will not sell or distribute the Software under your own name without written permission
/// from LiquidBlast.
/// 
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
/// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
/// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
/// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
/// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
/// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
/// SOFTWARE.

import 'package:kashima/services/models/generic_request.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:kashima/classes/other.dart';
import 'package:kashima/classes/news.dart';
import 'package:kashima/classes/user.dart';
import 'package:http/http.dart' as http;
import 'package:tuple/tuple.dart' as tuple;
import 'dart:convert';

/// All API endpoints as an enumeral
enum APIEndpoints {
  /// GET "/versions"
  Versions,
  
  /// GET "/stats"
  Statistics,

  /// GET "/accounts"
  AccountInfo,

  /// POST "/accounts/login"
  AccountLogin,

  /// POST "/accounts"
  UpdateAccount,

  /// POST "/accounts/jwt"
  MakeAccountJWT,

  /// POST "/accounts/jwt/refresh"
  RefreshAccountJWT,

  /// PUT "/accounts"
  MakeNewAccount,

  /// DELETE "/accounts"
  DeleteAccount,

  /// GET "/news"
  AllArticles,

  /// GET "/news/:uuid"
  ArticleInfo
}

/// Enumeral of avaliable methods to use
enum HttpMethod {
  /// GET request
  Get,

  /// PUT request
  Put,

  /// POST request
  Post,

  /// DELETE request
  Delete
}

extension APIEndpointExtension on APIEndpoints {
  /// Get the string equalivent of the endpoint to use
  String get value {
    switch (this) {
      case APIEndpoints.RefreshAccountJWT: return '/accounts/jwt/refresh';
      case APIEndpoints.MakeAccountJWT: return '/accounts/jwt';
      case APIEndpoints.MakeNewAccount: return '/accounts';
      case APIEndpoints.UpdateAccount: return '/accounts';
      case APIEndpoints.DeleteAccount: return '/accounts';
      case APIEndpoints.AccountLogin: return '/accounts/login';
      case APIEndpoints.AllArticles: return '/news';
      case APIEndpoints.ArticleInfo: return '/news/:uuid';
      case APIEndpoints.Statistics: return '/stats';
      case APIEndpoints.Versions: return '/version';
      default: return '/';
    }
  }

  /// Get what method to use
  HttpMethod get method {
    switch (this) {
      case APIEndpoints.RefreshAccountJWT: return HttpMethod.Post;
      case APIEndpoints.MakeAccountJWT: return HttpMethod.Post;
      case APIEndpoints.MakeNewAccount: return HttpMethod.Put;
      case APIEndpoints.UpdateAccount: return HttpMethod.Post;
      case APIEndpoints.DeleteAccount: return HttpMethod.Delete;
      case APIEndpoints.AccountLogin: return HttpMethod.Post;
      case APIEndpoints.AllArticles: return HttpMethod.Get;
      case APIEndpoints.ArticleInfo: return HttpMethod.Get;
      case APIEndpoints.Statistics: return HttpMethod.Get;
      case APIEndpoints.Versions: return HttpMethod.Get;
      default: return HttpMethod.Get;
    }
  }
}

extension HttpMethodExtension on HttpMethod {
  String get value {
    switch (this) {
      case HttpMethod.Delete: return 'delete';
      case HttpMethod.Post: return 'post';
      case HttpMethod.Put: return 'put';
      case HttpMethod.Get: return 'get';
      default: return 'get';
    }
  }
}

class APIService {
  /// Master key
  String masterKey;

  /// Base URL of the endpoint
  final String baseUrl = 'https://api.kashima.app';

  /// JWT token from the user
  String jwt;

  /// Makes a new API service
  APIService({ String jwt }) {
    this.jwt = jwt;

    this._loadEnv().then((value) {
      this.masterKey = value;
    });
  }

  Future<String> _loadEnv() async {
    var env = new DotEnv();
    var labels = await env.load('.env');

    return labels['MASTER_KEY'];
  }

  /// Make a request to the API (privately)
  Future<GenericRequest> _request({ 
    HttpMethod method, 
    APIEndpoints endpoint, 
    Map<String, dynamic> data, 
    Map<String, String> queries,
    List<String> parameters,
    Map<String, String> headers
  }) async {
    if (method == HttpMethod.Delete && data.length > 0) throw new Exception("[APIService#_request] DELETE methods are not allowed to pass in data!");
    if (method == HttpMethod.Get && data.length > 0) throw new Exception("[APIService#_request] GET methods are not allowed to pass in data!");
    if (endpoint.method.value != method.value) throw new Exception("[APIService#_request] Expected ${endpoint.method.value} but gotten ${method.value}");

    var url = this._makeUrl(endpoint, queries, parameters);
    http.Response res;

    switch (method) {
      case HttpMethod.Get: {
        res = await http.get(url, headers: headers);
      } break;

      case HttpMethod.Put: {
        dynamic body;
        if (!headers.containsKey("content-type")) headers["content-type"] = "application/json";
        if (data.length > 0) body = json.encode(data);

        res = await http.put(url, body: body, headers: headers);
      } break;

      case HttpMethod.Post: {
        dynamic body;
        if (!headers.containsKey("content-type")) headers["content-type"] = "application/json";
        if (data.length > 0) body = json.encode(data);

        res = await http.post(url, body: body, headers: headers);
      } break;

      case HttpMethod.Delete: {
        res = await http.delete(url, headers: headers);
      } break;

      default: throw new Exception("[APIService#_request] Method was not a HttpMethod (package:kashima/services/api_services.dart)");
    }

    return new GenericRequest(json.decode(res.body));
  }

  /// Private method to conjoin queries and parameters
  String _makeUrl(APIEndpoints endpoint, Map<String, String> queries, List<String> params) {
    if (queries.length > 0 && params.length > 0) throw new Exception("[APIService#_makeUrl] There should be no joining params and queries!");

    var url = '${this.baseUrl}${endpoint.value}';
    if (queries.length > 0) {
      var index = 0;
      queries.forEach((key, value) {
        final String prefix = index == 0 ? "?" : "&";
        url += "$prefix$key=$value";

        index++;
      });
    }

    if (params.length > 0) {
      params.forEach((key) {
        url += "/$key";
      });
    }

    return url;
  }

  /// Gets a list of all the articles published
  Future<List<NewsArticle>> getNewsArticles() async {
    var news = await this._request(
      endpoint: APIEndpoints.AllArticles,
      method: HttpMethod.Get
    );

    return (news.data as List<dynamic>).map((value) => new NewsArticle()).toList();
  }

  /// Gets an article by it's UUID
  Future<NewsArticle> getNewsArticle(String uuid) async {
    var article = await this._request(
      parameters: [uuid],
      endpoint: APIEndpoints.ArticleInfo,
      method: HttpMethod.Get
    );

    if (article.statusCode == 404) throw new Exception("[APIService#getNewsArticle] Article by $uuid was not found.");
    return new NewsArticle(
      content: article.data.content,
      author: article.data.author,
      uuid: article.data.uuid,
      date: article.data.date
    );
  }

  /// Gets statistics
  Future<APIStats> getStatistics() async {
    var stats = await this._request(
      endpoint: APIEndpoints.Statistics,
      method: HttpMethod.Get
    );

    return new APIStats(
      accounts: stats.data.accounts,
      articles: stats.data.articles,
      version: stats.data.version,
      plugins: stats.data.plugins,
      themes: stats.data.themes
    );
  }

  /// Check if an update is required
  Future<bool> requiresUpdate() async {
    var request = await this._request(
      endpoint: APIEndpoints.Versions,
      method: HttpMethod.Get
    );

    var gh = await http.get('https://api.github.com/repos/kashima-org/mobile-app/commits');
    List<dynamic> data = json.decode(gh.body);

    return request.data['mobile-app'] == data[0].sha;
  }

  /// Login a user and return it's data
  Future<KashimaUser> login(String username, String password) async {
    var request = await this._request(
      endpoint: APIEndpoints.AccountLogin,
      method: HttpMethod.Post,
      data: {
        'username': username,
        'password': password
      }
    );

    return request.success ? new KashimaUser(request.data) : null;
  }

  /// Fetch a user's data
  Future<KashimaUser> fetchUser(String username) async {
    var request = await this._request(
      endpoint: APIEndpoints.AccountInfo,
      method: HttpMethod.Get,
      queries: {
        'username': username
      }
    );

    if (request.statusCode == 404) throw new Exception("[APIService#fetchUser] Username by $username was not found!");
    return new KashimaUser(request.data);
  }

  /// Refreshes a user's JWT token
  Future<String> refreshToken(String userToken, String jwt) async {
    if (jwt == null) {
      var req = await this._request(
        endpoint: APIEndpoints.MakeAccountJWT,
        method: HttpMethod.Post,
        headers: {
          'Authorization': 'Account $userToken'
        }
      );

      // Data is a string so we return that duh
      return req.data;
    } else {
      var request = await this._request(
        endpoint: APIEndpoints.RefreshAccountJWT,
        method: HttpMethod.Post,
        headers: {
          'Authorization': 'Bearer $jwt'
        }
      );

      if (request.statusCode == 401) return null;
      else if (request.statusCode == 500) return null;
      else return request.data['token'];
    }
  }

  /// Updates a user's status
  Future<void> updateStatus(Status status, { String song }) async {
    if (status != Status.Listening && song != null) throw new Exception("[APIService#updateStatus] Status must be listening to append a song to it!");

    Map<String, dynamic> payload = {
      'status.current': status.value
    };

    if (song != null) payload['status.song'] = song;

    var request = await this._request(
      endpoint: APIEndpoints.UpdateAccount,
      method: HttpMethod.Post,
      data: {
        'data': {
          'set': payload
        }
      }
    );

    if (request.statusCode == 406) throw new Exception("[APIService#updateStatus] Unable to update status due to invalid payload! (package:kashima/services/api_service.dart)");
  }

  /// Delete the user's account
  Future<void> deleteUser(String username) async {
    await this._request(
      endpoint: APIEndpoints.DeleteAccount,
      method: HttpMethod.Post,
      headers: {
        'Authorization': this.masterKey
      },
      data: {
        'username': username
      }
    );
  }

  /// Make a new account
  /// 
  /// NOTICE: This is a tuple from the [tuple] package! The first item is a string (or null) why it self and the 2nd item is the user data itself!
  Future<tuple.Tuple2<String, KashimaUser>> createUser(String email, String username, String password) async {
    var request = await this._request(
      endpoint: APIEndpoints.MakeNewAccount,
      method: HttpMethod.Put,
      data: {
        'username': username,
        'password': password,
        'email': email
      }
    );

    return (request.statusCode == 500) 
      ? new tuple.Tuple2(request.message, null) 
      : new tuple.Tuple2(null, new KashimaUser(request.data));
  }

  /// Update a user's account
  Future<bool> updateUser(Map<String, Map<String, dynamic>> payload) async {
    var request = await this._request(
      endpoint: APIEndpoints.UpdateAccount,
      method: HttpMethod.Post,
      data: payload
    );

    return request.statusCode == 406;
  }
}

Type getPayload<S>() => S;