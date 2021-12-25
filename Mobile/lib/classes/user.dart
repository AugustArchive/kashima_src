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

import 'package:kashima/abstractions/serializable.dart';
import 'package:kashima/services/api_service.dart';
import 'dart:async';
import 'dart:core';

/// User class to type-check if were adding values correctly
class KashimaUser {
  /// List of blocked users
  List<String> blockedUsers;

  /// All connections the user has set
  AccountConnections connections;

  /// All permissions the user has
  AccountPermissions permissions;

  /// A small description of themselves
  String description;
  
  /// List of usernames that the user is following
  List<UserRelationship> following;

  /// List of usernames that are following this user
  List<UserRelationship> followers;

  /// Their avatar URL
  String avatarUrl;

  /// The user's username
  String username;

  /// [bool] if an admin has disabled their account
  bool disabled;

  /// List of usernames that are the user's friends
  List<UserRelationship> friends;

  /// The user's status
  AccountStatus status;

  /// The user's API token
  String _token;

  /// The user's JWT token
  String jwt;

  /// Construct a new instance of a [KashimaUser]
  KashimaUser(Map<String, dynamic> data) {
    this.blockedUsers = data['blockedUsers'] ?? [];
    this.connections = new AccountConnections(data['connections']);
    this.permissions = new AccountPermissions(data['permissions']);
    this.description = data['description'];
    this.following = (data['following'] as List<dynamic>).map((value) => new UserRelationship(value)).toList();
    this.followers = (data['followers'] as List<dynamic>).map((value) => new UserRelationship(value)).toList();
    this.avatarUrl = data['avatarUrl'];
    this.username = data['username'];
    this.disabled = data['disabled'];
    this.friends = (data['friends'] as List<dynamic>).map((value) => new UserRelationship(value)).toList();
    this._token = data['token'];
    this.status = new AccountStatus(status: fromValue(data['status']['type']), listening: data['status']['listening']);
    
    // JWT doesn't get injected if the account was first initalized (TODO: fix that)
    if (data['jwt'] == null) {
      this._api.refreshToken(this._token, null).then((value) {
        this.jwt = value;
      });

      Timer(new Duration(days: 7), () {
        this._api.refreshToken(this._token, this.jwt)
          .then((value) {
            if (value == null) return;
            this.jwt = value;
          });
      });
    } else {
      this.jwt = data['jwt'];
      Timer(new Duration(days: 7), () {
        this._api.refreshToken(this._token, this.jwt)
          .then((value) {
            if (value == null) return;
            this.jwt = value;
          });
      });
    }
  }

  APIService get _api => new APIService(jwt: this.jwt);
}

/// Dummy class to fill in as "user.status"
class AccountStatus implements Serializable<AccountStatus> {
  /// The user's current status
  Status status;

  /// The song they are listening to (if the status is listening)
  String listening;

  /// Construct a new instance of the [AccountStatus] class
  AccountStatus({ Status status, String listening }) {
    this.listening = listening;
    this.status = status;
  }

  /// Serialize this class as a JSON object
  Map<String, String> toJson() => {
    'listening': this.listening,
    'status': this.status.value
  };

  /// Deserialize this class from a JSON structure
  AccountStatus fromJson(Map<String, dynamic> json) => new AccountStatus(
    listening: json['listening'] ?? null,
    status: fromValue(json['status'])
  );

  /// Sets the current status to Offline
  Future<void> offline(KashimaUser user) async {
    var api = new APIService(jwt: user.jwt);
    await api.updateStatus(Status.Offline);
  }

  /// Sets the current status to Online
  Future<void> online(KashimaUser user) async {
    var api = new APIService(jwt: user.jwt);
    await api.updateStatus(Status.Online);
  }

  /// Sets the current status to Listening
  Future<void> listeningTo(KashimaUser user, String song) async {
    var api = new APIService(jwt: user.jwt);
    await api.updateStatus(Status.Listening, song: song);
  }
}

/// Dummy class to fill in as "user.permissions"
class AccountPermissions implements Serializable<AccountPermissions> {
  /// Integer of the allowed permissions
  int allowed;

  /// Integer of the denied permissions
  int denied;

  /// Create a new instance of the [AccountPermissions] class
  AccountPermissions(Map<String, dynamic> data) {
    this.allowed = data['allowed'] ?? 0;
    this.denied = data['denied'] ?? 0;
  }

  /// Converts this class into a JSON structure
  Map<String, int> toJson() => {
    'allowed': this.allowed,
    'denied': this.denied
  };

  /// Deserializes a JSON string to this specific structure
  AccountPermissions fromJson(Map<String, dynamic> json) => new AccountPermissions(json);
}

/// Dummy class to fill in as "user.connections"
class AccountConnections implements Serializable<AccountConnections> {
  /// A gravatar URL if it's not null
  String gravatar;

  /// Create new instance of the [AccountConnections] class
  AccountConnections(Map<String, dynamic> data) {
    this.gravatar = data['gravatar'] ?? null;
  }

  /// Serialize this class as a JSON structure
  Map<String, String> toJson() => {
    gravatar: this.gravatar
  };

  /// Deseralize this from a JSON object
  AccountConnections fromJson(Map<String, dynamic> json) => new AccountConnections(json);
}

/// Dummy object of a user relationship
class UserRelationship {
  /// The relationship's avatar
  String avatarUrl;

  /// The relationship's username
  String username;

  /// The relationship's status
  AccountStatus status;

  /// Construct a new instance of a [UserRelationship]
  UserRelationship(Map<String, dynamic> data) {
    this.avatarUrl = data['avatarUrl'];
    this.username = data['username'];
    this.status = new AccountStatus(status: fromValue(data['status']['type']), listening: data['status']['listening']);
  }

  /// Fetch all the data of this relationship
  Future<KashimaUser> fetch()  {
    var api = new APIService();
    return api.fetchUser(this.username);
  }
}

/// Enumeral object of a "Permission"
enum Permission {
  /// Ability to create news articles
  CreateNews,

  /// Ability to edit news articles
  EditNews,

  /// Ability to delete news articles
  DeleteNews,

  /// Ablility to publish a plugin/theme
  Publish
}

/// Enumeral of the user's status
enum Status {
  /// User is offline, the application isn't opened
  Offline,

  /// User is online, they aren't listening to any music
  Online,

  /// User is away, they have the application on but not using it
  Away,

  /// User is listening to some jams!
  Listening
}

/// Extension for the [Permission] enumeral
extension PermissionExtension on Permission {
  /// Returns the raw value of the permission
  int get value {
    switch (this) {
      case Permission.CreateNews: return 1 << 1;
      case Permission.DeleteNews: return 1 << 3;
      case Permission.EditNews: return 1 << 2;
      case Permission.Publish: return 1 << 4;
      default: return 0;
    }
  }
}

/// Extension for the [Status] enumeral
extension StatusExtension on Status {
  /// Returns the raw value of the status
  String get value {
    switch (this) {
      case Status.Listening: return 'listening';
      case Status.Offline: return 'offline';
      case Status.Online: return 'online';
      case Status.Away: return 'away';
      default: return 'unknown';
    }
  }
}

Status fromValue(String status) {
  switch (status) {
    case 'listening': return Status.Listening;
    case 'offline': return Status.Offline;
    case 'online': return Status.Online;
    case 'away': return Status.Away;
    default: return Status.Offline;
  }
}