"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserEvent = exports.User = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _typedEventEmitter = require("./typed-event-emitter");
/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let UserEvent;
exports.UserEvent = UserEvent;
(function (UserEvent) {
  UserEvent["DisplayName"] = "User.displayName";
  UserEvent["AvatarUrl"] = "User.avatarUrl";
  UserEvent["Presence"] = "User.presence";
  UserEvent["CurrentlyActive"] = "User.currentlyActive";
  UserEvent["LastPresenceTs"] = "User.lastPresenceTs";
})(UserEvent || (exports.UserEvent = UserEvent = {}));
class User extends _typedEventEmitter.TypedEventEmitter {
  /**
   * The 'displayname' of the user if known.
   * @privateRemarks
   * Should be read-only
   */

  /**
   * The 'avatar_url' of the user if known.
   * @privateRemarks
   * Should be read-only
   */

  /**
   * The presence status message if known.
   * @privateRemarks
   * Should be read-only
   */

  /**
   * The presence enum if known.
   * @privateRemarks
   * Should be read-only
   */

  /**
   * Timestamp (ms since the epoch) for when we last received presence data for this user.
   * We can subtract lastActiveAgo from this to approximate an absolute value for when a user was last active.
   * @privateRemarks
   * Should be read-only
   */

  /**
   * The time elapsed in ms since the user interacted proactively with the server,
   * or we saw a message from the user
   * @privateRemarks
   * Should be read-only
   */

  /**
   * Whether we should consider lastActiveAgo to be an approximation
   * and that the user should be seen as active 'now'
   * @privateRemarks
   * Should be read-only
   */

  /**
   * The events describing this user.
   * @privateRemarks
   * Should be read-only
   */

  /**
   * Construct a new User. A User must have an ID and can optionally have extra information associated with it.
   * @param userId - Required. The ID of this user.
   */
  constructor(userId) {
    super();
    this.userId = userId;
    (0, _defineProperty2.default)(this, "modified", -1);
    (0, _defineProperty2.default)(this, "displayName", void 0);
    (0, _defineProperty2.default)(this, "rawDisplayName", void 0);
    (0, _defineProperty2.default)(this, "avatarUrl", void 0);
    (0, _defineProperty2.default)(this, "presenceStatusMsg", void 0);
    (0, _defineProperty2.default)(this, "presence", "offline");
    (0, _defineProperty2.default)(this, "lastActiveAgo", 0);
    (0, _defineProperty2.default)(this, "lastPresenceTs", 0);
    (0, _defineProperty2.default)(this, "currentlyActive", false);
    (0, _defineProperty2.default)(this, "events", {});
    this.displayName = userId;
    this.rawDisplayName = userId;
    this.updateModifiedTime();
  }

  /**
   * Update this User with the given presence event. May fire "User.presence",
   * "User.avatarUrl" and/or "User.displayName" if this event updates this user's
   * properties.
   * @param event - The `m.presence` event.
   *
   * @remarks
   * Fires {@link UserEvent.Presence}
   * Fires {@link UserEvent.DisplayName}
   * Fires {@link UserEvent.AvatarUrl}
   */
  setPresenceEvent(event) {
    if (event.getType() !== "m.presence") {
      return;
    }
    const firstFire = this.events.presence === null;
    this.events.presence = event;
    const eventsToFire = [];
    if (event.getContent().presence !== this.presence || firstFire) {
      eventsToFire.push(UserEvent.Presence);
    }
    if (event.getContent().avatar_url && event.getContent().avatar_url !== this.avatarUrl) {
      eventsToFire.push(UserEvent.AvatarUrl);
    }
    if (event.getContent().displayname && event.getContent().displayname !== this.displayName) {
      eventsToFire.push(UserEvent.DisplayName);
    }
    if (event.getContent().currently_active !== undefined && event.getContent().currently_active !== this.currentlyActive) {
      eventsToFire.push(UserEvent.CurrentlyActive);
    }
    this.presence = event.getContent().presence;
    eventsToFire.push(UserEvent.LastPresenceTs);
    if (event.getContent().status_msg) {
      this.presenceStatusMsg = event.getContent().status_msg;
    }
    if (event.getContent().displayname) {
      this.displayName = event.getContent().displayname;
    }
    if (event.getContent().avatar_url) {
      this.avatarUrl = event.getContent().avatar_url;
    }
    this.lastActiveAgo = event.getContent().last_active_ago;
    this.lastPresenceTs = Date.now();
    this.currentlyActive = event.getContent().currently_active;
    this.updateModifiedTime();
    for (const eventToFire of eventsToFire) {
      this.emit(eventToFire, event, this);
    }
  }

  /**
   * Manually set this user's display name. No event is emitted in response to this
   * as there is no underlying MatrixEvent to emit with.
   * @param name - The new display name.
   */
  setDisplayName(name) {
    const oldName = this.displayName;
    this.displayName = name;
    if (name !== oldName) {
      this.updateModifiedTime();
    }
  }

  /**
   * Manually set this user's non-disambiguated display name. No event is emitted
   * in response to this as there is no underlying MatrixEvent to emit with.
   * @param name - The new display name.
   */
  setRawDisplayName(name) {
    this.rawDisplayName = name;
  }

  /**
   * Manually set this user's avatar URL. No event is emitted in response to this
   * as there is no underlying MatrixEvent to emit with.
   * @param url - The new avatar URL.
   */
  setAvatarUrl(url) {
    const oldUrl = this.avatarUrl;
    this.avatarUrl = url;
    if (url !== oldUrl) {
      this.updateModifiedTime();
    }
  }

  /**
   * Update the last modified time to the current time.
   */
  updateModifiedTime() {
    this.modified = Date.now();
  }

  /**
   * Get the timestamp when this User was last updated. This timestamp is
   * updated when this User receives a new Presence event which has updated a
   * property on this object. It is updated <i>before</i> firing events.
   * @returns The timestamp
   */
  getLastModifiedTime() {
    return this.modified;
  }

  /**
   * Get the absolute timestamp when this User was last known active on the server.
   * It is *NOT* accurate if this.currentlyActive is true.
   * @returns The timestamp
   */
  getLastActiveTs() {
    return this.lastPresenceTs - this.lastActiveAgo;
  }
}
exports.User = User;
//# sourceMappingURL=user.js.map